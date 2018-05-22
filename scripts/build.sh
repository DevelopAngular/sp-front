#!/usr/bin/env sh
set -e

if [[ -n "$CI_REGISTRY_USER" ]]; then
  echo "Logging to GitLab Container Registry with CI credentials..."
  docker login -u "$CI_REGISTRY_USER" -p "$CI_REGISTRY_PASSWORD" "$CI_REGISTRY"
  echo ""
fi


GCS_TAG_NAME=${CI_COMMIT_REF_NAME}

if ! scripts/compile_frontend.sh ; then
    echo 'Failed to compile frontend, cannot continue'
    exit 1
fi

tree ./dist
echo "Static Assets: $(du -sh ./dist | awk '{print $1}')"

PROJ_BASE=$CI_REGISTRY/$CI_PROJECT_NAMESPACE/$CI_PROJECT_NAME
echo "ref tag: $PROJ_BASE:$CI_COMMIT_REF_NAME"
echo "sha tag: $PROJ_BASE:$CI_COMMIT_SHA"

docker build \
    -t "$PROJ_BASE:$CI_COMMIT_REF_NAME" \
    -t "$PROJ_BASE:$CI_COMMIT_SHA" \
    -f Dockerfile .

if [ -z "$CI_SKIP_UPLOAD" ]; then
    docker push "$PROJ_BASE:$CI_COMMIT_REF_NAME"
    docker push "$PROJ_BASE:$CI_COMMIT_SHA"
else
    echo 'Skipping upload to registry'
fi

