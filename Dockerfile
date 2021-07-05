FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm ci --only=production

EXPOSE 80

ENV PORT=80

CMD [ "npm", "start" ]