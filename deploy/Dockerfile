#--------------------------------------------------------#
FROM node:18.18.2 AS builder
WORKDIR /app

ARG PKG_BUILD_TARGET=node18-linux-x64

RUN npm install -g pkg
### Only for pkg cache
RUN echo '// sample ' > ./sample.js
RUN pkg -t ${PKG_BUILD_TARGET}  sample.js
RUN rm ./sample.js

COPY package*.json ./
RUN npm install

# COPY . .
COPY ./public ./public
COPY ./resources ./resources
COPY ./src ./src

# RUN npm run build
RUN pkg .

#--------------------------------------------------------#

FROM node:18.18.2
WORKDIR /app

COPY ./deploy/package*.json ./
RUN npm install

COPY ./deploy/sample_data ./data
COPY ./deploy/sample.env ./.env

COPY ./deploy/docker-entrypoint.sh ./
RUN chmod +x ./docker-entrypoint.sh

COPY --from=builder /app/dist/demo-github-ci-1 ./demo-service-api

ENTRYPOINT ["./docker-entrypoint.sh"]
