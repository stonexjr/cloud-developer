import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import * as AWS from 'aws-sdk'
import uuid from 'uuid';
import * as middy from 'middy'
import {cors} from 'middy/middlewares'
import {getUploadUrl} from "./generateUploadUrl";
import {getUserId} from "../utils";
import {createLogger} from "../../utils/logger";
const logger = createLogger('createTodo.ts');

const docClient = new AWS.DynamoDB.DocumentClient();
const TODOTable = process.env.TODOS_TABLE;
const s3 = new AWS.S3({
  signatureVersion: 'v4'
});
const bucketName    = process.env.IMAGES_S3_BUCKET;

export const handler = middy(async (event: APIGatewayProxyEvent, context): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body);
  const todoId = uuid.v4();
  //extract userId from JWT authorization token string
  let userId = getUserId(event); //event.headers.Authorization;
  // TODO: Implement creating a new TODO item
  logger.info(`User ${userId} is creating new todo.`);
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
    // headers:{//replaced by middy cors
    //     'Access-Control-Allow-Origin': '*',
    //     'Access-Control-Allow-Credentials': true
    // },
    body: JSON.stringify({
      item: newItem,
      uploadUrl: url
    })
  };
});

handler.use(cors({
  credentials: true
}));

