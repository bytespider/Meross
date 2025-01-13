FROM eclipse-mosquitto:1.6.15-openssl

COPY mosquitto/basic.conf ./mosquitto/config/mosquitto.conf
RUN apk add --update --no-cache openssl && \
    mkdir /mosquitto/config/certs && \
    cd /mosquitto/config/certs && \
    openssl genrsa -out ca.key 2048 && \
    openssl req -x509 -new -nodes -key ca.key -days 3650 -out ca.crt -subj '/CN=My Root' && \
    openssl req -new -nodes -out server.csr -newkey rsa:2048 -keyout server.key -subj '/CN=Mosquitto' && \
    openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt -days 3650 && \
    c_rehash . && \
    chown -R mosquitto:mosquitto /mosquitto && \
    chmod 600 /mosquitto/config/certs/*

EXPOSE 1883
EXPOSE 8883