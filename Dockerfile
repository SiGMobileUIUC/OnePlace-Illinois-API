FROM node:alpine

RUN mkdir /usr/src/node-app

WORKDIR /usr/src/node-app

COPY package.json ./

RUN npm install --only=production

COPY . .

ENV PORT=80

EXPOSE 80

CMD [ "npm", "start"]
