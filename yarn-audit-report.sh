
#!/bin/bash

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Generate yarn audit in JSON format and pipe it to the report generator
# Note: yarn audit doesn't have a built-in JSON format option, so we need to convert it
yarn audit --json | node "$SCRIPT_DIR/dist/cli.js" "$@"