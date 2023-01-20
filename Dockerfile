FROM ipfs/go-ipfs:latest as ipfs


FROM node:buster
#RUN apk add --update --no-cache python3 make gcc  alpine-sdk &&  mkdir -p /app/frontend && mkdir /app/blockchain/
RUN apt update && apt install -y python3 build-essential
COPY --from=ipfs /usr/local/bin/ipfs /usr/local/bin/ipfs
COPY --from=ipfs /usr/local/bin/start_ipfs  /usr/local/bin/start_ipfs
COPY --from=ipfs /usr/local/bin/container_init_run /usr/local/bin/container_init_run
COPY --from=ipfs /usr/local/bin/fusermount /usr/local/bin/fusermount
COPY --from=ipfs /sbin/su-exec /sbin/su-exec
COPY --from=ipfs /etc/ssl/certs /etc/ssl/certs
COPY --from=ipfs /lib/libdl.so.2 /lib/
COPY --from=ipfs /usr/lib/libssl.so* /usr/lib/
COPY --from=ipfs /usr/lib/libcrypto.so* /usr/lib/
RUN ipfs init 

WORKDIR "/app"
COPY package.json package.json
RUN npm install
COPY src src
COPY frontend/dist frontend/dist
COPY .env blockchain/.env
COPY bootstrap.sh bootstrap.sh
EXPOSE 9090
EXPOSE 4001
EXPOSE 5001
EXPOSE 8080
EXPOSE 8081

CMD [ "/bin/bash", "/app/bootstrap.sh"]