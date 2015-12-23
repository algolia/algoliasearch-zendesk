#! /bin/sh

if [[ $(git diff --shortstat 2> /dev/null | tail -n1) != "" ]]; then
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

npm run release:docs
