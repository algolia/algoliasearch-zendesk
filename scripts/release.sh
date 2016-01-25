#! /bin/sh

# Exit on error
set -e

# Check if the git directory is clean
if [[ $(git diff --shortstat 2> /dev/null | tail -n1) != "" ]]; then
  echo "Your git directory is unclean"
  exit
fi

current=`git describe --abbrev=0 --tags`
read -p "New version number (current is ${current}): " version
export ALGOLIASEARCH_ZENDESK_VERSION=$version

# Ask for confirmation
read -p "[All] We'll \`git push\` with \"v$ALGOLIASEARCH_ZENDESK_VERSION\". Continue (yn)? " -n 1 -r
echo
[[ $REPLY =~ ^[Yy]$ ]] || exit -1

# Run the other release scripts
npm run release:app
npm run release:docs

# Generate the ChangeLog
npm run changelog

# Tag and Push
# No git-tag-version also disables the commit (See https://github.com/npm/npm/issues/7186)
npm version --no-git-tag-version
git add package.json app/package.json CHANGELOG.md
git commit -m "chore(release): $ALGOLIASEARCH_ZENDESK_VERSION"
git tag -a "v$ALGOLIASEARCH_ZENDESK_VERSION" -m "$ALGOLIASEARCH_ZENDESK_VERSION"
git push
git push --tags
