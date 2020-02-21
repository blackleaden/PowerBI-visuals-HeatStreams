#!/bin/sh
set -e

NODE_ENV=production yarn run-p lint check_formatting
yarn lerna run build --stream

cd pbi-heat-streams
npm install
npm run audit
npm run lint 
npm run package

