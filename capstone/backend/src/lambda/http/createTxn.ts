import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTxnRequest } from '../../requests/CreateTxnRequest'
import * as middy from 'middy'
import {cors} from 'middy/middlewares'
import {createLogger} from "../../utils/logger";
import {createTXN, getUploadUrl} from "../../businessLogic/txns";
const logger = createLogger('createTxn.ts');

export const handler = middy(async (event: APIGatewayProxyEvent, context): Promise<APIGatewayProxyResult> => {
  const newTxnReq: CreateTxnRequest = JSON.parse(event.body);
  const newTxn = await createTXN(newTxnReq, event.headers.Authorization);

  // get image upload url to S3
  const url = getUploadUrl(newTxn.txnId);

  return {
    statusCode: 201,
    // headers:{//replaced by middy cors
    //     'Access-Control-Allow-Origin': '*',
    //     'Access-Control-Allow-Credentials': true
    // },
    body: JSON.stringify({
      item: newTxn,
      uploadUrl: url
    })
  };
});

handler.use(cors({
  credentials: true
}));

