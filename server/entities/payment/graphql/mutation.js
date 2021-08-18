export const UPDATE_CART_PAYMENT = `
mutation UPDATE_CART_PAYMENT($id: Int!, $_inc: order_cartPayment_inc_input, $_set: order_cartPayment_set_input) {
   updateCartPayment(pk_columns: {id: $id}, _inc: $_inc, _set: $_set) {
     cartId
     id
     paymentStatus
     paymentRetryAttempt
   }
 }
`
export const DATAHUB_INSERT_STRIPE_PAYMENT_HISTORY = `
mutation insertStripePaymentHistory(
   $objects: [order_stripePaymentHistory_insert_input!]!
) {
   insertStripePaymentHistory: insert_order_stripePaymentHistory(
      objects: $objects
   ) {
      affected_rows
   }
}
`
