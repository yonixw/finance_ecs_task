#!/bin/bash
# To be run in linux, you can assume you have node 22+, if you want to create js files and run some logic

set -e

# 1) ENV
export AWS_ACCESS_KEY_ID=""
export AWS_SECRET_ACCESS_KEY=""
export AWS_SESSION_TOKEN=""
export AWS_REGION="eu-central-1"

set -x

# 2) ECR login
REPO=870304046654.dkr.ecr.eu-central-1.amazonaws.com/data-repo
aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin $REPO

# 3) Docker push to ECR
VERSION=26NOV2025
LOCAL_TAG=yonixw/finance_ecs_task:$VERSION
ECR_TAG=$REPO:$VERSION

# Build the Docker image if not already built
echo "Building Docker image..."
docker build -t $LOCAL_TAG .

# Tag the image for ECR
echo "Tagging image for ECR..."
docker tag $LOCAL_TAG $ECR_TAG

# Push to ECR
echo "Pushing image to ECR..."
docker push $ECR_TAG

docker logout

# 4) Copy ECS task definition with new tag
TASK_DEF_ARN="arn:aws:ecs:eu-central-1:870304046654:task-definition/finance-pull-task:5"
TASK_FAMILY="finance-pull-task"

# Get the current task definition
echo "Getting current task definition..."
aws ecs describe-task-definition --region eu-central-1 --task-definition $TASK_FAMILY --query taskDefinition > task-def.json

# Update the image in the task definition
echo "Updating task definition with new image..."
node -e "
const fs = require('fs');
const taskDef = JSON.parse(fs.readFileSync('task-def.json', 'utf8'));
// Find the container that uses the data-repo image and update it
for (let container of taskDef.containerDefinitions) {
  if (container.image.includes('data-repo')) {
    container.image = '$ECR_TAG';
    console.log('Updated container image to: ' + container.image);
  }
}
// Remove fields that cannot be included in RegisterTaskDefinition
delete taskDef.taskDefinitionArn;
delete taskDef.revision;
delete taskDef.status;
delete taskDef.requiresAttributes;
delete taskDef.compatibilities;
delete taskDef.registeredAt;
delete taskDef.registeredBy;
fs.writeFileSync('new-task-def.json', JSON.stringify(taskDef, null, 2));
"

# Register the new task definition
echo "Registering new task definition..."
NEW_TASK_DEF=$(aws ecs register-task-definition --region eu-central-1 --cli-input-json file://new-task-def.json)
NEW_REVISION=$(echo $NEW_TASK_DEF | jq -r '.taskDefinition.revision')

echo "Successfully registered new task definition: $TASK_FAMILY:$NEW_REVISION"

# Clean up temporary files
rm task-def.json new-task-def.json

echo "Deployment complete!"