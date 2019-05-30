#!/usr/bin/env bash
set -e

#if [[ -d "/persistent_volume" ]]; then
#  echo "Found /persistent_volume, using yarn with cache"
#
#  mkdir -p /persistent_volume/yarn_cache
#
#  yarn install --cache-folder /persistent_volume/yarn_cache
#else
  echo "Using fresh yarn install"
  yarn import
  yarn install --production=false
#fi

export PATH="$PATH:$(pwd)/node_modules/.bin"

deploy_url="${STATIC_URL-/static/}frontend/"
echo "Frontend deploy url: $deploy_url"

release_name=$(sentry-cli releases propose-version)
sentry-cli releases new "$release_name"


echo 'Generating build-info.ts'
scripts/make_build_info.sh

config=production

if [[ "$CI_ENVIRONMENT_SLUG" = "staging" ]]; then
  config=staging
fi

if [[ "$CI_ENVIRONMENT_SLUG" = "local" ]]; then
  config=local
fi

echo "Using config: $config"

yarn ng-high-memory build -c "$config" --base-href '/app/' # --deploy-url "$deploy_url"

echo 'Uploading sourcemaps to Sentry'

sentry-cli releases files "$release_name" upload-sourcemaps --rewrite --url-prefix "~/app" ./dist/

echo 'Deleting source maps in dist/'

rm dist/*.map

echo 'Finalizing project in Sentry'

sentry-cli releases finalize "$release_name"

echo 'Done compiling.'
