#! /bin/sh

# Exit on error
set -e

# Ask for new version number if not in env
if [[ $ALGOLIASEARCH_ZENDESK_VERSION == "" ]]; then
  current=`json -f package.json version`
  read -p "New version number (current is ${current}): " version
  export ALGOLIASEARCH_ZENDESK_VERSION=$version
fi

# Ask for confirmation
read -p "[Docs] We'll \`git push\` on \`algolia/zendesk\`. Continue (yn)? " -n 1 -r
echo
[[ $REPLY =~ ^[Yy]$ ]] || exit -1

# Build docs from app's README
cd app
npm run build:docs
cd ..

# Build _site in docs/
cd docs
bundle install
rm -rf _site
JEKYLL_ENV=production VERSION=$ALGOLIASEARCH_ZENDESK_VERSION bundle exec jekyll build
cd ..

# Publish the docs
node ./scripts/publish-docs.js
