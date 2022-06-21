FROM node:18-alpine

ADD package.json package.json
ADD package-lock.json package-lock.json
RUN npm i

ADD prisma/ prisma/

RUN npm run prisma-build

ADD . .

RUN npm run build

ENV NODE_ENV production

CMD npm run start
