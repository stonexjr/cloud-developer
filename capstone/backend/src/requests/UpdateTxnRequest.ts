/**
 * Fields in a request to update a single TXN item.
 */
export interface UpdateTxnRequest {
  name: string
  type: string
  amount: number
}
