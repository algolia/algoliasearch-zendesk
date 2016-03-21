#! /bin/sh

# Exit on error
set -e

# Check if the git directory is clean
if [[ $(git diff --shortstat 2> /dev/null | tail -n1) != "" ]]; then
  echo "Your git directory is unclean"
  exit
fi

current=`json -f package.json version`
read -p "New version number (current is ${current}): " version
export ALGOLIASEARCH_ZENDESK_VERSION=$version

# Ask for confirmation
read -p "[All] We'll run all release scripts, then \`git push\` with \"v$ALGOLIASEARCH_ZENDESK_VERSION\". Continue (yn)? " -n 1 -r
echo
[[ $REPLY =~ ^[Yy]$ ]] || exit -1

# Run the other release scripts
npm run release:app
npm run release:docs
npm run release:crawler
npm run release:git
