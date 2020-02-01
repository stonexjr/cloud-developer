#!/bin/bash
kubectl create secret env-sceret --from=.env.list
kubectl get configmap
