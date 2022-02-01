FROM node:16.13.2-alpine

ADD package.json package.json
ADD package-lock.json package-lock.json

RUN npm i

ADD . .

RUN npm run build

ENV NODE_ENV production

CMD npm run start
