import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient();
const TODOTable = process.env.TODOS_TABLE;
const todoIdIndex = process.env.TODO_ID_INDEX;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId;
  // TODO: Remove a TODO item by id
  let userId = "1"; //TODO: hard code user Id until resolve Auth0
  let exist = await todoIdExists(userId, todoId);
  if(!exist){
    return {
      statusCode: 404,
      body: `Error: item ${todoId} does not exist. Nothing to remove.`
    }
  }
  await docClient.delete({
    TableName: TODOTable,
    Key: {
      'userId': userId,
      'todoId': todoId
    }
  }).promise();
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ""
  }
};

async function todoIdExists(userId, todoId){
  const result = await docClient.get({
    TableName: TODOTable,
    Key:{
      'userId': userId,
      'todoId': todoId
    }
  }).promise();

  return !!result.Item;
}

