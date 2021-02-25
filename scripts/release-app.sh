#! /bin/sh

# Exit on error
set -e

cd "$PWD/app"

VERSION=`node -p -e "require('./package.json').version"`
echo "About to release version ${VERSION}"

npm run clean
npm install
NODE_ENV=production npm run build
npm publish
