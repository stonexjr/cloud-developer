import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
// import * as AWS from 'aws-sdk'

//use aws-sdk version 2.3.3. The API of latest version has changed and is causing
//"new XAWS.DynamoDB.DocumentClient();" to fail
// import * as AWSXRay from 'aws-xray-sdk'

// import {parseUserId} from "../../auth/utils";
import {getUserIdFromEvent} from "../utils";
import {createLogger} from "../../utils/logger";
import {deleteTXN, TXNExist} from "../../businessLogic/txns";
const logger = createLogger('deleteTxn.ts');

//middy is not used here in purpose to show the plain way of handling CORS
//See how middy delegate CORS handling in createTxn.ts and getTxns.ts
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  const txnId = event.pathParameters.txnId;

  // Remove a TXN item by id
  //extract userId from JWT authorization token string
  let userId = getUserIdFromEvent(event); //event.headers.Authorization;

  let exist = await TXNExist(userId, txnId); //txnIdExists(userId, txnId);
  if(!exist){
    return {
      statusCode: 404,
      body: `Error: txn ${txnId} does not exist. Nothing to remove.`
    }
  }
  await deleteTXN(userId, txnId);
  logger.info(`Successfully deleted txn ${txnId} from user ${userId} `);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: ""
  }
};
