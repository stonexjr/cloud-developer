import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient();
const TODOTable = process.env.TODOS_TABLE;
const todoIdIndex = process.env.TODO_ID_INDEX;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId;
  // TODO: Remove a TODO item by id
  return {
    statusCode: 200,
    body: JSON.stringify(todoId)
  }
};
