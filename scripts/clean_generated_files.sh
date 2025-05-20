#!/bin/bash

# Get the absolute path of the project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Delete all files ending with *.generated.* in the app/ folder of the project
echo $PROJECT_DIR/app/
find "$PROJECT_DIR/app/" -type f -name "*.generated.*" -exec rm -f {} +

echo "Deleted all files matching '*.generated.*' in the project's app/ folder." 