import PaytmChecksum from 'paytmchecksum'

import { transactionStatus } from './functions'
import { CART_PAYMENT } from '../../graphql'
import { client } from '../../../../lib/graphql'
import get_env from '../../../../../get_env'

const razorpayWebhookEvents = async arg => {
   try {
      const host = arg.hostname || arg.headers.host
      const { CHECKSUMHASH: incomingChecksumHas, ORDERID } = arg.body
      const orderId = parseInt(ORDERID.split('-').pop())
      const PAYTM_MERCHANT_KEY = await get_env('PAYTM_MERCHANT_KEY')
      var isVerifySignature = PaytmChecksum.verifySignature(
         arg.body,
         PAYTM_MERCHANT_KEY,
         incomingChecksumHas
      )
      if (!isVerifySignature) {
         console.log('Checksum Mismatched')
         return {
            success: false,
            signatureIsValid: false,
            code: 500,
            error: 'Signature is not valid'
         }
      }
      console.log('Checksum Matched')
      const response = await transactionStatus({ orderId: ORDERID })
      const { body } = response
      const { cartPayment } = await client.request(CART_PAYMENT, {
         id: orderId
      })
      const requiredData = {
         cartPaymentId: orderId,
         transactionRemark: body,
         requestId: ORDERID,
         paymentStatus: body.resultInfo.resultStatus,
         transactionId: body.txnId,
         cartId: cartPayment.cartId,
         domain: cartPayment.cart.brand.domain
      }
      console.log('requiredData', requiredData)

      return {
         success: true,
         signatureIsValid: true,
         code: 200,
         data: requiredData,
         company: 'paytm',
         received: true
      }
   } catch (error) {
      return { success: false, code: 500, error }
   }
}

export default razorpayWebhookEvents
