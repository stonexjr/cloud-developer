export interface Txn {
  userId: string
  txnId: string
  createdAt: string
  name: string
  type: string
  amount: number
  attachmentUrl?: string
  updatedAt?: string
}
