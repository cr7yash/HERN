export const ORGANIZATIONS = `
query organizations {
   organizations {
      id
      organizationUrl
      stripeAccountId
      organizationName
      stripeAccountType
   }
}
`
export const CART_PAYMENT = `
query CART_PAYMENT($id: Int!) {
   cartPayment(id: $id) {
   id
   cartId
   paymentStatus
   stripeInvoiceId
   paymentRetryAttempt
 }
}
`
export const CART_PAYMENTS = `
query CART_PAYMENTS($where: order_cartPayment_bool_exp!) {
  cartPayments(where: $where) {
    id
    cartId
    amount
    stripeInvoiceId
    paymentMethodId
    paymentStatus
  }
}
`
export const CART = `
query cart($id: Int!) {
  cart(id: $id) {
    id
    isTest
    amount
    balancePayment
    paymentMethodId
    paymentCustomerId
    statementDescriptor
  }
}

`
