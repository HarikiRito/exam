#!/bin/bash
# Script to clean generated files in the app/ directory

echo "Cleaning generated files..."

# Delete all files matching '*.generated.*' in the app/ directory
find ./app -type f -name '*.generated.*' -exec rm -f {} \;

echo "Deleted all files matching '*.generated.*' in the project's app/ folder."