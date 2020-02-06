import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import {parseUserId} from "../../auth/utils";
import {getUserId} from "../utils";
import {createLogger} from "../../utils/logger";
const logger = createLogger('createTodo.ts');

const docClient = new AWS.DynamoDB.DocumentClient();
const TODOTable = process.env.TODOS_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            items
        })
    }
};

async function getTODOPerUser(userId: string){
    const result = await docClient.query({
        TableName: TODOTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues:{
            ':userId': userId
        },
        ScanIndexForward: false
    }).promise();
    return result.Items
}

/*
'use strict';
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const todoTable = process.env.TODOS_TABLE;

exports.handler = async (event) => {
    // TODO: Get all TODO items for a current user
    const result = await docClient.scan({
        TableName: todoTable
    }).promise();
    const items = result.Items;
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            items
        })
    }
};
*/
