# alpine for the win
FROM node:alpine

RUN apk update

#
# Setup Postgres
#
#RUN /etc/init.d/postgresql start && \
# psql --command "CREATE USER oneplaceillinois WITH SUPERUSER PASSWORD 'opillines123';" && \
# createdb -O docker docker

#
# Do Node and NPM stuff
#

RUN mkdir -p /usr/src/oneplace-illinois-api

WORKDIR /usr/src/oneplace-illinois-api

COPY ["package.json", "package-lock.json*", "./"]

ENV NODE_ENV="production"

# npm ci is faster than npm install BUT requires package-lock.json
# node_env production makes npm ci install only dependencies (but put flag just to make sure)
RUN npm ci --only=production

# After install node_modules, copy everything
COPY . .

#CMD ["NODE_ENV=test", "node", "./src/workers/parse-course-csv.js"]
#CMD ["npm", "start"]
