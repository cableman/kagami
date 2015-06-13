#!/bin/bash

########
# Used to update node packages in the plugins.
#

# Install main modules
rm -rf node_modules
npm install

# Install plugin dependencies.
for folder in plugins/*; do
  if [ -d $folder ]; then
    cd $folder
    rm -rf node_modules
    npm install
    cd ../..
  fi
done
