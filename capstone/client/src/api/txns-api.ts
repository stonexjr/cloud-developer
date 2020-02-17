import { apiEndpoint } from '../config'
import { Txn } from '../types/Txn';
import { CreateTxnRequest } from '../types/CreateTxnRequest';
import Axios from 'axios'
import { UpdateTxnRequest } from '../types/UpdateTxnRequest';

export async function getTxns(idToken: string): Promise<Txn[]> {
  console.log('Fetching txns');

  const response = await Axios.get(`${apiEndpoint}/txns`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  });
  console.log('Txns:', response.data);
  return response.data.items
}

export async function createTxn(
  idToken: string,
  newTxn: CreateTxnRequest
): Promise<Txn> {
  console.log('texns-api.ts: Creating txn');
  const response = await Axios.post(`${apiEndpoint}/txns`,  JSON.stringify(newTxn), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  });
  return response.data.item;
}

export async function patchTxn(
  idToken: string,
  txnId: string,
  updatedTxn: UpdateTxnRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/txns/${txnId}`, JSON.stringify(updatedTxn), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteTxn(
  idToken: string,
  txnId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/txns/${txnId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  txnId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/txns/${txnId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  });
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
