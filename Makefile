.PHONY: help build clean test package install release

# Default target - show help
help:
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "Nobuco - Build Commands"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "Available targets:"
	@echo "  make build      - Build production version (build/ + ZIP)"
	@echo "  make release    - Prepare everything for Chrome Web Store"
	@echo "  make clean      - Remove build artifacts"
	@echo "  make test       - Run heuristic tests"
	@echo "  make package    - Create ZIP only (no rebuild)"
	@echo "  make install    - Show installation instructions"
	@echo ""
	@echo "Typical workflow:"
	@echo "  1. make clean    # Clean old builds"
	@echo "  2. make test     # Verify heuristics work"
	@echo "  3. make release  # Prepare everything for upload"
	@echo "  4. Check release/ directory and upload to Chrome Web Store"
	@echo ""

# Build production version
build:
	@bash scripts/build.sh

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	@rm -rf build/
	@rm -rf release/
	@rm -f nobuco-*.zip
	@echo "✓ Clean complete"

# Run tests
test:
	@echo "Running heuristic tests..."
	@node test_samples.js

# Create ZIP from existing build/ (no rebuild)
package:
	@if [ ! -d "build" ]; then \
		echo "Error: build/ directory not found. Run 'make build' first."; \
		exit 1; \
	fi
	@VERSION=$$(grep '"version"' manifest.json | sed -E 's/.*"version": "([^"]+)".*/\1/'); \
	cd build && zip -r -q ../nobuco-v$$VERSION.zip . && cd ..; \
	echo "✓ Package created: nobuco-v$$VERSION.zip"

# Prepare complete release package for Chrome Web Store
release: build
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "Preparing Chrome Web Store release..."
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@rm -rf release/
	@mkdir -p release/screenshots
	@VERSION=$$(grep '"version"' manifest.json | sed -E 's/.*"version": "([^"]+)".*/\1/'); \
	mv nobuco-v$$VERSION.zip release/; \
	if [ -d "store-assets" ] && [ "$$(ls -A store-assets 2>/dev/null)" ]; then \
		cp store-assets/*.png release/screenshots/ 2>/dev/null || true; \
		echo "✓ Copied screenshots from store-assets/"; \
	elif [ -d "tmp/assets/img" ] && [ -f "tmp/assets/img/screenshot-1.png" ]; then \
		cp tmp/assets/img/screenshot-*.png release/screenshots/ 2>/dev/null || true; \
		echo "✓ Copied screenshots from tmp/assets/img/"; \
	else \
		echo "⚠ No screenshots found - add to store-assets/ or tmp/assets/img/"; \
	fi; \
	echo "" > release/UPLOAD_CHECKLIST.txt; \
	echo "Chrome Web Store Upload Checklist" >> release/UPLOAD_CHECKLIST.txt; \
	echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> release/UPLOAD_CHECKLIST.txt; \
	echo "" >> release/UPLOAD_CHECKLIST.txt; \
	echo "1. Go to: https://chrome.google.com/webstore/devconsole" >> release/UPLOAD_CHECKLIST.txt; \
	echo "" >> release/UPLOAD_CHECKLIST.txt; \
	echo "2. Upload Package:" >> release/UPLOAD_CHECKLIST.txt; \
	echo "   - Click 'New Item'" >> release/UPLOAD_CHECKLIST.txt; \
	echo "   - Upload: nobuco-v$$VERSION.zip" >> release/UPLOAD_CHECKLIST.txt; \
	echo "" >> release/UPLOAD_CHECKLIST.txt; \
	echo "3. Store Listing:" >> release/UPLOAD_CHECKLIST.txt; \
	echo "   - Name: Nobuco" >> release/UPLOAD_CHECKLIST.txt; \
	echo "   - Description: See STORE_LISTING.md" >> release/UPLOAD_CHECKLIST.txt; \
	echo "   - Category: Productivity" >> release/UPLOAD_CHECKLIST.txt; \
	echo "   - Language: English" >> release/UPLOAD_CHECKLIST.txt; \
	echo "" >> release/UPLOAD_CHECKLIST.txt; \
	echo "4. Upload Screenshots:" >> release/UPLOAD_CHECKLIST.txt; \
	echo "   - From: release/screenshots/" >> release/UPLOAD_CHECKLIST.txt; \
	echo "   - Upload at least 1 (max 5)" >> release/UPLOAD_CHECKLIST.txt; \
	echo "" >> release/UPLOAD_CHECKLIST.txt; \
	echo "5. Privacy Policy:" >> release/UPLOAD_CHECKLIST.txt; \
	echo "   - URL: https://github.com/YOUR_USERNAME/nobuco/blob/main/PRIVACY.md" >> release/UPLOAD_CHECKLIST.txt; \
	echo "" >> release/UPLOAD_CHECKLIST.txt; \
	echo "6. Submit for Review" >> release/UPLOAD_CHECKLIST.txt; \
	echo "" >> release/UPLOAD_CHECKLIST.txt; \
	echo "See tmp/PUBLISHING_GUIDE.md for full details" >> release/UPLOAD_CHECKLIST.txt; \
	echo ""; \
	echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"; \
	echo "✓ Release package ready!"; \
	echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"; \
	echo ""; \
	echo "📦 Package: release/nobuco-v$$VERSION.zip"; \
	echo "📸 Screenshots: release/screenshots/"; \
	echo "📋 Checklist: release/UPLOAD_CHECKLIST.txt"; \
	echo ""; \
	echo "Next: Review the checklist and upload to Chrome Web Store"

# Show installation instructions
install:
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "Local Installation (for testing)"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "1. Run: make build"
	@echo "2. Open Chrome: chrome://extensions"
	@echo "3. Enable 'Developer mode' (top-right)"
	@echo "4. Click 'Load unpacked'"
	@echo "5. Select the 'build/' folder"
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "Chrome Web Store Publication"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "1. Run: make build"
	@echo "2. Go to: https://chrome.google.com/webstore/devconsole"
	@echo "3. Click 'New Item'"
	@echo "4. Upload: nobuco-v*.zip"
	@echo ""
	@echo "See tmp/PUBLISHING_GUIDE.md for full details"
	@echo ""
