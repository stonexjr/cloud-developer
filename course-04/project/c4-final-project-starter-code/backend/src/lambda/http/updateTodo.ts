import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import * as AWS from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient();
const TODOTable = process.env.TODOS_TABLE;
const todoIdIndex = process.env.TODO_ID_INDEX;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId;
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);
  console.log("======= 1 =========");
  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  // check if the todoId exist
  let userId = "1"; //TODO: hard code user Id until resolve Auth0
  /*
  const validUserId = await todoIdExists(userId, todoId);
  console.log("======= 2 =========");

  if(!validUserId){
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: `User Id: ${userId} does not exist`
      })
    }
  }
  */

  const result = await queryTodoItemByTodoId(todoId);
  if(result.Count < 1){
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: `Cannot find todo item ${todoId} for User(${userId}) to update. Have you created it initially?`
      })
    }
  }
  if(result.Count > 1){
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: `Found ${result.Count} items(${todoId}) for User(${userId}) to update. Are you sure your todoId is unique Key in your DynamoDB schema?`
      })
    }
  }
  let item = result.Items[0];

  console.log("======= 3 =========");
  const timestamp = new Date();
  const newItem = {
    todoId: todoId,
    ...updatedTodo,
    updatedAt: timestamp.toISOString(),
    createdAt: item['createdAt'],
    attachmentUrl: item['attachmentUrl'], //TODO: update attachment URL
    userId: userId //TODO: hardcode userId at this moment
  };
  console.log("======= 4 =========");
  await docClient.put({
    TableName: TODOTable,
    Item: newItem
  }).promise();
  console.log("======= 5 =========");

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      newItem
    })
  }
};

async function todoIdExists(userId, todoId){
  const result = await docClient.get({
    TableName: TODOTable,
    Key:{
      'todoId': todoId, //todoId
      'userId': userId
    }
  }).promise();

  return !!result.Item;
}

async function queryTodoItemByTodoId(todoId: string){
  const result = await docClient.query({
    TableName: TODOTable,
    IndexName: todoIdIndex,
    KeyConditionExpression: 'todoId = :todoId',
    ExpressionAttributeValues: {
      ':todoId': todoId
    }
  }).promise();

  return result;
}
