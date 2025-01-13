FROM eclipse-mosquitto:1.6.15-openssl

COPY mosquitto/basic.conf ./mosquitto/config/
RUN apk add --update --no-cache openssl && \
    mkdir ./mosquitto/config/certs && \
    cd ./mosquitto/config/certs && \
    openssl req -nodes -new -x509 -keyout ca.key -out ca.crt -subj "/CN=mosquitto" -days 3650 && \
    openssl req -sha256 -nodes -newkey rsa:2048 -keyout server.key -out server.csr -subj "/CN=localhost-mosquitto" && \
    openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt -days 3650
RUN chown -R mosquitto:mosquitto ./mosquitto

EXPOSE 1883
EXPOSE 8883