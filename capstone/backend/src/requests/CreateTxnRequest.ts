/**
 * Fields in a request to create a single TXN item.
 */
export interface CreateTxnRequest {
  name: string
  type: string
  amount: number
}
