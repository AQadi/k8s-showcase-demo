#!/bin/bash

# Build the Docker image
docker build -t ray-tracing-app:latest .

# Apply Kubernetes manifests
kubectl apply -f k8s-deployment.yaml
kubectl apply -f k8s-service.yaml

# Get service info
echo "Waiting for deployment..."
kubectl rollout status deployment/ray-tracing-app

echo "Service info:"
kubectl get service ray-tracing-app-service

echo "Your app will be available at: http://node-ip:30080"
echo "To get node IP run: kubectl get nodes -o wide"