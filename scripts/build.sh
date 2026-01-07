#!/bin/bash
#
# Build script for Nobuco Chrome Extension
# Creates a clean production build ready for Chrome Web Store submission
#

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get version from manifest.json
VERSION=$(grep '"version"' manifest.json | sed -E 's/.*"version": "([^"]+)".*/\1/')

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Building Nobuco v${VERSION}${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Clean previous build
echo -e "\n${YELLOW}[1/5]${NC} Cleaning previous build..."
rm -rf build/
rm -f nobuco-*.zip

# Create build directory
echo -e "${YELLOW}[2/5]${NC} Creating build directory..."
mkdir -p build/icons

# Copy necessary files
echo -e "${YELLOW}[3/5]${NC} Copying files..."
cp manifest.json build/
cp icons/*.png build/icons/

# Copy content.js and disable DEBUG mode
echo -e "${YELLOW}[4/5]${NC} Processing content.js (DEBUG = false)..."
sed 's/const DEBUG = true/const DEBUG = false/' content.js > build/content.js

# Verify DEBUG was changed
if grep -q "const DEBUG = false" build/content.js; then
    echo -e "  ${GREEN}✓${NC} DEBUG mode disabled"
else
    echo -e "  ${RED}✗${NC} Warning: DEBUG mode still enabled!"
    exit 1
fi

# Create ZIP for Chrome Web Store
echo -e "${YELLOW}[5/5]${NC} Creating ZIP package..."
cd build
zip -r -q ../nobuco-v${VERSION}.zip .
cd ..

# Get ZIP size
ZIP_SIZE=$(du -h nobuco-v${VERSION}.zip | cut -f1)

echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Build complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "\nPackage: ${GREEN}nobuco-v${VERSION}.zip${NC} (${ZIP_SIZE})"
echo -e "\nContents:"
unzip -l nobuco-v${VERSION}.zip | grep -v "Archive:" | grep -v "Length"

echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "  1. Test the extension: Load 'build/' folder in chrome://extensions"
echo -e "  2. Upload to Chrome Web Store: nobuco-v${VERSION}.zip"
echo -e "  3. Keep this ZIP for your records\n"
