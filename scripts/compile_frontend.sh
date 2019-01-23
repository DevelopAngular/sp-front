#!/usr/bin/env bash
set -e

yarn install

export PATH="$PATH:$(pwd)/node_modules/.bin"

deploy_url="${STATIC_URL-/static/}frontend/"
echo "Frontend deploy url: $deploy_url"

config=production

if [ "$CI_ENVIRONMENT_SLUG" = "staging" ]; then
  config=staging
fi

echo "Using config: $config"

release_name=$(sentry-cli releases propose-version)

echo "Using release name: $release_name"

ng build -c "$config" --base-href '/app/' # --deploy-url "$deploy_url"
