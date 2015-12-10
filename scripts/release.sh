#! /bin/sh

if test -n "$(git status --porcelain)"; then
  echo "Your git directory is unclean"
  exit
fi

current=`cat package.json | json version`
read -p "New version number (current is ${current}): " version
npm version $version
npm run build
git push
git push --tags
npm publish

cd docs
bundle install
rm -rf _site
JEKYLL_ENV=production VERSION=$version bundle exec jekyll build
cd ..
npm run docs
node ./scripts/publish-docs.js
