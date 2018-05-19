#!/usr/bin/env sh
set -e

apk add --no-cache bash python tree nodejs-npm

GCS_TAG_NAME=${CI_COMMIT_REF_NAME}
export STATIC_URL="https://storage.googleapis.com/courier-static/$GCS_TAG_NAME/"

if ! scripts/compile_frontend.sh ; then
    echo 'Failed to compile frontend, cannot continue'
    exit 1
fi

scripts/compile_frontend.sh cleanup || echo 'compile_frontend.sh encountered an error'

tree ./dist
echo "Static Assets: $(du -sh ./dist | awk '{print $1}')"

# GCE_SERVICE_ACCOUNT_KEY is a secret in Gitlab
if [ -n "$GCE_SERVICE_ACCOUNT_KEY" ]; then
    echo "$GCE_SERVICE_ACCOUNT_KEY" > gce-credential-key.json

    wget -O google-cloud-sdk.tar.gz  https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-sdk-183.0.0-linux-x86_64.tar.gz
    tar xzf google-cloud-sdk.tar.gz

    PATH="$PATH:$(pwd)/google-cloud-sdk/bin"

    gcloud config configurations create default
    gcloud auth activate-service-account --key-file=gce-credential-key.json
    gcloud config set project notify-messenger
    gsutil rsync -r ./dist gs://courier-static/${GCS_TAG_NAME}
else
    echo '$GCE_SERVICE_ACCOUNT_KEY not set, skipping asset upload'
fi

