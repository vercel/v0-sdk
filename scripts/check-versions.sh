#!/bin/sh
# v0, @v0-sdk/ai-tools, @v0-sdk/react, and create-v0-sdk-app release in lockstep.
set -eu

SDK_VERSION=$(cd packages/v0-sdk && bun pm pkg get version | tr -d '"')
AI_TOOLS_VERSION=$(cd packages/ai-tools && bun pm pkg get version | tr -d '"')
REACT_VERSION=$(cd packages/react && bun pm pkg get version | tr -d '"')
CREATE_APP_VERSION=$(cd packages/create-v0-sdk-app && bun pm pkg get version | tr -d '"')
AI_TOOLS_SDK_VERSION=$(cd packages/ai-tools && bun pm pkg get dependencies.v0 | tr -d '"')
REACT_SDK_VERSION=$(cd packages/react && bun pm pkg get dependencies.v0 | tr -d '"')
if [ "$SDK_VERSION" != "$AI_TOOLS_VERSION" ] || [ "$SDK_VERSION" != "$REACT_VERSION" ] || [ "$SDK_VERSION" != "$CREATE_APP_VERSION" ]; then
  echo "::error::v0, @v0-sdk/ai-tools, @v0-sdk/react, and create-v0-sdk-app versions must match (${SDK_VERSION}, ${AI_TOOLS_VERSION}, ${REACT_VERSION}, ${CREATE_APP_VERSION})."
  exit 1
fi
if [ "$SDK_VERSION" != "$AI_TOOLS_SDK_VERSION" ] || [ "$SDK_VERSION" != "$REACT_SDK_VERSION" ]; then
  echo "::error::Published package dependencies on v0 must match ${SDK_VERSION} (@v0-sdk/ai-tools: ${AI_TOOLS_SDK_VERSION}, @v0-sdk/react: ${REACT_SDK_VERSION})."
  exit 1
fi
