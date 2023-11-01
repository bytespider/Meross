import got from 'got'

export class HTTP {
    host;

    constructor(host) {
        this.host = host;
    }

    /**
     * 
     * @param {Message} message 
     * @returns 
     */
    async send(message) {
        try {
            let response = await got.post(`http://${this.host}/config`, {
                timeout: {
                    request: 10000
                },
                json: message
            }).json();

            return response;
        } catch (error) {
            switch (error.code) {
                case 'ECONNREFUSED':
                    throw new Error(`Host refused connection. Is the device IP '${this.host}' correct?`);

                case 'ETIMEDOUT':
                    let hint = '';
                    if (this.host === '10.10.10.1') {
                        hint = "\nAre you connected to the device's Access Point which starts with 'Meross_'?";
                    }
                    throw new Error(`Timeout awaiting ${message.header.namespace} for 10000s.${hint}`);
            }
        }
    }
}