#!/usr/bin/env bash

set -Euo pipefail

if [[ -f "initial_setup" ]]; then
    [[ $DEBUG_MODE = 1 ]] && export DISABLE_ESLINT="false" || export DISABLE_ESLINT="true"
    envsubst < .env.docker > .env.development
    envsubst < .env.docker > .env.production
    rm initial_setup
fi

# Default fallback
: "${CANDIG_DOMAIN:=localhost}"

# Substitute environment variables into nginx config template
envsubst '$CANDIG_DOMAIN' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

# Run nginx in the foreground
exec nginx -g 'daemon off;'
