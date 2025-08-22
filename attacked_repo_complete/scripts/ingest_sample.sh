#!/usr/bin/env bash
set -euo pipefail
API="http://localhost:8000"
FILE="sample_data/clips/briefing.mp4"

if [ ! -f "$FILE" ]; then
  echo "Place a short .mp4 at $FILE (30–90s)." >&2
  exit 1
fi

JOB=$(curl -s -F "file=@$FILE" "$API/v1/jobs" | jq -r '.job_id')
echo "job_id=$JOB"

# poll
while true; do
  s=$(curl -s "$API/v1/jobs/$JOB")
  status=$(echo "$s" | jq -r .status)
  prog=$(echo "$s" | jq -r .progress)
  echo "status=$status progress=$prog"
  if [ "$status" = "SUCCESS" ]; then
    BRF=$(echo "$s" | jq -r .briefing_id)
    curl -s "$API/v1/briefings/$BRF" | jq .
    exit 0
  elif [ "$status" = "FAILURE" ]; then
    echo "$s" | jq .
    exit 1
  fi
  sleep 2
done
