import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient();
const TODOTable = process.env.TODOS_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
    let userId = "1"; //TODO: hard code user Id until resolve Auth0
    // const result = await docClient.scan({
    //     TableName: TODOTable
    // }).promise();
    // const items = result.Items;
    const items = await getTODOPerUser(userId);
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
