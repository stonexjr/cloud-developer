import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import {getUserIdFromEvent} from "../utils";
import {createLogger} from "../../utils/logger";
import {queryTODO, updateTODO} from "../../businessLogic/todos";
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
const logger = createLogger('createTodo.ts');

//middy is not used here in purpose to show the plain way of handling CORS
//See how middy delegate CORS handling in createTodo.ts and getTodos.ts
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  const todoId = event.pathParameters.todoId;
  // console.log(`todoId=${todoId}`);
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);
  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  //extract userId from JWT authorization token string
  let userId = getUserIdFromEvent(event); //event.headers.Authorization;

  const result = await queryTODO(userId, todoId);//queryTodoItem(userId, todoId);
  if(result.Count < 1){
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
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
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        error: `Found ${result.Count} items(${todoId}) for User(${userId}) to update. Are you sure your todoId is unique Key in your DynamoDB schema?`
      })
    }
  }
  let item = result.Items[0];

  const timestamp = new Date();
  item.name = updatedTodo.name;
  item.dueDate = updatedTodo.dueDate;
  item.done = updatedTodo.done;
  item.updatedAt = timestamp.toISOString();

  await updateTODO(item);

  logger.info(`User ${userId} successfully updated todo item ${todoId}`);

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: ""
  }
};

