#!/usr/bin/env bash
set -e

#if [[ -d "/persistent_volume" ]]; then
#  echo "Found /persistent_volume, using yarn with cache"
#
#  mkdir -p /persistent_volume/yarn_cache
#
#  yarn install --cache-folder /persistent_volume/yarn_cache
#else
  # echo "Using fresh yarn install"
  # yarn install
  npm ci
#fi

export PATH="$PATH:$(pwd)/node_modules/.bin"

deploy_url="${STATIC_URL-/static/}frontend/"
echo "Frontend deploy url: $deploy_url"

release_name=$(sentry-cli releases propose-version)
sentry-cli releases new "$release_name"

sentry-cli releases set-commits --auto "$release_name"


echo 'Generating build-info.ts'
scripts/make_build_info.sh

config=production

# The config names are not intuitive. They refer to which *server* environment
# is used. The environment controls very few things. Notably it does set which
# server environment new schools are onboarded with.

# This is the testing environment, currently smartpass-testing.lavanote.com
if [[ "$CI_ENVIRONMENT_SLUG" = "testing" ]]; then
  config=staging
fi

# This is the feature environment, currently smartpass-feature.lavanote.com
if [[ "$CI_ENVIRONMENT_SLUG" = "feature-testing" ]]; then
  config=staging
fi

# Testing and feature use the staging server environment info.

# This is the local environment, unused
if [[ "$CI_ENVIRONMENT_SLUG" = "local" ]]; then
  config=local
fi

# Staging and prod use the prod server environment info.

echo "Using config: $config"

yarn ng-ci-memory build -c "$config" --base-href '/app/' # --deploy-url "$deploy_url"

yarn fcm

echo 'Uploading sourcemaps to Sentry'

sentry-cli releases files "$release_name" upload-sourcemaps --rewrite --url-prefix "~/app" ./dist/

if [ -z "$INCLUDE_SOURCEMAPS" ]; then
  echo 'Deleting source maps in dist/'

  rm dist/*.map
else
  echo 'Not deleting source maps due to $INCLUDE_SOURCEMAPS'
fi

echo 'Finalizing project in Sentry'

sentry-cli releases finalize "$release_name"

echo 'Done compiling.'


