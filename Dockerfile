# alpine for the win
FROM node:alpine

RUN apk update

RUN mkdir -p /usr/src/oneplace-illinois-api

WORKDIR /usr/src/oneplace-illinois-api

COPY ["package.json", "package-lock.json*", "./"]

ENV NODE_ENV="production"

# npm ci is faster than npm install BUT requires package-lock.json
RUN npm ci --only=production

# After install node_modules, copy everything
COPY . .

#CMD ["NODE_ENV=test", "node", "./src/workers/parse-course-csv.js"]
#CMD ["npm", "start"]
