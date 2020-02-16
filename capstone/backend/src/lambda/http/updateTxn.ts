import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import {getUserIdFromEvent} from "../utils";
import {createLogger} from "../../utils/logger";
import {queryTXN, updateTXN} from "../../businessLogic/txns";
import {UpdateTxnRequest} from '../../requests/UpdateTxnRequest'
const logger = createLogger('updateTxn.ts');

//middy is not used here in purpose to show the plain way of handling CORS
//See how middy delegate CORS handling in createTxn.ts and getTxns.ts
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  const txnId = event.pathParameters.txnId;
  const updatedTxn: UpdateTxnRequest = JSON.parse(event.body);
  // Update a TXN item with the provided id using values in the "updatedTxn" object.
  // Extract userId from JWT authorization token string
  let userId = getUserIdFromEvent(event); //event.headers.Authorization;

  const result = await queryTXN(userId, txnId);
  if(result.Count < 1){
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        error: `Cannot find txn item ${txnId} for User(${userId}) to update. Have you created it initially?`
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
        error: `Found ${result.Count} items(${txnId}) for User(${userId}) to update. Are you sure your txnId is unique Key in your DynamoDB schema?`
      })
    }
  }
  let item = result.Items[0];

  const timestamp = new Date();
  item.name = updatedTxn.name;
  item.type = updatedTxn.type;
  item.amount = updatedTxn.amount;
  item.updatedAt = timestamp.toISOString();

  await updateTXN(item);

  logger.info(`User ${userId} successfully updated txn item ${txnId}`);

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: ""
  }
};

