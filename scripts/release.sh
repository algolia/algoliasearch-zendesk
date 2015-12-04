#! /bin/sh

if test -n "$(git status --porcelain)"; then
  echo "Your git directory is unclean"
  exit
fi

current=`cat VERSION`
read -p "New version number (current is ${current}): " version
npm version $version
npm run build
rm -f VERSION && echo $version > VERSION
git add dist/
git commit VERSION -m "v$version"
git push
git push --tags
npm publish
