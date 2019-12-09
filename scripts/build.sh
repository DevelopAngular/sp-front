#!/usr/bin/env sh
set -e

if [[ -n "$CI_REGISTRY_USER" ]]; then
  echo "Logging to GitLab Container Registry with CI credentials..."
  docker login -u "$CI_REGISTRY_USER" -p "$CI_REGISTRY_PASSWORD" "$CI_REGISTRY"
  echo ""
fi

cleaned_ref=$(echo "$CI_COMMIT_REF_NAME" | sed 's/\//-/')

GCS_TAG_NAME=${cleaned_ref}

if ! scripts/compile_frontend.sh ; then
    echo 'Failed to compile frontend, cannot continue'
    exit 1
fi

tree ./dist
echo "Static Assets: $(du -sh ./dist | awk '{print $1}')"

PROJ_BASE=$CI_REGISTRY_IMAGE/web-${IMAGE_TAG_SUFFIX-unknown}
echo "ref tag: $PROJ_BASE:$cleaned_ref"
echo "sha tag: $PROJ_BASE:$CI_COMMIT_SHA"

docker build \
    -t "$PROJ_BASE:$cleaned_ref" \
    -t "$PROJ_BASE:$CI_COMMIT_SHA" \
    -f Dockerfile .

if [ -z "$CI_SKIP_UPLOAD" ]; then
    docker push "$PROJ_BASE:$cleaned_ref"
    docker push "$PROJ_BASE:$CI_COMMIT_SHA"
else
    echo 'Skipping upload to registry'
fi

