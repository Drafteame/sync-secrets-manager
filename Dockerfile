FROM node:20-alpine

LABEL "com.github.actions.icon"="blue"
LABEL "com.github.actions.color"="database"
LABEL "com.github.actions.name"="Sync AWS Secrets Manager"
LABEL "com.github.actions.description"="Sync AWS Secrets Manager with a JSON file"
LABEL "org.opencontainers.image.source"="https://github.com/Drafteame/sync-secrets-manager"

COPY . /app
WORKDIR /app

RUN npm install --omit=dev

ENTRYPOINT ["node", "/app/index.js"]
