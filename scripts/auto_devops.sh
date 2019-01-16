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
    name="$CI_ENVIRONMENT_SLUG"

    if [[ "$track" != "stable" ]]; then
      name="$name-$track"
    fi

    replicas="1"
    service_enabled="false"
    postgres_enabled="$POSTGRES_ENABLED"
    # canary uses stable db
    [[ "$track" == "canary" ]] && postgres_enabled="false"

    env_track=$( echo $track | tr -s  '[:lower:]'  '[:upper:]' )
    env_slug=$( echo ${CI_ENVIRONMENT_SLUG//-/_} | tr -s  '[:lower:]'  '[:upper:]' )

    if [[ "$track" == "stable" ]]; then
      # for stable track get number of replicas from `PRODUCTION_REPLICAS`
      eval new_replicas=\$${env_slug}_REPLICAS
      service_enabled="true"
    else
      # for all tracks get number of replicas from `CANARY_PRODUCTION_REPLICAS`
      eval new_replicas=\$${env_track}_${env_slug}_REPLICAS
    fi
    if [[ -n "$new_replicas" ]]; then
      replicas="$new_replicas"
    fi

    if [[ "$CI_PROJECT_VISIBILITY" != "public" ]]; then
      secret_name='gitlab-registry'
    else
      secret_name=''
    fi

    helm_command='helm upgrade --install'
    name_arg=""

    set +e
    chart_status=$(helm status --tiller-namespace "$KUBE_NAMESPACE" "$name" | grep 'STATUS:')
    helm_exit_code=$?
    set -e

    # If the chart does not exist or was deleted, use install because helm
    # will refuse to upgrade --install a deleted chart

    if [ "${helm_exit_code}" -ne 0 ] ; then
        helm_command='helm install'
        name_arg="--name"
    fi

    if [ "${chart_status}" = "STATUS: DELETED" ] ; then
        helm_command='helm install'
        name_arg="--name"
    fi

    echo "Using helm verb: ${helm_command}"

    # Intentionally unquoted so helm and verbs are separate args
    $helm_command \
      --wait \
      --debug \
      --set service.enabled="$service_enabled" \
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
      --version="$CI_PIPELINE_ID-$CI_JOB_ID" \
      $name_arg "$name" \
      chart/

    sleep 20
}

function install_dependencies() {
    apk add -U openssl curl tar gzip bash ca-certificates git
    wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub
    wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.23-r3/glibc-2.23-r3.apk
    apk add glibc-2.23-r3.apk
    rm glibc-2.23-r3.apk

    curl "https://kubernetes-helm.storage.googleapis.com/helm-v${HELM_VERSION}-linux-amd64.tar.gz" | tar zx
    mv linux-amd64/helm /usr/bin/
    helm version --client

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

function download_chart() {
    if [[ ! -d chart ]]; then
      auto_chart=${AUTO_DEVOPS_CHART:-gitlab/auto-deploy-app}
      auto_chart_name=$(basename $auto_chart)
      auto_chart_name=${auto_chart_name%.tgz}
    else
      auto_chart="chart"
      auto_chart_name="chart"
    fi

    helm init --client-only
    helm repo add gitlab https://charts.gitlab.io
    if [[ ! -d "$auto_chart" ]]; then
      helm fetch ${auto_chart} --untar
    fi
    if [ "$auto_chart_name" != "chart" ]; then
      mv ${auto_chart_name} chart
    fi

    helm dependency update chart/
    helm dependency build chart/
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
    helm init --upgrade
    kubectl rollout status -n "$TILLER_NAMESPACE" -w "deployment/tiller-deploy"
    if ! helm version --debug; then
      echo "Failed to init Tiller."
      return 1
    fi
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

function delete() {
    track="${1-stable}"
    name="$CI_ENVIRONMENT_SLUG"

    if [[ "$track" != "stable" ]]; then
      name="$name-$track"
    fi

    if [[ -n "$(helm ls -q "^$name$")" ]]; then
      helm delete "$name"
    fi
}
