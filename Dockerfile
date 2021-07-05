FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN apt-get update

RUN apt-get install -y chromium

RUN npm install

COPY . .

RUN npm ci --only=production

EXPOSE 80

EXPOSE 6379

ENV PORT=80

CMD [ "npm", "start"]