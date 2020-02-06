import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import {parseUserId} from "../../auth/utils";
import {getUserId} from "../utils";
import {createLogger} from "../../utils/logger";
const logger = createLogger('createTodo.ts');

const docClient = new AWS.DynamoDB.DocumentClient();
const TODOTable = process.env.TODOS_TABLE;
// const todoIdIndex = process.env.TODO_ID_INDEX;

//middy is not used here in purpose to show the plain way of handling CORS
//See how middy delegate CORS handling in createTodo.ts and getTodos.ts
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId;
  // TODO: Remove a TODO item by id
  //extract userId from JWT authorization token string
  let userId = getUserId(event); //event.headers.Authorization;
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

  logger.info(`User ${userId} successfully deleted todo item ${todoId}`);
  logger.info(`User ${userId} is creating new todo.`);
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
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

