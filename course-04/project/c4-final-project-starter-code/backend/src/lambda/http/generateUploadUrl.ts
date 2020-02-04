import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS  from 'aws-sdk'

const s3 = new AWS.S3({
  signatureVersion: 'v4'
});
const bucketName    = process.env.IMAGES_S3_BUCKET;
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId;
  const url = getUploadUrl(todoId);
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      url: url
    })
  };
};

export function getUploadUrl(id: string){
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: id,
    Expires: urlExpiration
  });
}