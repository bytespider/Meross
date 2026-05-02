import net from 'net';
import { TLSSocket } from 'tls';
import { Request, RequestInfo, RequestInit, Response } from 'undici';
import { Parser } from './parser.js';

export async function fetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  if (!(input instanceof Request)) {
    input = new Request(input, init);
  }

  return new Promise<Response>(async (resolve, reject) => {
    const { hostname, port, protocol } = new URL(input.url);
    const isHttps = protocol === 'https:';

    let socket: net.Socket | TLSSocket;
    const parser = new Parser();

    try {
      socket = net.createConnection(Number(port) || 80, hostname);
      if (isHttps) {
        socket = new TLSSocket(socket, {});
      }

      socket.on('error', (err) => {
        reject(err);
      });

      socket.on('connect', async () => {
        let headerData = `${input.method} ${new URL(input.url).pathname} HTTP/1.1\r\n`;
        headerData += `Host: ${hostname}${port ? `:${port}` : ''}\r\n`;
        for (const [key, value] of input.headers) {
          headerData += `${key}: ${value}\r\n`;
        }
        headerData += '\r\n';

        socket.write(headerData);

        // Write request body manually — ReadableStream.pipeTo() requires a
        // Web Streams WritableStream, not a net.Socket.
        if (input.body) {
          const reader = input.body.getReader();
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              socket.write(value);
            }
          } finally {
            reader.releaseLock();
          }
          socket.end();
        }
      });

      socket.on('data', (data) => {
        const response = parser.write(data);
        if (response) {
          resolve(response);
        }
      });

      socket.on('end', () => {
        socket?.destroy();
      });

      socket.on('close', () => {
        // parser is captured in closure, no need to null out
      });
    } catch (err) {
      reject(err);
    }
  });
}
