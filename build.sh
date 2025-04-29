#!/bin/bash

# This is the build script that Vercel will run when deploying your app
echo "Running build script for Vercel deployment..."

# Run the Vite build for the frontend
echo "Building frontend..."
vite build

# Prepare the API files
echo "Preparing API files..."
mkdir -p dist/api
cp -r api/* dist/api/

echo "Build completed successfully!"