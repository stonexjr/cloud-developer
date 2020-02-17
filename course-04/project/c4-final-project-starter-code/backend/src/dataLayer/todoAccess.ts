import * as AWS from 'aws-sdk'
import {DocumentClient} from "aws-sdk/clients/dynamodb";
import * as S3 from "aws-sdk/clients/s3";

//use version 2.3.3. The API of latest version has changed
// and is causing "new XAWS.DynamoDB.DocumentClient();" to fail
import * as AWSXRay from 'aws-xray-sdk'

import {createLogger} from "../utils/logger";
const logger = createLogger('createTodo.ts');

const XAWS = AWSXRay.captureAWS(AWS);

import {TodoItem} from "../models/TodoItem";

export class TodoAccess {
    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable: string = process.env.TODOS_TABLE,
        private readonly bucketName: string = process.env.IMAGES_S3_BUCKET,
        private readonly urlExpiration: string = process.env.SIGNED_URL_EXPIRATION,
        private readonly s3: S3 = new AWS.S3({signatureVersion: 'v4'})
    ) {
    }

    async getTODOPerUser(userId: string): Promise<TodoItem[]>{
        let params = {
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues:{
                ':userId': userId
            },
            ScanIndexForward: false
        };
        const result = await this.docClient.query(params).promise();
        return result.Items as TodoItem[];
    }

    async queryTODO(userId: string, todoId: string): Promise<any> {
        const result = await this.docClient.query({
            TableName: this.todosTable,
            // IndexName: todoIdIndex,
            ProjectionExpression: "userId, todoId, #n, done, dueDate, attachmentUrl, createdAt",
            KeyConditionExpression: 'todoId = :todoId and userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':todoId': todoId
            },
            ExpressionAttributeNames:{
                '#n': 'name'
            }
        }).promise();

        return result;
    }

    async createTODO(todoItem: TodoItem): Promise<TodoItem>{
        todoItem['attachmentUrl'] = `https://${this.bucketName}.s3.amazonaws.com/${todoItem.todoId}`; //client use this url to display image
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todoItem
        }).promise();

        return todoItem;
    }

    async updateTODO(newTodo: TodoItem): Promise<void>{
        //https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.NodeJs.03.html
        await this.docClient.update({
            TableName: this.todosTable,
            Key:{//https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/WorkingWithItems.html#WorkingWithItems.ReadingData
                userId: newTodo.userId,
                todoId: newTodo.todoId
            },
            UpdateExpression: "set #n = :name, dueDate = :dueDate, done = :done, updatedAt = :updatedAt",
            ExpressionAttributeValues:{
                ":name": newTodo['name'],
                ":dueDate": newTodo['dueDate'],
                ':done': newTodo['done'],
                ':updatedAt': new Date().toISOString()
            },
            ExpressionAttributeNames:{
                "#n": "name"  //attribute "name" is a reserved keyword in DynamoDB. See https://intellipaat.com/community/17771/update-attribute-timestamp-reserved-word
            },
            ReturnValues: "UPDATED_NEW"
        }).promise();
    }

    async deleteTODO(userId: string, todoId: string): Promise<void>{
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                'userId': userId,
                'todoId': todoId
            }
        }).promise();
    }

    async todoIdExists(userId: string, todoId: string): Promise<boolean>{
        const result = await this.docClient.get({
            TableName: this.todosTable,
            Key:{
                'userId': userId,
                'todoId': todoId
            }
        }).promise();

        return !!result.Item;
    }
    // check if the todoId exist
    /* method II to check if pair(userId, todoId) exist
    const validUserId = await todoIdExists(userId, todoId);

    if(!validUserId){
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          error: `pair(userId: ${userId}, todoId: ${todoId}) does not exist`
        })
      }
    }
    */
    /*
    //Use AWS.DynamoDB(), but the output JSON format contains type string such as S, N which are
    //not compatible with frontend parser
    // var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
    async getTODOPerUser2(userId: string): Promise<TodoItem[]>{
        let params = {
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues:{
                ':userId': {S: userId}  // ':userId': userId is not allowed
            },
            ScanIndexForward: false
        };
        const result = await this.ddb.query(params).promise();
        return result.Items as TodoItem[];
    }
    */
    getS3UploadUrl(id: string): string {
        return this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: id,
            Expires: this.urlExpiration
        });
    }

}

function createDynamoDBClient(){
    if (process.env.IS_OFFLINE) {
        logger.info('Creating a local DynamoDB instance');
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        });
    }

    return new XAWS.DynamoDB.DocumentClient();
}