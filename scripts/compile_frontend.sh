#!/usr/bin/env bash
set -e

yarn install

export PATH="$PATH:$(pwd)/node_modules/.bin"

deploy_url="${STATIC_URL-/static/}frontend/"
echo "Frontend deploy url: $deploy_url"

ng build --prod --base-href '/app/' # --deploy-url "$deploy_url"
