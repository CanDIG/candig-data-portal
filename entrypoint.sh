#!/bin/sh

set -eu

# Run env setup if initial_setup exists
if [ -f "initial_setup" ]; then
    if [ "${DEBUG_MODE:-0}" = "1" ]; then
        export DISABLE_ESLINT="false"
    else
        export DISABLE_ESLINT="true"
    fi

    envsubst < .env.docker > .env.development
    envsubst < .env.docker > .env.production
    rm initial_setup
fi

# Default fallback for CANDIG_DOMAIN
: "${CANDIG_DOMAIN:=localhost}"

# Substitute environment variables into nginx config template
envsubst '$CANDIG_DOMAIN' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

# Run nginx in foreground
exec nginx -g 'daemon off;'
