#!/usr/bin/env bash

set -Euo pipefail

if [[ -f "initial_setup" ]]; then
    envsubst < .env.docker > .env.development
    envsubst < .env.docker > .env.production
    rm initial_setup
fi

npm start
# npm run build
