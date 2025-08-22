#!/usr/bin/env bash
set -euo pipefail
mkdir -p sample_data/models
cd sample_data/models

if [ ! -d vosk ]; then
  echo "Downloading small Vosk English model..."
  echo "Please download a Vosk small EN model and extract to sample_data/models/vosk"
fi
