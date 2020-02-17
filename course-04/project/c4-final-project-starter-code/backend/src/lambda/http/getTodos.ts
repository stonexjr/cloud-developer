import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import * as middy from 'middy'
import {cors} from 'middy/middlewares'
import {getUserIdFromEvent} from "../utils";
import {createLogger} from "../../utils/logger";
import {getTODOByUser} from "../../businessLogic/todos";
const logger = createLogger('createTodo.ts');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO: Get all TODO items for a current user
    //extract userId from JWT authorization token string
    let userId = getUserIdFromEvent(event); //event.headers.Authorization;
    // const result = await docClient.scan({
    //     TableName: TODOTable
    // }).promise();
    // const items = result.Items;
    const items = await getTODOByUser(userId);
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

handler.use(cors({
    credentials: true
}));

