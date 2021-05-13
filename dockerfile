FROM node:16.1.0-alpine

ARG REMIX_AUTH

ADD . .

RUN npm i

RUN npm run build

ENV NODE_ENV production

CMD npm run start
