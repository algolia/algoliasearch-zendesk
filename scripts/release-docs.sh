#! /bin/sh

version=`cat package.json | json version`

cd docs
bundle install
rm -rf _site
JEKYLL_ENV=production VERSION=$version bundle exec jekyll build
cd ..

npm run docs
git add docs
git commit docs -m "docs(release): v$version"
git push

node ./scripts/publish-docs.js
