#!/bin/bash

echo "Running SuperAI Perp Tests"
echo "=========================="

# Backend tests
echo "Testing Backend..."
cd backend
npm test
cd ..

# Contract tests
echo "Testing Contracts..."
cd contracts
npm test
cd ..

# AI tests
echo "Testing AI Service..."
cd ai
python -m pytest tests/
cd ..

echo "All tests completed!"
