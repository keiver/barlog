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

# If PATCH = final, we increase MINOR and set PATCH to 0 to version up
if [ "$PATCH" = "final" ]; then
    MINOR=$((MINOR + 1))
    PATCH=0
fi

NEW_PATCH=$((PATCH + 1))
NEW_VERSION="$MAJOR.$MINOR.$NEW_PATCH"

# Update version.txt with new version
echo "$NEW_VERSION" > version.txt

VERSION="v$NEW_VERSION"
GITHUB_TOKEN="${GITHUB_TOKEN:-}"  # Get from environment variable

# Paths and filenames
AAB_PATH="android/app/build/outputs/bundle/release/app-release.aab"
APKS_PATH="barlog-$NEW_VERSION.apks"
KEYSTORE_PATH="${KEYSTORE_PATH:-~/nogit/@keiverh__barlog.jks}"
KEY_ALIAS="${KEY_ALIAS:-}"
KEYSTORE_PASSWORD="${KEYSTORE_PASSWORD:-}"
KEY_PASSWORD="${KEY_PASSWORD:-}"

# Check for GitHub token
if [ -z "$GITHUB_TOKEN" ]; then
    echo "Error: GITHUB_TOKEN environment variable is not set"
    exit 1
fi

# Check if AAB file exists
if [ ! -f "$AAB_PATH" ]; then
    echo "Error: AAB file not found at $AAB_PATH"
    exit 1
fi

# Generate universal .apks using bundletool
echo "Generating universal .apks..."
java -jar /usr/local/bin/bundletool.jar build-apks \
    --bundle="$AAB_PATH" \
    --output="$APKS_PATH" \
    --mode=universal \
    --ks="$KEYSTORE_PATH" \
    --ks-key-alias="$KEY_ALIAS" \
    --ks-pass=pass:"$KEYSTORE_PASSWORD" \
    --key-pass=pass:"$KEY_PASSWORD"

if [ $? -ne 0 ]; then
    echo "Error: Failed to generate .apks file"
    exit 1
fi

# Calculate SHA256 hash of the .apks file
APKS_HASH=$(sha256sum "$APKS_PATH" | cut -d' ' -f1)
if [ -z "$APKS_HASH" ]; then
    echo "Error: Failed to calculate SHA256 hash"
    exit 1
fi

echo "APKS SHA256: $APKS_HASH"

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
  "body": "Barlog Android Release $VERSION\n\nSHA256: \`$APKS_HASH\`"
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
upload_url="${upload_url%\{*}?name=barlog-$VERSION.apks"

# Upload .apks to release
echo "Uploading .apks to release..."
curl -L \
    -X POST \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer $GITHUB_TOKEN" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    -H "Content-Type: application/zip" \
    --data-binary "@$APKS_PATH" \
    "$upload_url"

if [ $? -eq 0 ]; then
    echo "Successfully created release $VERSION and uploaded .apks"
    echo "SHA256: $APKS_HASH"
else
    echo "Error: Failed to upload .apks"
    exit 1
fi
