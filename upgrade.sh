#!/bin/bash

########
# Used to upgrade node packages in the JSON package files.
#

# Install main modules
npm install

# Install plugin dependencies.
for folder in plugins/*; do
  if [ -d $folder ]; then
    cd $folder
    npm-check-updates -u
    rm -rf node_modules
    npm install
    cd ../..
  fi
done
