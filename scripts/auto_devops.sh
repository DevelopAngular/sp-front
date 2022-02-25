#!/usr/bin/env bash

[[ "$TRACE" ]] && set -x

export CI_APPLICATION_REPOSITORY=$CI_REGISTRY_IMAGE/web-${IMAGE_TAG_SUFFIX-unknown}
export CI_APPLICATION_TAG=$CI_COMMIT_SHA
export CI_CONTAINER_NAME=ci_job_build_${CI_JOB_ID}
export TILLER_NAMESPACE=$KUBE_NAMESPACE

function check_kube_domain() {
    if [ -z ${AUTO_DEVOPS_DOMAIN+x} ]; then
      echo "In order to deploy or use Review Apps, AUTO_DEVOPS_DOMAIN variable must be set"
      echo "You can do it in Auto DevOps project settings or defining a secret variable at group or project level"
      echo "You can also manually add it in .gitlab-ci.yml"
      false
    else
      true
    fi
}

function deploy() {
    track="${1-stable}"

    if [[ "$CI_PROJECT_VISIBILITY" != "public" ]]; then
      secret_name='gitlab-registry'
    else
      secret_name=''
    fi

    template_f=$(mktemp)

    helm template \
      --set service.enabled="false" \
      --set web.repository="$CI_APPLICATION_REPOSITORY" \
      --set web.tag="$CI_APPLICATION_TAG" \
      --set web.pullPolicy=IfNotPresent \
      --set web.secrets[0].name="$secret_name" \
      --set application.name="$CI_PROJECT_NAME-$CI_ENVIRONMENT_SLUG" \
      --set application.track="$track" \
      --set service.url="$AUTO_DEVOPS_DOMAIN" \
      --set service.domain="$AUTO_DEVOPS_DOMAIN" \
      --set web.replicaCount="1" \
      --namespace="$KUBE_NAMESPACE" \
      chart/ | tee "$template_f"

    kubectl apply --namespace "$KUBE_NAMESPACE" -f "$template_f"

    sleep 10
}

function install_dependencies() {
    echo "Installing glibc..."

    apk add -U openssl curl tar gzip bash ca-certificates git
    wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub
    wget "https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.34-r0/glibc-2.34-r0.apk"
    apk add glibc-2.34-r0.apk
    rm glibc-2.34-r0.apk

    echo "Installing helm..."

    curl "https://get.helm.sh/helm-v${HELM_VERSION}-linux-amd64.tar.gz" | tar zx
    mv linux-amd64/helm /usr/bin/
    helm version --client

    echo "Installing kubectl..."

    curl -L -o /usr/bin/kubectl "https://storage.googleapis.com/kubernetes-release/release/v${KUBERNETES_VERSION}/bin/linux/amd64/kubectl"
    chmod +x /usr/bin/kubectl
    kubectl version --client
}

function setup_docker() {
    if ! docker info &>/dev/null; then
      if [ -z "$DOCKER_HOST" -a "$KUBERNETES_PORT" ]; then
        export DOCKER_HOST='tcp://localhost:2375'
      fi
    fi
}

function ensure_namespace() {
    echo "k8s namespace: $KUBE_NAMESPACE"
    kubectl describe namespace "$KUBE_NAMESPACE" || kubectl create namespace "$KUBE_NAMESPACE"
}

function check_kube_domain() {
    if [ -z ${AUTO_DEVOPS_DOMAIN+x} ]; then
      echo "In order to deploy or use Review Apps, AUTO_DEVOPS_DOMAIN variable must be set"
      echo "You can do it in Auto DevOps project settings or defining a secret variable at group or project level"
      echo "You can also manually add it in .gitlab-ci.yml"
      false
    else
      true
    fi
}

function install_tiller() {
    echo "Checking Tiller..."
#    helm init --upgrade
#    kubectl rollout status -n "$TILLER_NAMESPACE" -w "deployment/tiller-deploy"
#    if ! helm version --debug; then
#      echo "Failed to init Tiller."
#      return 1
#    fi
    echo ""
}

function create_secret() {
    echo "Create secret..."
    if [[ "$CI_PROJECT_VISIBILITY" == "public" ]]; then
      return
    fi

    kubectl create secret -n "$KUBE_NAMESPACE" \
      docker-registry gitlab-registry \
      --docker-server="$CI_REGISTRY" \
      --docker-username="$CI_DEPLOY_USER" \
      --docker-password="$CI_DEPLOY_PASSWORD" \
      --docker-email="$GITLAB_USER_EMAIL" \
      -o yaml --dry-run | kubectl replace -n "$KUBE_NAMESPACE" --force -f -
}


function persist_environment_url() {
  echo $CI_ENVIRONMENT_URL > environment_url.txt
}
