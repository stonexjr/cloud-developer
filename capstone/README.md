# Serverless Personal financial transaction manager

The topic of this capstone project is to implement a personal financial transaction manager
that keep track of user's daily cash flow in terms income and expense.

# Functionality of the application

This application will allow creating/removing/updating/fetching transaction items. Each transaction item can optionally have an attachment image. Each user only has access to 
transaction items that he/she has created.

# transaction items

The application should store transaction items, and each transaction item contains the following fields:

* `userId` (string) - a unique id for a user that created this transaction
* `txnId` (string) - a unique id for an transaction
* `createdAt` (string) - date and time when a transaction occurs
* `name` (string) - name of a transaction item (e.g. "Grocery expense" or "Jan. salary")
* `type` (string) - type of a transaction item (e.g. "Health", "Grocery" or "Travel")
* `amount` (number) - the amount incured in an transaction in US dollar
* `attachmentUrl` (string) (optional) - a URL pointing to an image of a receipt or paycheck

User id is also store and are associated with each transaction item he/she created.

# Functions to be implemented

To implement this project, the following functions are implemented and configured in the `serverless.yml` file:

* `Auth` - This function implements a custom authorizer for API Gateway that is added to all other functions.

* `GetTxns` - This function returns all transactions for a current user. A user id is extracted from a JWT token that is sent by the frontend

It returns data that looks like this:

```json
{
  "items": [
    {
      "userId": "xdv489f2394fh49f",
      "txnId": "9448fbs9blqeufd123",
      "createdAt": "2019-07-27T20:01:45.424Z",
      "name": "Grocery expense in Costco",
      "type": "grocery",
      "amount": 125,
      "attachmentUrl": "http://s3-bucket-name.aws.us-west-2/receipt.png"
    },
    {
      "userId": "xdv489f2394fh49f",
      "txnId": "7118fbs9blqeufd8hx7",
      "createdAt": "2019-01-27T20:01:45.424Z",
      "name": "Jan Salary",
      "type": "income",
      "amount": "3000",
      "attachmentUrl": "http://s3-bucket-name.aws.us-west-2/paystub-202001.png"
    },
  ]
}
```

* `CreateTxn` - should create a new transaction for a current user. A shape of data send by a client application to this function can be found in the `CreateTodoRequest.ts` file

It receives a new transaction item to be created in JSON format that looks like this:

```json
{
  "createdAt": "2019-07-27T20:01:45.424Z",
  "name": "Feb PG&E bill",
  "amount": 181,
  "attachmentUrl": "http://example.com/image.png"
}
```

It returns a new transaction item that looks like this:

```json
{
  "item": {
    "txnId": "7118fbs9blqeufd8hx7",
    "createdAt": "2019-07-27T20:01:45.424Z",
    "name": "Feb PG&E bill",
    "dueDate": "2019-07-29T20:01:45.424Z",
    "amount": 181,
    "attachmentUrl": "http://example.com/image.png"
  }
}
```

* `UpdateTxn` - updates a transaction item created by a current user. A shape of data send by a client application to this 
function can be found in the `UpdateTxnRequest.ts` file

It receives an object that contains three fields that can be updated in a transaction item:

```json
{
  "name": "Jan ATT bill",
  "type": "wireless",
  "amount": 100
}
```

The id of an item that should be updated is passed as a URL parameter.

It should return an empty body.

* `DeleteTxn` - deletes a transaction item created by a current user. Expects an id of a transaction item to remove.

It returns an empty body.

* `GenerateUploadUrl` - returns a pre-signed URL that can be used to upload an attachment file for a transaction.

It returns a JSON object that looks like this:

```json
{
  "uploadUrl": "https://s3-bucket-name.s3.eu-west-2.amazonaws.com/receipt.png"
}
```

All functions are already connected to appropriate events from API Gateway.

An id of a user can be extracted from a JWT token passed by a client.

You also need to add any necessary resources to the `resources` section of the `serverless.yml` file such as DynamoDB table and S3 bucket.


# Frontend

The `client` folder contains a web application that can use the API that should be developed in the project.

This frontend should work with your serverless application once it is developed, you don't need to make any changes to the code. 
The only file that you need to edit is the `config.ts` file in the `client` folder. This file configures your client application just 
as it was done in the course and contains an API endpoint and Auth0 configuration:

```ts
const apiId = '...' API Gateway id
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  domain: '...',    // Domain from Auth0
  clientId: '...',  // Client id from an Auth0 application
  callbackUrl: 'http://localhost:3000/callback'
}
```

## Authentication

To implement authentication in your application, you would have to create an Auth0 application and copy "domain" and 
"client id" to the `config.ts` file in the `client` folder. We recommend using asymmetrically encrypted JWT tokens.

## Logging

