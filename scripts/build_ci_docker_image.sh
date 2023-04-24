# This script builds the docker image that is used to run the ci jobs for smartpass-frontend.
# Run it from the root directory of the project.

REGISTRY_BASE=registry.gitlab.com/notify-messenger/smartpass-frontend

NODE_VERSION=$(cat .nvmrc)

docker build --platform=linux/amd64 --build-arg NODE_VERSION=$NODE_VERSION - < ./scripts/ci-dockerfile -t $REGISTRY_BASE/ci-image:$NODE_VERSION
docker push $REGISTRY_BASE/ci-image:$NODE_VERSION
