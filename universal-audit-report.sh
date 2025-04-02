#!/bin/bash

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Detect if we're using yarn or npm
if [ -f "yarn.lock" ]; then
  echo "Yarn project detected, running yarn audit..."
  yarn audit --json | node "$SCRIPT_DIR/dist/cli.js" "$@"
else
  echo "NPM project detected, running npm audit..."
  npm audit --json | node "$SCRIPT_DIR/dist/cli.js" "$@"
fi