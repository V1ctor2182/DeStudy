#!/bin/bash

# DeStudy Development Environment - Start Script
# This script starts the Hardhat node and Next.js frontend

set -e

echo "🚀 Starting DeStudy Development Environment..."
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if processes are already running
if lsof -Pi :8545 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠️  Hardhat node already running on port 8545${NC}"
else
    echo -e "${GREEN}📦 Starting Hardhat node...${NC}"
    cd contracts
    nohup npx hardhat node --hostname 0.0.0.0 --port 8545 > ../logs/hardhat.log 2>&1 &
    HARDHAT_PID=$!
    echo $HARDHAT_PID > ../logs/hardhat.pid
    cd ..

    # Wait for Hardhat to be ready
    echo "   Waiting for Hardhat node to start..."
    sleep 3

    if lsof -Pi :8545 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${GREEN}   ✅ Hardhat node started (PID: $HARDHAT_PID)${NC}"

        # Deploy contracts
        echo -e "${GREEN}📝 Deploying contracts...${NC}"
        cd contracts
        npx hardhat run scripts/deploy.ts --network localhost
        cd ..
        echo -e "${GREEN}   ✅ Contracts deployed${NC}"
    else
        echo -e "${RED}   ❌ Failed to start Hardhat node${NC}"
        exit 1
    fi
fi

echo ""

# Check if frontend is already running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠️  Frontend already running on port 3000${NC}"
else
    echo -e "${GREEN}⚛️  Starting Next.js frontend...${NC}"
    cd frontend
    nohup npm run dev > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../logs/frontend.pid
    cd ..

    # Wait for frontend to be ready
    echo "   Waiting for frontend to start..."
    sleep 5

    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${GREEN}   ✅ Frontend started (PID: $FRONTEND_PID)${NC}"
    else
        echo -e "${RED}   ❌ Failed to start frontend${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}✨ DeStudy Development Environment is ready!${NC}"
echo ""
echo "📍 Services:"
echo "   • Hardhat Node:  http://127.0.0.1:8545"
echo "   • Frontend:      http://localhost:3000"
echo ""
echo "📝 Logs:"
echo "   • Hardhat:       logs/hardhat.log"
echo "   • Frontend:      logs/frontend.log"
echo ""
echo "🛑 To stop all services, run: ./stop_all.sh"
echo ""
