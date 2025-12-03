#!/bin/bash

# DeStudy Development Environment - Stop Script
# This script stops the Hardhat node and Next.js frontend

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🛑 Stopping DeStudy Development Environment..."
echo ""

# Stop processes by PID files
STOPPED_ANY=false

# Stop Frontend
if [ -f "logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo -e "${GREEN}⚛️  Stopping Next.js frontend (PID: $FRONTEND_PID)...${NC}"
        kill $FRONTEND_PID 2>/dev/null || true
        STOPPED_ANY=true
    fi
    rm -f logs/frontend.pid
fi

# Stop Hardhat
if [ -f "logs/hardhat.pid" ]; then
    HARDHAT_PID=$(cat logs/hardhat.pid)
    if ps -p $HARDHAT_PID > /dev/null 2>&1; then
        echo -e "${GREEN}📦 Stopping Hardhat node (PID: $HARDHAT_PID)...${NC}"
        kill $HARDHAT_PID 2>/dev/null || true
        STOPPED_ANY=true
    fi
    rm -f logs/hardhat.pid
fi

# Fallback: Kill by port if PID files don't work
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚛️  Stopping Next.js frontend (by port)...${NC}"
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    STOPPED_ANY=true
fi

if lsof -Pi :8545 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}📦 Stopping Hardhat node (by port)...${NC}"
    lsof -ti:8545 | xargs kill -9 2>/dev/null || true
    STOPPED_ANY=true
fi

# Kill any remaining processes
pkill -f "next dev" 2>/dev/null || true
pkill -f "hardhat node" 2>/dev/null || true

# Wait a moment for processes to terminate
sleep 2

echo ""

# Verify everything is stopped
STILL_RUNNING=false

if lsof -Pi :8545 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${RED}❌ Hardhat node still running on port 8545${NC}"
    STILL_RUNNING=true
else
    echo -e "${GREEN}✅ Hardhat node stopped${NC}"
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${RED}❌ Frontend still running on port 3000${NC}"
    STILL_RUNNING=true
else
    echo -e "${GREEN}✅ Frontend stopped${NC}"
fi

echo ""

if [ "$STILL_RUNNING" = true ]; then
    echo -e "${RED}⚠️  Some processes are still running. You may need to stop them manually.${NC}"
    exit 1
elif [ "$STOPPED_ANY" = true ]; then
    echo -e "${GREEN}✨ All services stopped successfully!${NC}"
else
    echo -e "${YELLOW}ℹ️  No services were running.${NC}"
fi

echo ""
