#!/bin/bash

# Read current version from version.txt
CURRENT_VERSION=$(cat version.txt)
if [ -z "$CURRENT_VERSION" ]; then
    echo "Error: Could not read version from version.txt"
    exit 1
fi

# Increment minor version
MAJOR=$(echo $CURRENT_VERSION | cut -d. -f1)
MINOR=$(echo $CURRENT_VERSION | cut -d. -f2)
PATCH=$(echo $CURRENT_VERSION | cut -d. -f3)
NEW_PATCH=$((PATCH + 1))
NEW_VERSION="$MAJOR.$MINOR.$NEW_PATCH"

# Update version.txt with new version
echo $NEW_VERSION > version.txt

VERSION="v$NEW_VERSION"
GITHUB_TOKEN="${GITHUB_TOKEN:-}"  # Get from environment variable
APK_PATH="android/app/build/outputs/apk/release/app-release.apk"

if [ -z "$GITHUB_TOKEN" ]; then
    echo "Error: GITHUB_TOKEN environment variable is not set"
    exit 1
fi

# Calculate SHA256 hash of the APK
if [ ! -f "$APK_PATH" ]; then
    echo "Error: APK file not found at $APK_PATH"
    exit 1
fi

APK_HASH=$(sha256sum "$APK_PATH" | cut -d' ' -f1)
if [ -z "$APK_HASH" ]; then
    echo "Error: Failed to calculate SHA256 hash"
    exit 1
fi

echo "APK SHA256: $APK_HASH"

# Create release with SHA256 hash in the description
echo "Creating GitHub release $VERSION..."
release_response=$(curl -L \
    -X POST \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer $GITHUB_TOKEN" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "https://api.github.com/repos/keiver/barlog/releases" \
    -d @- <<EOF
{
  "tag_name": "$VERSION",
  "name": "Barlog $VERSION",
  "body": "Barlog Android Release $VERSION\n\nSHA256: \`$APK_HASH\`"
}
EOF
)

# Extract upload URL from response
upload_url=$(echo "$release_response" | grep -o '"upload_url": "[^"]*' | cut -d'"' -f4)
if [ -z "$upload_url" ]; then
    echo "Error: Failed to get upload URL from response:"
    echo "$release_response"
    exit 1
fi

# Remove {?name,label} from upload URL and add name parameter
upload_url="${upload_url%\{*}?name=barlog-$VERSION.apk"

# Upload APK to release
echo "Uploading APK to release..."
curl -L \
    -X POST \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer $GITHUB_TOKEN" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    -H "Content-Type: application/vnd.android.package-archive" \
    --data-binary "@$APK_PATH" \
    "$upload_url"

if [ $? -eq 0 ]; then
    echo "Successfully created release $VERSION and uploaded APK"
    echo "SHA256: $c"
else
    echo "Error: Failed to upload APK"
    exit 1
fi