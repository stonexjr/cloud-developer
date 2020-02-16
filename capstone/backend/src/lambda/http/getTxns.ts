import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import * as middy from 'middy'
import {cors} from 'middy/middlewares'
import {getUserIdFromEvent} from "../utils";
import {createLogger} from "../../utils/logger";
import {getTXNSByUser} from "../../businessLogic/txns";
const logger = createLogger('getTxns.ts');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Get all TXN items for a current user
    // Extract userId from JWT authorization token string
    let userId = getUserIdFromEvent(event);
    // Query transcation by user id
    const items = await getTXNSByUser(userId);
    logger.info(`User ${userId} queried ${items.length} transcations`);
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

