#!/bin/bash
kubectl create configmap env-config --from-env-file=.env.list
kubectl get configmap
