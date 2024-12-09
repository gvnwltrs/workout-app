#!/bin/bash

source backend/venv/bin/activate
python3 backend/run.py &
PID1=$!

export BROWSER=none npm start
npm --prefix frontend/ start &
PID2=$!

cleanup() {
  echo "Shutting down processes..."
  kill $PID1 $PID2 2>/dev/null
  wait $PID1 $PID2 2>/dev/null
  echo "Processes terminated."
}

# Trap SIGINT (Ctrl-C) and SIGTERM to call cleanup
trap cleanup SIGINT SIGTERM

# Wait for the background processes
wait $PID1 $PID2
