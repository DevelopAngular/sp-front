#!/usr/bin/env bash
set -e

if [ "$1" = "cleanup" ]; then
    echo 'Cleaning up...'

    rm -rf dist/*

    exit 0
fi

npm install

export PATH="$PATH:$(pwd)/node_modules/.bin"

deploy_url="${STATIC_URL-/static/}frontend/"
echo "Frontend deploy url: $deploy_url"

ng build --prod --base-href '/app/' --deploy-url "$deploy_url"
