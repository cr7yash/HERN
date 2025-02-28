import _isEmtpy from 'lodash/isEmpty'

import { initiateTransaction } from './functions'
import { client } from '../../../../lib/graphql'
import { logger, paymentLogger } from '../../../../utils'
import get_env from '../../../../../get_env'
import { AVAILABLE_PAYMENT_OPTION, CART } from '../../graphql'

const initiatePayment = async arg => {
   try {
      const {
         id: cartPaymentId,
         statementDescriptor,
         stripeInvoiceId,
         paymentMethodId: paymentMethod,
         paymentCustomerId,
         requires3dSecure,
         amount,
         oldAmount,
         host,
         cartId
      } = arg
      let paymentMode = []
      let customerInfo = {
         custId: `CUST_${new Date().getTime()}`, // unique customer id generated by merchant
         email: '',
         firstName: '',
         lastName: ''
      }
      const PAYTM_MERCHANT_ID = await get_env('PAYTM_MERCHANT_ID')
      const PAYTM_API_URL = await get_env('PAYTM_API_URL')
      const orderId = `ORD-${cartId}-${cartPaymentId}`
      const { cart = {} } = await client.request(CART, {
         id: cartId
      })
      const { availablePaymentOption = {} } = await client.request(
         AVAILABLE_PAYMENT_OPTION,
         {
            id: arg.usedAvailablePaymentOptionId
         }
      )
      if (!_isEmtpy(availablePaymentOption)) {
         paymentMode = getPaymentMode(availablePaymentOption.label)
      }
      if (!_isEmtpy(cart)) {
         customerInfo = {
            custId:
               cart.customerId ||
               cart.customerKeycloakId ||
               `CUST_${new Date().getTime()}`,
            email: cart.customerInfo.customerEmail,
            firstName: cart.customerInfo.customerFirstName,
            lastName: cart.customerInfo.customerLastName
         }
      }

      const response = await initiateTransaction({
         ...arg,
         paymentMode,
         customerInfo
      })
      const { txnToken } = response.body
      let actionUrl = null
      let actionRequired = false
      if (_isEmtpy(response) && _isEmtpy(response)) {
         return {
            success: false,
            message: 'Failed to create order'
         }
      }
      if (
         !_isEmtpy(response.body.resultInfo) &&
         response.body.resultInfo.resultStatus === 'S'
      ) {
         actionUrl = `${PAYTM_API_URL}/theia/api/v1/showPaymentPage?mid=${PAYTM_MERCHANT_ID}&orderId=${orderId}&txnToken=${txnToken}`
         actionRequired = true
      }
      await paymentLogger({
         cartPaymentId,
         transactionRemark: response,
         actionUrl,
         actionRequired,
         requestId: orderId,
         paymentStatus: 'PROCESSING',
         transactionId: txnToken
      })
      return {
         success: true,
         data: response,
         message: 'Order created via paytm'
      }
   } catch (error) {
      console.error('error from paytm initiatePayment', error)
      logger('/api/payment-intent', error)
      return {
         success: false,
         error: error.message
      }
   }
}

export default initiatePayment

const getPaymentMode = label => {
   let paymentMode = []
   if (['Debit/Credit Card', 'Debit/Credit Cards'].includes(label)) {
      paymentMode = [
         { mode: 'DEBIT_CARD', channels: ['VISA', 'MASTER', 'AMEX'] },
         { mode: 'CREDIT_CARD', channels: ['VISA', 'MASTER', 'AMEX'] }
      ]
   } else if (label === 'Netbanking') {
      paymentMode = [{ mode: 'NET_BANKING' }]
   } else if (label === 'Paytm') {
      paymentMode = []
   } else if (label === 'UPI') {
      paymentMode = [{ mode: 'UPI', channels: ['UPI'] }]
   }
   return paymentMode
}
