#!/bin/bash

# Quick accessibility audit script
# Usage: ./audit.sh <url> [quick|full]

URL=$1
MODE=${2:-quick}

if [ -z "$URL" ]; then
    echo "Usage: ./audit.sh <url> [quick|full]"
    echo "Example: ./audit.sh https://ebenfeld.tech"
    exit 1
fi

if [ "$MODE" = "full" ]; then
    echo "Running full accessibility audit for $URL..."
    bash ./scripts/run-workspace.sh packages/reach dev audit "$URL"
else
    echo "Running quick accessibility check for $URL..."
    bash ./scripts/run-workspace.sh packages/reach dev quick "$URL"
fi
