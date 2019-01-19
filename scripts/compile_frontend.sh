#!/usr/bin/env bash
set -e

if [[ -d "/persistent_volume" ]]; then
  echo "Found /persistent_volume, using yarn with cache"

  mkdir -p /persistent_volume/yarn_cache

  yarn install --cache-folder /persistent_volume/yarn_cache
else
  echo "Using fresh yarn install"
  yarn install
fi

export PATH="$PATH:$(pwd)/node_modules/.bin"

deploy_url="${STATIC_URL-/static/}frontend/"
echo "Frontend deploy url: $deploy_url"

config=production

if [ "$CI_ENVIRONMENT_SLUG" = "staging" ]; then
  config=staging
fi

echo "Using config: $config"

ng build -c "$config" --base-href '/app/' # --deploy-url "$deploy_url"
