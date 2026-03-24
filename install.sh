#!/usr/bin/env bash
set -euo pipefail

# Install script for Prueba

REPO="pjacobo28/Prueba"
INSTALL_DIR="${INSTALL_DIR:-/usr/local/bin}"

echo "Installing Prueba..."

# Check for required tools
for cmd in curl git; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "Error: '$cmd' is required but not installed." >&2
    exit 1
  fi
done

# Clone or update the repository
if [ -d "$HOME/.prueba" ]; then
  echo "Updating existing installation..."
  git -C "$HOME/.prueba" pull --ff-only
else
  echo "Cloning repository..."
  git clone "https://github.com/${REPO}.git" "$HOME/.prueba"
fi

echo "Installation complete!"
echo "Repository available at: $HOME/.prueba"
