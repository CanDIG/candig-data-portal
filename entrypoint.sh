#!/usr/bin/env bash

set -Euo pipefail

export VAULT_S3_TOKEN=$(cat /run/secrets/vault-s3-token)
export OPA_SECRET=$(cat /run/secrets/opa-service-token)

if [[ -f "initial_setup" ]]; then
    envsubst < .env.docker > .env.development
    envsubst < .env.docker > .env.production
    rm initial_setup
fi

npm start
# npm run build
