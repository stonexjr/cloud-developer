import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'

//use version 2.3.3. The API of latest version has changed and is causing
//"new XAWS.DynamoDB.DocumentClient();" to fail
import * as AWSXRay from 'aws-xray-sdk'

import * as middy from 'middy'
import {cors} from 'middy/middlewares'
import {getUserId} from "../utils";
import {createLogger} from "../../utils/logger";
const logger = createLogger('createTodo.ts');

const XAWS = AWSXRay.captureAWS(AWS);
let docClient = new XAWS.DynamoDB.DocumentClient();
const TODOTable = process.env.TODOS_TABLE;


export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO: Get all TODO items for a current user
    //extract userId from JWT authorization token string
    let userId = getUserId(event); //event.headers.Authorization;
    // const result = await docClient.scan({
    //     TableName: TODOTable
    // }).promise();
    // const items = result.Items;
    const items = await getTODOPerUser(userId);
    logger.info(`User ${userId} queried ${items.length} items`);
    return {
        statusCode: 200,
        // headers:{//replaced by middy cors
        //     'Access-Control-Allow-Origin': '*',
        //     'Access-Control-Allow-Credentials': true
        // },
        body: JSON.stringify({
            items
        })
    }
});

//Use AWS.DynamoDB.DocumentClient()
async function getTODOPerUser(userId: string){
    let params = {
        TableName: TODOTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues:{
            ':userId': userId
        },
        ScanIndexForward: false
    };
    const result = await docClient.query(params).promise();
    return result.Items;
}

/*
//Use AWS.DynamoDB(), but the output JSON format contains type string such as S, N which are
//not compatible with frontend parser
// var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
async function getTODOPerUser2(userId: string){
    let params = {
        TableName: TODOTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues:{
            ':userId': {S: userId}  // ':userId': userId is not allowed
        },
        ScanIndexForward: false
    };
    const result = await ddb.query(params).promise();
    return result.Items;
}
 */


handler.use(cors({
    credentials: true
}));

