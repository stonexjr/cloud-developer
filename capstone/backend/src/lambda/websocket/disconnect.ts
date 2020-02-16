import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
// const XAWS = AWSXRay.captureAWS(AWS)

const docClient = new AWS.DynamoDB.DocumentClient();

const connectionsTable = process.env.CONNECTIONS_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Websocket disconnect', event);

    const connectionId = event.requestContext.connectionId;

    console.log('Removing item with key: ', connectionId);

    await docClient.delete({
        TableName: connectionsTable,
        Key: {
            id: connectionId
        }
    }).promise();

    return {
        statusCode: 200,
        body: ''
    }
};
