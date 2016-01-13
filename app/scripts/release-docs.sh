#! /bin/sh

version=`cat package.json | json version`

grunt build:docs
git add ../docs
git commit ../docs -m "docs(release): v$version"
git push

cd ../docs
bundle install
rm -rf _site
JEKYLL_ENV=production VERSION=$version bundle exec jekyll build
cd ../app

node ./scripts/publish-docs.js
