ARG alpine_version
ARG katsu_api_target_url

FROM node:17.7.1-alpine${alpine_version} as build

LABEL Maintainer="CanDIG Project"

ENV TYK_KATSU_API_TARGET=$katsu_api_target_url

RUN apk update && apk add gettext

WORKDIR /app/candig-data-portal
ENV PATH /app/candig-data-portal/node_modules/.bin:$PATH

RUN apk add --no-cache git curl vim bash

COPY . /app/candig-data-portal

RUN npm install

RUN touch initial_setup

ENTRYPOINT ["bash", "entrypoint.sh"]
