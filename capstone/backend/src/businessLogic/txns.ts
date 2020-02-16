import * as uuid from 'uuid'
import {TxnAccess} from "../dataLayer/txnAccess";
import {TxnItem} from "../models/TxnItem";
import {CreateTxnRequest} from "../requests/CreateTxnRequest";
import {getUserIdFromAuth} from "../lambda/utils";
import {createLogger} from "../utils/logger";
const logger = createLogger('businessLogic/txns.ts');

const txnAccess = new TxnAccess();

export async function getTXNSByUser(userId: string): Promise<TxnItem[]> {
    return txnAccess.getTXNPerUser(userId);
}

export async function createTXN(
    newTxnReq: CreateTxnRequest,
    jwtToken: string): Promise<TxnItem> {

    const txnId = uuid.v4();
    //extract userId from JWT authorization token string
    let userId = getUserIdFromAuth(jwtToken); //"bearer xdi1kjsldsl1"

    logger.info(`User ${userId} is creating new txn.`);

    const timestamp = new Date();
    const newItem = {
        txnId: txnId,
        ...newTxnReq,
        createdAt: timestamp.toISOString(),
        userId: userId
    };

    return await txnAccess.createTXN(newItem);
}

export async function queryTXN(userId: string, txnId: string): Promise<any>{
    return await txnAccess.queryTXN(userId, txnId);
}

export async function updateTXN(newItem: TxnItem): Promise<void>{
    await txnAccess.updateTXN(newItem);
}

export async function deleteTXN(userId: string, txnId: string): Promise<void>{
    await txnAccess.deleteTXN(userId, txnId);
}

export async function TXNExist(userId: string, txnId: string): Promise<boolean>{
    return await txnAccess.txnIdExists(userId, txnId);
}
export function getUploadUrl(key: string): string{
    return txnAccess.getS3UploadUrl(key);
}