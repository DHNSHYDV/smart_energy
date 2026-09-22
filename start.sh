#!/bin/bash
# Smart Energy Conservation Tracker - Startup Script

echo "==============================================================="
echo "⚡ Starting Smart Energy Conservation Tracker Simulation ⚡"
echo "==============================================================="

# Detect local IP
LOCAL_IP=$(ip -4 addr show wlan0 2>/dev/null | grep -oP '(?<=inet\s)\d+(\.\d+){3}' || hostname -I | awk '{print $1}')

echo "📡 Local Wi-Fi IP detected: $LOCAL_IP"
echo "🌐 Starting Unified IoT Server on port 5000..."

cd "$(dirname "$0")"
node backend/src/server.js
