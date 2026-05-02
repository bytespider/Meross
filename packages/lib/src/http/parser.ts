import { Response } from 'undici';

export enum State {
  START = 'START',
  STATUS_LINE = 'STATUS_LINE',
  HEADERS = 'HEADERS',
  BODY = 'BODY',
  CHUNK_SIZE = 'CHUNK_SIZE',
  CHUNK_DATA = 'CHUNK_DATA',
  CHUNK_TRAILER = 'CHUNK_TRAILER',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
}

/**
 * HTTP Parser
 * Models a state machine to parse HTTP responses.
 */
export class Parser {
  private state: State = State.START;

  // Buffer to hold incoming data
  private buffer: Uint8Array = new Uint8Array();

  private currentResponse?: Response;

  // Pointer within the buffer
  private position: number = 0;

  private contentLength: number = 0;

  write(data: Uint8Array) {
    // Append new data to buffer
    const newBuffer = new Uint8Array(this.buffer.length + data.length);
    newBuffer.set(this.buffer);
    newBuffer.set(data, this.buffer.length);
    this.buffer = newBuffer;

    // Process the buffer
    this.process();

    // If headers transitioned state to BODY at the exact buffer boundary
    // (e.g. Content-Length: 0 or no Content-Length header), process the
    // body now since no more data will arrive for a zero-length body.
    if (this.state === State.BODY && this.position >= this.buffer.length) {
      this.handleBody();
    }

    if (this.state === State.COMPLETE && this.currentResponse) {
      // Return the completed response
      return this.currentResponse;
    }
  }

  private process() {
    while (this.position < this.buffer.length) {
      // Take a snapshot of the current state
      const previousState = this.state;

      switch (this.state) {
        case State.START:
          this.handleStart();
          break;

        case State.COMPLETE:
        case State.ERROR:
          // No further processing needed
          return;

        case State.STATUS_LINE:
          this.handleStatusLine();
          break;

        case State.HEADERS:
          this.handleHeaders();
          break;

        case State.BODY:
          this.handleBody();
          break;

        default:
          this.state = State.ERROR;
          break;
      }

      if (this.state === previousState) {
        // No state change, wait for more data
        break;
      }
    }
  }

  private handleStart() {
    const [newlineIndex, _] = this.findNewlineIndex();
    if (newlineIndex === -1) {
      // Incomplete data
      return;
    }

    const line = this.readLine(this.position, this.position + newlineIndex);
    if (line.startsWith('HTTP/')) {
      this.state = State.STATUS_LINE;
      this.currentResponse = new Response();
    } else {
      this.state = State.ERROR;
    }
  }

  private handleStatusLine() {
    const [newlineIndex, newlineLength] = this.findNewlineIndex();
    if (newlineIndex === -1) {
      // Incomplete data
      return;
    }
    const line = this.readLine(this.position, this.position + newlineIndex);
    this.parseStatusLine(line);
    this.position += newlineIndex + newlineLength; // Move past newline
  }

  private parseStatusLine(line: string) {
    // Example: HTTP/1.1 200 OK
    const parts = line.split(' ');
    if (parts.length < 3) {
      this.state = State.ERROR;
      return;
    }

    this.currentResponse = new Response(null, {
      ...this.currentResponse,
      status: parseInt(parts[1], 10),
      statusText: parts.slice(2).join(' '),
    });

    this.state = State.HEADERS;
  }

  private handleHeaders() {
    const [newlineIndex, newlineLength] = this.findNewlineIndex();
    if (newlineIndex === -1) {
      // Incomplete data
      return;
    }

    while (true) {
      const [newlineIndex, newlineLength] = this.findNewlineIndex();
      if (newlineIndex === -1) {
        // Incomplete data
        return;
      }

      const line = this.readLine(this.position, this.position + newlineIndex);
      if (line === '') {
        // End of headers
        this.position += newlineLength; // Move past newline
        this.state = State.BODY;
        return;
      }

      this.parseHeaderLine(line);
      this.position += newlineIndex + newlineLength; // Move past newline
    }
  }

  private parseHeaderLine(line: string) {
    const separatorIndex = line.indexOf(':');
    if (separatorIndex === -1) {
      this.state = State.ERROR;
      return;
    }

    const name = line.substring(0, separatorIndex).trim();
    const value = line.substring(separatorIndex + 1).trim();

    if (this.currentResponse) {
      this.currentResponse.headers.append(name, value);
    }
  }

  private handleBody() {
    const contentLengthHeader =
      this.currentResponse?.headers.get('Content-Length');
    this.contentLength = contentLengthHeader
      ? parseInt(contentLengthHeader, 10)
      : 0;

    const remainingBuffer = this.buffer.length - this.position;
    if (remainingBuffer < this.contentLength) {
      // Incomplete body
      return;
    }

    const bodyBytes = this.buffer.subarray(
      this.position,
      this.position + this.contentLength,
    );
    this.position += this.contentLength;

    // For status codes that forbid a body (204 No Content, 304 Not Modified),
    // pass null as the body instead of bodyBytes.
    const status = this.currentResponse?.status ?? 200;
    const bodyForInit = [204, 304].includes(status)
      ? null
      : bodyBytes;

    this.currentResponse = new Response(bodyForInit, {
      status,
      statusText: this.currentResponse?.statusText,
      headers: this.currentResponse?.headers,
    });

    this.state = State.COMPLETE;
  }

  // returns the index of the next newline (CRLF or LF) from the current position, and the length of the newline
  private findNewlineIndex(): [number, number] {
    // Search for CRLF (\r\n) or the non-standard LF (\n) line ending
    for (let i = this.position; i < this.buffer.length; i++) {
      if (this.buffer[i] === 0x0d && this.buffer[i + 1] === 0x0a) {
        return [i - this.position, 2]; // CRLF
      } else if (this.buffer[i] === 0x0a) {
        return [i - this.position, 1]; // LF
      }
    }
    return [-1, 0]; // Not found
  }

  private readLine(startIndex: number, endIndex: number): string {
    const lineBytes = this.buffer.subarray(startIndex, endIndex);
    return new TextDecoder().decode(lineBytes);
  }
}
