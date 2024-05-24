ARG alpine_version
ARG katsu_api_target_url

FROM node:21.7.0-alpine${alpine_version} as build

LABEL Maintainer="CanDIG Project"
LABEL "candigv2"="candig-data-portal"

ENV TYK_KATSU_API_TARGET=$katsu_api_target_url

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

ENTRYPOINT ["bash", "entrypoint.sh"]
