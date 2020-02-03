import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import * as AWS from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient();
const TODOTable = process.env.TODOS_TABLE;
const todoIdIndex = process.env.TODO_INDEX;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId;
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);
  console.log("======= 1 =========");
  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  // check if the todoId exist
  let userId = "1"; //TODO: hard code user Id until resolve Auth0
  /* method II to check if pair(userId, todoId) exist
  const validUserId = await todoIdExists(userId, todoId);
  console.log("======= 2 =========");

  if(!validUserId){
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: `pair(userId: ${userId}, todoId: ${todoId}) does not exist`
      })
    }
  }
  */
  const result = await queryTodoItem(userId, todoId);
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

  //https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.NodeJs.03.html
  await docClient.update({//TODO: why it's not work?
    TableName: TODOTable,
    Key:{//https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/WorkingWithItems.html#WorkingWithItems.ReadingData
      userId: userId,
      todoId: todoId
    },
    UpdateExpression: "set #n = :name, dueDate = :dueDate, done = :done, updatedAt = :updatedAt",
    ExpressionAttributeValues:{
      ":name": updatedTodo['name'],
      ":dueDate": updatedTodo['dueDate'],
      ':done': updatedTodo['done'],
      ':updatedAt': timestamp.toISOString()
    },
    ExpressionAttributeNames:{
      "#n": "name"  //attribute "name" is a reserved keyword in DynamoDB. See https://intellipaat.com/community/17771/update-attribute-timestamp-reserved-word
    },
    ReturnValues: "UPDATED_NEW"
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

async function queryTodoItem(userId: string, todoId: string){
  const result = await docClient.query({
    TableName: TODOTable,
    // IndexName: todoIdIndex,
    ProjectionExpression: "userId, #n, done, dueDate, attachmentUrl, createdAt",
    KeyConditionExpression: 'todoId = :todoId and userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
      ':todoId': todoId
    },
    ExpressionAttributeNames:{
      '#n': 'name'
    }
  }).promise();

  return result;
}
//TODO: FIXME. Error: The provided key element does not match the schema
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

