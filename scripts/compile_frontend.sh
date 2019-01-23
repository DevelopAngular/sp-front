#!/usr/bin/env bash
set -e

yarn install

export PATH="$PATH:$(pwd)/node_modules/.bin"

deploy_url="${STATIC_URL-/static/}frontend/"
echo "Frontend deploy url: $deploy_url"

release_name=$(sentry-cli releases propose-version)
sentry-cli releases --org 'smartpass' new --project 'hall-pass-web' "$release_name"


echo 'Generating build-info.ts'
scripts/make_build_info.sh

config=production

if [[ "$CI_ENVIRONMENT_SLUG" = "staging" ]]; then
  config=staging
fi

echo "Using config: $config"

ng build -c "$config" --base-href '/app/' # --deploy-url "$deploy_url"

echo 'Uploading sourcemaps'

sentry-cli releases --org 'smartpass' files --project 'hall-pass-web' "$release_name" upload-sourcemaps --rewrite --url-prefix "~/app" ./dist/

echo 'finalizing project'

sentry-cli releases --org 'smartpass' finalize --project 'hall-pass-web' "$release_name"

echo 'Done compiling.'
