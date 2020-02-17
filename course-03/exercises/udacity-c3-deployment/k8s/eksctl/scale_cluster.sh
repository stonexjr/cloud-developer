#!/bin/bash
kubectl scale deployment/backend-user --replicas=5
#kubectl scale deployment/backend-feed --replicas=10
#kubectl scale deployment/frontend --replicas=10
#kubectl scale deployment/reverseproxy --replicas=10
