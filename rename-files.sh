#!/bin/bash

# Start from the current directory and recursively rename files
find . -type f -name "*.js" -exec bash -c 'mv "$0" "${0%.js}.jsx"' {} \;
find . -type f -name "*.ts" -exec bash -c 'mv "$0" "${0%.ts}.tsx"' {} \;
