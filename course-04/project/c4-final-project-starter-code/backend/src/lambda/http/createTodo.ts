import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import * as middy from 'middy'
import {cors} from 'middy/middlewares'
import {createLogger} from "../../utils/logger";
import {createTODO, getUploadUrl} from "../../businessLogic/todos";
const logger = createLogger('createTodo.ts');

export const handler = middy(async (event: APIGatewayProxyEvent, context): Promise<APIGatewayProxyResult> => {
  const newTodoReq: CreateTodoRequest = JSON.parse(event.body);
  const newTodo = await createTODO(newTodoReq, event.headers.Authorization);

  // get image upload url to S3
  const url = getUploadUrl(newTodo.todoId);//getUploadUrl(todoId);

  return {
    statusCode: 201,
    // headers:{//replaced by middy cors
    //     'Access-Control-Allow-Origin': '*',
    //     'Access-Control-Allow-Credentials': true
    // },
    body: JSON.stringify({
      item: newTodo,
      uploadUrl: url
    })
  };
});

handler.use(cors({
  credentials: true
}));

