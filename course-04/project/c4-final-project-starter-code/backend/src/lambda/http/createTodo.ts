import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import * as AWS from 'aws-sdk'
import uuid from 'uuid';
import {getUploadUrl} from "./generateUploadUrl";

const docClient = new AWS.DynamoDB.DocumentClient();
const TODOTable = process.env.TODOS_TABLE;
const s3 = new AWS.S3({
  signatureVersion: 'v4'
});
const bucketName    = process.env.IMAGES_S3_BUCKET;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body);
  const todoId = uuid.v4();
  let userId = "1"; //TODO: hard code user Id until resolve Auth0
  // TODO: Implement creating a new TODO item
  const timestamp = new Date();
  const newItem = {
    todoId: todoId,
    ...newTodo,
    createdAt: timestamp.toISOString(),
    done: false,
    attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`, //client use this url to display image
    userId: userId
  };
  await docClient.put({
    TableName: TODOTable,
    Item: newItem
  }).promise();

  // get image upload url to S3
  const url = getUploadUrl(todoId);

  return {
    statusCode: 201,
    headers:{
        'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      item: newItem,
      uploadUrl: url
    })
  };
};



/*
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const TODOTable = process.env.TODOS_TABLE;

exports.handler = async (event) => {
  console.log("*******************************");
  console.log(event);
  console.log("*******************************");
  const newTodo = event.body;//JSON.parse(event.body);
  // const newTodo  = JSON.parse(event.body);
  const itemId = "132";
  const newItem = {
    todoId: itemId,
    ...newTodo,
    createdAt: new Date(),
    done: false,
    attachmentUrl: null,
    userId: "1"
  };
  await docClient.put({
    TableName: TODOTable,
    Item: newItem
  }).promise();

  return {
    statusCode: 201,
    headers:{
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      newItem
    })
  };
};

 */

/*
//test event
{
  "body":{
  "name": "Water flowers",
      "dueDate": "2019-06-11"
}
}
 */
