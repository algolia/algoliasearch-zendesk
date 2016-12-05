#! /bin/sh

# Exit on error
set -e

CONNECTOR_NAME="algolia/zendesk-hc-connector"

# Check if docker is running
if ! docker images >/dev/null 2>&1; then
  echo "Docker is not running. You should start it before continuing."
  read -p "Continue (yn)? " -n 1 -r
  echo
  [[ $REPLY =~ ^[Yy]$ ]] || exit -1
fi

# Ask for new version number if not in env
if [[ $ALGOLIASEARCH_ZENDESK_VERSION == "" ]]; then
  current=`json -f package.json version`
  read -p "New version number (current is ${current}): " version
  export ALGOLIASEARCH_ZENDESK_VERSION=$version
fi

version_regex="^([0-9]+)\.([0-9]+)\.([0-9]+)$"
major_tag=`echo "$ALGOLIASEARCH_ZENDESK_VERSION" | sed -r "s/${version_regex}/\1/g"`
minor_tag=`echo "$ALGOLIASEARCH_ZENDESK_VERSION" | sed -r "s/${version_regex}/\1.\2/g"`
patch_tag=`echo "$ALGOLIASEARCH_ZENDESK_VERSION" | sed -r "s/${version_regex}/\1.\2.\3/g"`

# Ask for confirmation
echo "[Crawler] We'll \`docker rm ${CONNECTOR_NAME}:*\`, then \`docker build\` and \`docker push\`"
echo "  - ${CONNECTOR_NAME}:v${major_tag}"
echo "  - ${CONNECTOR_NAME}:v${minor_tag}"
echo "  - ${CONNECTOR_NAME}:v${patch_tag}"
read -p "Continue (yn)? " -n 1 -r
echo
[[ $REPLY =~ ^[Yy]$ ]] || exit -1

# Remove all previous images of the crawler
for img in `docker images -q $CONNECTOR_NAME`; do
  docker rmi -f $img 2>/dev/null || true
done

# Build image, tag it and push
cd crawler/
echo $ALGOLIASEARCH_ZENDESK_VERSION > VERSION
docker build -t $CONNECTOR_NAME .
img=`docker images -q ${CONNECTOR_NAME}:latest`
docker tag $img ${CONNECTOR_NAME}:v$major_tag
docker tag $img ${CONNECTOR_NAME}:v$minor_tag
docker tag $img ${CONNECTOR_NAME}:v$patch_tag
docker push $CONNECTOR_NAME
cd ..