The starter code comes with a configured [Winston](https://github.com/winstonjs/winston) logger that creates 
[JSON formatted](https://stackify.com/what-is-structured-logging-and-why-developers-need-it/) log statements. 
We use it to write log messages like this:

```ts
import { createLogger } from '../../utils/logger'
const logger = createLogger('auth')

// You can provide additional information with every log statement
// This information can then be used to search for log statements in a log storage system
logger.info('User was authorized', {
  // Additional information stored with a log statement
  key: 'value'
})
```


# Grading the submission

Once you have finished developing your application, please set `apiId` and Auth0 parameters in the `config.ts` file in the `client` folder. A reviewer would start the React development server to run the frontend that should be configured to interact with your serverless application.

**IMPORTANT**

*Please leave your application running until a submission is reviewed. If implemented correctly it will cost almost nothing when your application is idle.*

# Suggestions

To store transaction items, we use a DynamoDB table with local secondary index(es). 
A create a local secondary index you need to create a DynamoDB resource like this:

```yml

TodosTable:
  Type: AWS::DynamoDB::Table
  Properties:
    AttributeDefinitions:
      - AttributeName: partitionKey
        AttributeType: S
      - AttributeName: sortKey
        AttributeType: S
      - AttributeName: indexKey
        AttributeType: S
    KeySchema:
      - AttributeName: partitionKey
        KeyType: HASH
      - AttributeName: sortKey
        KeyType: RANGE
    BillingMode: PAY_PER_REQUEST
    TableName: ${self:provider.environment.transactionS_TABLE}
    LocalSecondaryIndexes:
      - IndexName: ${self:provider.environment.INDEX_NAME}
        KeySchema:
          - AttributeName: partitionKey
            KeyType: HASH
          - AttributeName: indexKey
            KeyType: RANGE
        Projection:
          ProjectionType: ALL # What attributes will be copied to an index

```

To query an index you need to use the `query()` method like:

```ts
await this.dynamoDBClient
  .query({
    TableName: 'table-name',
    IndexName: 'index-name',
    KeyConditionExpression: 'paritionKey = :paritionKey',
    ExpressionAttributeValues: {
      ':paritionKey': partitionKeyValue
    }
  })
  .promise()
```

# How to run the application

## Backend

To deploy an application run the following commands:

```
cd backend
npm install
sls deploy -v
```

## Frontend

To run a client application first edit the `client/src/config.ts` file to set correct parameters. And then run the following commands:

```
cd client
npm install
npm run start
```

This should start a development server with the React application that will interact with the serverless transaction application.

# Postman collection

An alternative way to test your API, you can use the Postman collection that contains sample requests. You can find a Postman collection in this project. To import this collection, do the following.

Click on the import button:

![Alt text](images/import-collection-1.png?raw=true "Image 1")


Click on the "Choose Files":

![Alt text](images/import-collection-2.png?raw=true "Image 2")


Select a file to import:

![Alt text](images/import-collection-3.png?raw=true "Image 3")


Right click on the imported collection to set variables for the collection:

![Alt text](images/import-collection-4.png?raw=true "Image 4")

Provide variables for the collection (similarly to how this was done in the course):

![Alt text](images/import-collection-5.png?raw=true "Image 5")

# Serverless Cheetsheet
Install serverless
```bash
npm install -g serverless
```
Configure serverless to use the AWS credentials you just set up:   
```bash
sls config credentials --provider aws --key YOUR_ACCESS_KEY \
 --secret YOUR_SECRET_KEY --profile serverless
```
To get a list of the available serverless templates run:
```bash
sls create --template
```
To create a serverless boilerplate project:

```bash
sls create --template aws-nodejs-typescript --path 10-udagram-app
```
To deploy the application:  
  1. Install the dependencies:
  ```bash
    npm install
  ```
  2. Deploy the application
  ```bash
    sls deploy -v
  ```

Note: if you get a permissions error when you run `deploy` you may need to specify the user profile
```bash
sls deploy -v --aws-profile serverless
```

Accessing WebSocket API
wscat - WebSocket CLI client  
Install  
```bash
npm install wscat -g
```

Connect  
```bash
wscat -c wss://<apiid>.execute-api.us-west-2.amazonaws.com/dev
```

local debug serverless
```bash
sls invoke local --function function-name-serverless.yaml
--event '{"headers":{"Authorization": "123"}' 
--context '{"key": "value"}'
--stage dev # stage name
--region us-west-2 # AWS region name
--type RequestResponse # Invocation type
```
```bash
sls invoke local --function GetTodos 
--path <path/to/json-event>
--contextPath <path/to/json-context>
```
```bash
npm install serverless-dynamodb-local
npm install serverless-offline
# Run DynamoDB locally
sls dynamodb install
sls dynamodb start

# Run a web server locally
sls offline
```