/**
 * The following code snippet is intended to run in the Lambda function interactive code editor on AWS console.
 * It allow fast turn-around time for debug. Other alternative is using serverless simulation that is covered in the course.
 */
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const TODOTable = process.env.TODOS_TABLE;
const indexName = process.env.TODO_INDEX; //createdAtIndex

exports.handler = async (event) => {
//   let userId = "1", todoId = "fd7d528f-f526-40b4-bf9d-7bc3408fe8ea";
//   const result1 = await queryByKey(userId, todoId);
//   let createdAt = "2020-02-03T08:59:59.851Z";
//   const result2 = await queryByIndex(createdAt);
    const connectionId = 'HWxgpcmdPHcCIQA=';
    const payload = {
        imageId: "123-abc"
    };
    await sendMessageToClient(connectionId, payload);
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ name: "dfgds"
            // "result1": result1,
            // "result2": result2
        })
    }
};

async function sendMessageToClient(connectionId, payload) {
    const stage = process.env.STAGE;
    const apiId = 'kij2b41j6l';//TODO: FIXME: process.env.API_ID returns undefined!!

    const connectionParams = {
        apiVersion: "2018-11-29",
        endpoint: `${apiId}.execute-api.us-west-2.amazonaws.com/${stage}`
    };
    const apiGateway = new AWS.ApiGatewayManagementApi(connectionParams);

    try {
        console.log('Sending message to a connection', connectionId);

        await apiGateway.postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify(payload),
        }).promise();

    } catch (e) {
        console.log('Failed to send message', JSON.stringify(e));
        if (e.statusCode === 410) {
            console.log('Stale connection');

            // await docClient.delete({
            //     TableName: connectionsTable,
            //     Key: {
            //         id: connectionId
            //     }
            // }).promise();
        }
    }
}
async function queryByKey(userId, todoId){
    const result = await docClient.query({
        TableName: TODOTable,
        ProjectionExpression: "userId, #n, done, dueDate", //select which column/attributes to return in the result
        KeyConditionExpression: 'todoId = :todoId and userId = :userId',  //similar to where clause in SQL
        ExpressionAttributeValues: {
            ':userId': "1",
            ':todoId': "fd7d528f-f526-40b4-bf9d-7bc3408fe8ea"
        },
        ExpressionAttributeNames:{ //to avoid attribute name conflict with DynamoDB keywords
            "#n": "name"
        }
    }).promise();

    return result;
}

async function queryByIndex(indexValue){
    const result = docClient.query({
        TableName: TODOTable,
        IndexName: indexName,
        KeyConditionExpression: 'createdAt = :createdAt',
        ExpressionAttributeValues:{
            ':createdAt': indexValue
        }
    }).promise();

    return result;
}
