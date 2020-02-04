import {SNSHandler, SNSEvent, S3Event, SNSEventRecord} from 'aws-lambda'
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient();

const connectionsTable = process.env.CONNECTIONS_TABLE;
const stage = process.env.STAGE;
const apiId = process.env.API_ID;

const connectionParams = {
    apiVersion: "2018-11-29",
    endpoint: `${apiId}.execute-api.us-west-2.amazonaws.com/${stage}`
};

const apiGateway = new AWS.ApiGatewayManagementApi(connectionParams);

export const handler: SNSHandler = async (event: SNSEvent) => {
    console.log('Processing SNS event ', JSON.stringify(event));
    //TODO: finish S3 event handler
    for (const snsRecord of event.Records) {
        // const s3EventStr = snsRecord.Sns.Message;
        const s3ObjKey = snsRecord['s3'].object.key;
        console.log('Processing S3 event with key', s3ObjKey);
        // const s3Event = JSON.parse(s3EventStr);
        await processS3Event(snsRecord);
    }
};

async function processS3Event(record: SNSEventRecord) {
    // for (const record of s3Event.Records) {
    const key = record['s3'].object.key;
    console.log('Processing S3 item with key: ', key);

    const connections = await docClient.scan({
        TableName: connectionsTable
    }).promise();

    const payload = {
        imageId: key
    };

    for (const connection of connections.Items) {
        const connectionId = connection.id;
        await sendMessageToClient(connectionId, payload)
    }
    // }
}

async function sendMessageToClient(connectionId, payload) {
    try {
        console.log('Sending message to a connection', connectionId);
        console.log('Sending message via api endpoint', connectionParams.endpoint);

        await apiGateway.postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify(payload),
        }).promise();

    } catch (e) {
        console.log('Failed to send message', JSON.stringify(e));
        if (e.statusCode === 410) {
            console.log('Stale connection');

            await docClient.delete({
                TableName: connectionsTable,
                Key: {
                    id: connectionId
                }
            }).promise();
        }
    }
}
//A sample of SNSEvent instance
/*
{
    "Records": [
    {
        "eventVersion": "2.1",
        "eventSource": "aws:s3",
        "awsRegion": "us-west-2",
        "eventTime": "2020-02-04T01:48:35.850Z",
        "eventName": "ObjectCreated:Put",
        "userIdentity": {
            "principalId": "AWS:AROA3XHH3JEXNWO6RX7HX:serverless-todo-app-dev-CreateTodo"
        },
        "requestParameters": {
            "sourceIPAddress": "75.7.0.54"
        },
        "responseElements": {
            "x-amz-request-id": "C3EA48C203DDB19B",
            "x-amz-id-2": "iCC5INw1E6q0f7j3n2Tt+RnqRWlvrua8o4pwjxTlCdumw86JP8AGniVbjwI4+2Rz1B+vea1xKuSqOIxeTqJciJuKjrKDD1sJ"
        },
        "s3": {
            "s3SchemaVersion": "1.0",
            "configurationId": "serverless-todo-app-dev-SendUploadNotifications-68a737133cefb25bff959852b8f04754",
            "bucket": {
                "name": "serverless-todo-image-jinrong-dev-2",
                "ownerIdentity": {
                    "principalId": "A4Z7F3PO6C8P7"
                },
                "arn": "arn:aws:s3:::serverless-todo-image-jinrong-dev-2"
            },
            "object": {
                "key": "f7a2f347-e046-4e65-a7aa-9fbb6cee5d06",
                "size": 30690,
                "eTag": "e44b99c01e77194f4ba9336c18553e84",
                "sequencer": "005E38CD772B43A44F"
            }
        }
    }
]
}
*/