FROM node:18

COPY . /app
WORKDIR /app

RUN npm install

ENTRYPOINT ["node", "/app/index.js"]
