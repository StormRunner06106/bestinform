#!/bin/bash
set -x
# Define servers
SERVERS=("172.16.11.12")
USERNAME=bst1
DEST_DIR="/tmp/dist"
DEPLOY_DIR="/data/webapp/html"
# Build the project with Angular CLI
ng build
# Loop through the list of servers and deploy the build
for SERVER in "${SERVERS[@]}"
do
    echo "Deploying to $SERVER"
    # Create a new 'html' directory on the server
    ssh $USERNAME@$SERVER "mkdir -p $DEPLOY_DIR"
    # Copy the new build to the server
    scp -r ./dist/* $USERNAME@$SERVER:$DEST_DIR
    #Copy files
    ssh $USERNAME@$SERVER "/home/bst1/copy.sh"
    echo "Deployment to $SERVER complete"
done
echo "All deployments complete"
