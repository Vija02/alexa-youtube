FROM node:alpine as dependencies

WORKDIR /temp-build

COPY package*.json ./
COPY yarn.lock ./
RUN yarn --prod --ignore-engines

COPY . .

FROM mhart/alpine-node:base

RUN apk add --no-cache ffmpeg

WORKDIR /var/www/backend/

COPY --from=dependencies /temp-build/ ./

EXPOSE 4000
CMD ["node", "./index.js"]