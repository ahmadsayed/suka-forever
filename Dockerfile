FROM node:18.12-alpine3.17
RUN apk add --update --no-cache python3 make gcc  alpine-sdk &&  mkdir -p /app/frontend && mkdir /app/blockchain/
WORKDIR "/app"
COPY package.json package.json
RUN npm install
COPY src src
COPY frontend/dist frontend/dist
COPY blockchain/.env blockchain/.env
EXPOSE 9090
CMD node src/index.js