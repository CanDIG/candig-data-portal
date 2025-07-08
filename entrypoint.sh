#!/usr/bin/env bash

set -Euo pipefail

if [[ -f "initial_setup" ]]; then
    [[ $DEBUG_MODE = 1 ]] && export DISABLE_ESLINT="false" || export DISABLE_ESLINT="true"
    envsubst < .env.docker > .env.development
    envsubst < .env.docker > .env.production
    rm initial_setup
fi

# npx vite
npx vite build
npx vite preview
# npm start
# npm run build
