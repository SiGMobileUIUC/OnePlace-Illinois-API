FROM node:alpine

RUN mkdir -p /usr/src/node-app && chown -R node:node /usr/src/node-app

WORKDIR /usr/src/node-app

COPY package.json ./

USER node

RUN npm install --only=production

COPY --chown=node:node . .

ENV PORT=80

EXPOSE 80 # exposing 80 not 3000
