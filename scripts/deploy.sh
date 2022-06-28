#!/bin/bash

kubectl apply -f k8s/0_namespace.yml
kubectl apply -f k8s/1_deployment.yml
kubectl apply -f k8s/2_service.yml
kubectl apply -f k8s/3_ingress.yml
kubectl -n rss rollout restart deployment/rss-site
