import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
// import * as AWS from 'aws-sdk'

//use version 2.3.3. The API of latest version has changed and is causing
//"new XAWS.DynamoDB.DocumentClient();" to fail
// import * as AWSXRay from 'aws-xray-sdk'

// import {parseUserId} from "../../auth/utils";
import {getUserIdFromEvent} from "../utils";
import {createLogger} from "../../utils/logger";
import {deleteTODO, TODOExist} from "../../businessLogic/todos";
const logger = createLogger('createTodo.ts');

// const XAWS = AWSXRay.captureAWS(AWS);
// const docClient = new XAWS.DynamoDB.DocumentClient();
// const TODOTable = process.env.TODOS_TABLE;
// const todoIdIndex = process.env.TODO_ID_INDEX;

//middy is not used here in purpose to show the plain way of handling CORS
//See how middy delegate CORS handling in createTodo.ts and getTodos.ts
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  const todoId = event.pathParameters.todoId;

  // TODO: Remove a TODO item by id
  //extract userId from JWT authorization token string
  let userId = getUserIdFromEvent(event); //event.headers.Authorization;

  let exist = await TODOExist(userId, todoId); //todoIdExists(userId, todoId);
  if(!exist){
    return {
      statusCode: 404,
      body: `Error: item ${todoId} does not exist. Nothing to remove.`
    }
  }
  await deleteTODO(userId, todoId);
  /*
  await docClient.delete({
    TableName: TODOTable,
    Key: {
      'userId': userId,
      'todoId': todoId
    }
  }).promise();
  */
  logger.info(`User ${userId} successfully deleted todo item ${todoId}`);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: ""
  }
};

/*
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
 */

