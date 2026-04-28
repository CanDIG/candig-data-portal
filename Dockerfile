# Build Stage
ARG alpine_version

FROM node:21.7.0-alpine${alpine_version} as build

LABEL Maintainer="CanDIG Project"
LABEL "candigv2"="candig-data-portal"

RUN apk update && apk add gettext

RUN apk add --no-cache git curl vim bash

RUN npm install -g npm@10.8.0

RUN addgroup -S candig && adduser -S candig -G candig

COPY --chown=candig:candig . /app/candig-data-portal

USER candig

WORKDIR /app/candig-data-portal

ENV PATH /app/candig-data-portal/node_modules/.bin:$PATH

RUN npm install

RUN touch initial_setup

ARG VITE_FEDERATION_API_SERVER
ARG VITE_INGEST_SERVER
ARG VITE_HTSGET_SERVER
ARG VITE_KATSU_API_SERVER
ARG VITE_BASE_NAME
ARG VITE_SUPPORT_EMAIL

ENV VITE_FEDERATION_API_SERVER=${VITE_FEDERATION_API_SERVER}
ENV VITE_INGEST_SERVER=${VITE_INGEST_SERVER}
ENV VITE_HTSGET_SERVER=${VITE_HTSGET_SERVER}
ENV VITE_KATSU_API_SERVER=${VITE_KATSU_API_SERVER}
ENV VITE_BASE_NAME=${VITE_BASE_NAME}
ENV CANDIG_DOMAIN=${CANDIG_DOMAIN}
ENV VITE_SUPPORT_EMAIL=${VITE_SUPPORT_EMAIL}

RUN npm run build

# Production Stage

FROM nginx:1.30.0-alpine

COPY --from=build /app/candig-data-portal/dist /usr/share/nginx/html

RUN mkdir -p /etc/nginx/templates

COPY nginx.default.conf.template /etc/nginx/templates/default.conf.template

COPY nginx.default.conf.template /etc/nginx/conf.d/default.conf

COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 4173

ENTRYPOINT ["sh", "entrypoint.sh"]
