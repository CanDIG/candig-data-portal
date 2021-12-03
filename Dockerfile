FROM node:14.16.0-alpine

LABEL Maintainer="CanDIG Project"

RUN apk add --no-cache git

COPY . /app/candig-data-portal

WORKDIR /app/candig-data-portal

# Export REACT_APP_KATSU_API_SERVER as Katsu API

RUN npm install && npm run build

ENTRYPOINT ["npm", "start"]
