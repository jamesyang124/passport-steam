FROM node:18-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package.json ./

USER node

RUN npm install

COPY --chown=node:node . .

RUN cd /home/node/app/@passport-next/passport-openid && npm install
RUN cd /home/node/app

EXPOSE 3000

CMD [ "npm", "run", "example-router" ]