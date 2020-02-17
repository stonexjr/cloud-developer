import * as AWS from 'aws-sdk'
import {DocumentClient} from "aws-sdk/clients/dynamodb";
import * as S3 from "aws-sdk/clients/s3";

// use aws-sdk version 2.3.3. The API of latest version has changed
// and is causing "new XAWS.DynamoDB.DocumentClient();" to fail
import * as AWSXRay from 'aws-xray-sdk'

import {createLogger} from "../utils/logger";
const logger = createLogger('txnAccess.ts');

const XAWS = AWSXRay.captureAWS(AWS);

import {TxnItem} from "../models/TxnItem";

export class TxnAccess {
    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly txnsTable: string = process.env.TXNS_TABLE,
        private readonly bucketName: string = process.env.IMAGES_S3_BUCKET,
        private readonly urlExpiration: string = process.env.SIGNED_URL_EXPIRATION,
        private readonly s3: S3 = new AWS.S3({signatureVersion: 'v4'})
    ) {
    }

    async getTXNPerUser(userId: string): Promise<TxnItem[]>{
        let params = {
            TableName: this.txnsTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues:{
                ':userId': userId
            },
            ScanIndexForward: false
        };
        const result = await this.docClient.query(params).promise();
        return result.Items as TxnItem[];
    }

    async queryTXN(userId: string, txnId: string): Promise<any> {
        const result = await this.docClient.query({
            TableName: this.txnsTable,
            // IndexName: txnIdIndex,
            ProjectionExpression: "userId, txnId, #n, attachmentUrl, createdAt",
            KeyConditionExpression: 'txnId = :txnId and userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':txnId': txnId
            },
            ExpressionAttributeNames:{
                '#n': 'name'
            }
        }).promise();

        return result;
    }

    async createTXN(txnItem: TxnItem): Promise<TxnItem>{
        txnItem['attachmentUrl'] = `https://${this.bucketName}.s3.amazonaws.com/${txnItem.txnId}`; //client use this url to display image
        await this.docClient.put({
            TableName: this.txnsTable,
            Item: txnItem
        }).promise();

        return txnItem;
    }

    async updateTXN(newTxn: TxnItem): Promise<void>{
        //https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.NodeJs.03.html
        await this.docClient.update({
            TableName: this.txnsTable,
            Key:{//https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/WorkingWithItems.html#WorkingWithItems.ReadingData
                userId: newTxn.userId,
                txnId: newTxn.txnId
            },
            UpdateExpression: "set #n = :name, #t = :type, amount = :amount, updatedAt = :updatedAt",
            ExpressionAttributeValues:{
                ":name": newTxn.name,
                ":type": newTxn.type,
                ':amount': newTxn.amount,
                ':updatedAt': new Date().toISOString()
            },
            ExpressionAttributeNames:{
                "#n": "name", //attribute "name" is a reserved keyword in DynamoDB. See https://intellipaat.com/community/17771/update-attribute-timestamp-reserved-word
                "#t": "type"  //attribute "type" is a reserved keyword in DynamoDB.
            },
            ReturnValues: "UPDATED_NEW"
        }).promise();
    }

    async deleteTXN(userId: string, txnId: string): Promise<void>{
        await this.docClient.delete({
            TableName: this.txnsTable,
            Key: {
                'userId': userId,
                'txnId': txnId
            }
        }).promise();
    }

    async txnIdExists(userId: string, txnId: string): Promise<boolean>{
        const result = await this.docClient.get({
            TableName: this.txnsTable,
            Key:{
                'userId': userId,
                'txnId': txnId
            }
        }).promise();

        return !!result.Item;
    }

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