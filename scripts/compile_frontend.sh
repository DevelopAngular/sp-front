#!/usr/bin/env bash
set -e

yarn install

export PATH="$PATH:$(pwd)/node_modules/.bin"

deploy_url="${STATIC_URL-/static/}frontend/"
echo "Frontend deploy url: $deploy_url"

release_name=$(sentry-cli releases propose-version)
sentry-cli releases new --project 'hall-pass-web' "$release_name"


echo 'Generating build-info.ts'
scripts/make_build_info.sh

config=production

if [[ "$CI_ENVIRONMENT_SLUG" = "staging" ]]; then
  config=staging
fi

echo "Using config: $config"

ng build -c "$config" --base-href '/app/' # --deploy-url "$deploy_url"

sentry-cli releases files "$release_name" upload-sourcemaps --org 'smartpass' --rewrite --url-prefix "~/app" ./dist/

sentry-cli releases finalize "$release_name"
