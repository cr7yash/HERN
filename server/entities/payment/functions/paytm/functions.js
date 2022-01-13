import axios from 'axios'
import PAYTMCHECKSUM from 'paytmchecksum'

import get_env from '../../../../../get_env'

// start transaction for native flow with paytm

const makeRequest = async ({
   baseUrl = '',
   apiPath = '',
   data = {},
   headers = {
      'Content-Type': 'application/json'
   }
}) => {
   const PAYTM_API_URL = await get_env('PAYTM_API_URL')
   const url = baseUrl ? `${baseUrl}${apiPath}` : `${PAYTM_API_URL}${apiPath}`
   const response = await axios({
      url,
      data,
      headers,
      method: 'POST'
   })
   return response.data
}
export const initiateTransaction = async arg => {
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
      paymentMode,
      customerInfo
   } = arg
   var paytmParams = {}
   const PAYTM_MERCHANT_ID = await get_env('PAYTM_MERCHANT_ID')
   const PAYTM_MERCHANT_KEY = await get_env('PAYTM_MERCHANT_KEY')
   const PAYTM_WEBSITE = await get_env('PAYTM_WEBSITE')
   const CURRENCY = await get_env('CURRENCY')
   const PAYTM_CALLBACK_URL = `https://${host}/server/api/payment/handle-payment-webhook`
   console.log('userInfo', customerInfo)
   paytmParams.body = {
      requestType: 'Payment',
      mid: PAYTM_MERCHANT_ID, // merchant id from paytm
      websiteName: PAYTM_WEBSITE,
      orderId: cartPaymentId.toString(), // unique order id generated by merchant
      callbackUrl: PAYTM_CALLBACK_URL,
      txnAmount: {
         value: amount.toFixed(2),
         currency: CURRENCY
      },
      userInfo: customerInfo,
      enablePaymentMode: paymentMode
   }

   const generatedChecksumHash = await PAYTMCHECKSUM.generateSignature(
      JSON.stringify(paytmParams.body),
      PAYTM_MERCHANT_KEY
   )

   paytmParams.head = {
      signature: generatedChecksumHash
   }

   const data = await makeRequest({
      apiPath: `/theia/api/v1/initiateTransaction?mid=${PAYTM_MERCHANT_ID}&orderId=${paytmParams.body.orderId}`,
      data: paytmParams
   })
   return data
}

// // updates txnAmount , goods , shippingInfo , extendInfo in order details in Native flow.
// export const updateTransaction = async (req, res) => {
//    const { orderId, txnToken } = req.body
//    var paytmParams = {}
//    const PAYTM_MERCHANT_ID = await get_env('PAYTM_MERCHANT_ID')
//    const PAYTM_MERCHANT_KEY = await get_env('PAYTM_MERCHANT_KEY')
//    const PAYTM_WEBSITE = await get_env('PAYTM_WEBSITE')

//    paytmParams.body = {
//       txnAmount: {
//          value: '10.00',
//          currency: 'INR'
//       },
//       userInfo: {
//          custId: `CUST_${new Date().getTime()}`
//       }
//    }

//    const generatedChecksumHash = await PAYTMCHECKSUM.generateSignature(
//       JSON.stringify(paytmParams.body),
//       PAYTM_MERCHANT_KEY
//    )

//    paytmParams.head = {
//       txnToken: txnToken,
//       signature: generatedChecksumHash
//    }
//    const data = await makeRequest({
//       apiPath: `/theia/api/v1/updateTransactionDetail?mid=${PAYTM_MERCHANT_ID}&orderId=${orderId}`,
//       data: paytmParams
//    })
//    res.status(200).json(data)
// }

// // fetch payment options available for the transaction from paytm
// export const fetchPaymentOptions = async (req, res) => {
//    const { orderId, txnToken } = req.body
//    var paytmParams = {}
//    const PAYTM_MERCHANT_ID = await get_env('PAYTM_MERCHANT_ID')
//    const PAYTM_MERCHANT_KEY = await get_env('PAYTM_MERCHANT_KEY')
//    const PAYTM_WEBSITE = await get_env('PAYTM_WEBSITE')

//    paytmParams.body = {
//       mid: PAYTM_MERCHANT_ID
//    }

//    paytmParams.head = {
//       tokenType: 'TXN_TOKEN',
//       txnToken: txnToken
//    }

//    const data = await makeRequest({
//       apiPath: `/theia/api/v2/fetchPaymentOptions?mid=${PAYTM_MERCHANT_ID}&orderId=${orderId}`,
//       data: paytmParams
//    })
//    res.status(200).json(data)
// }

// // access the cards saved (local or global vault cards) in your customer’s Paytm account
// export const getSavedCard = async (req, res) => {
//    const { paytmCustomerId, customer_SSO_Token } = req.body
//    const PAYTM_MERCHANT_ID = await get_env('PAYTM_MERCHANT_ID')
//    const PAYTM_MERCHANT_KEY = await get_env('PAYTM_MERCHANT_KEY')
//    const PAYTM_WEBSITE = await get_env('PAYTM_WEBSITE')

//    if (!paytmCustomerId || !customer_SSO_Token)
//       return res.status(400).json({
//          message: 'Please provide paytmCustomerId and customer_SSO_Token'
//       })

//    var paytmParams = {
//       MID: PAYTM_MERCHANT_ID,
//       REQUEST_TYPE: 'DEFAULT',
//       SSO_TOKEN: customer_SSO_Token, //Unique token linked with the user's Paytm account
//       CUSTID: paytmCustomerId //Unique Id issued to the customer by Paytm for which the merchant has requested the saved cards details.
//    }

//    const generatedChecksumHash = await PAYTMCHECKSUM.generateSignature(
//       JSON.stringify(paytmParams.body),
//       PAYTM_MERCHANT_KEY
//    )

//    paytmParams['CHECKSUM'] = generatedChecksumHash

//    const data = await makeRequest({
//       apiPath: `/savedcardservice/merchant/v1/get/card`,
//       data: paytmParams
//    })
//    res.status(200).json(data)
// }

// // fetch convenience charges corresponding to the Transaction amount for different payment instruments.
// export const fetchPcfDetails = async (req, res) => {
//    const { payMethods = [], txnToken, orderId } = req.body
//    var paytmParams = {}
//    const PAYTM_MERCHANT_ID = await get_env('PAYTM_MERCHANT_ID')
//    const PAYTM_MERCHANT_KEY = await get_env('PAYTM_MERCHANT_KEY')
//    const PAYTM_WEBSITE = await get_env('PAYTM_WEBSITE')

//    if (payMethods.length === 0 || !txnToken || !orderId)
//       return res.status(400).json({
//          status: false,
//          message: 'Please provide payMethods, txnToken and orderId'
//       })
//    paytmParams.body = {
//       payMethods // List of payment methods (object) for convenience charges. For example, [{"payMethod" : "CREDIT_CARD","instId" : "VISA"}]
//    }

//    paytmParams.head = {
//       txnToken: txnToken
//    }

//    const data = await makeRequest({
//       apiPath: `/theia/api/v1/fetchPcfDetails?mid=${PAYTM_MERCHANT_ID}&orderId=${orderId}`,
//       data: paytmParams
//    })

//    res.status(200).json(data)
// }

// // check if the BIN entered by the user is a valid card BIN from which Paytm can process a payment
// export const fetchBinDetail = async (req, res) => {
//    const { bin, txnToken, orderId } = req.body
//    var paytmParams = {}
//    const PAYTM_MERCHANT_ID = await get_env('PAYTM_MERCHANT_ID')
//    const PAYTM_MERCHANT_KEY = await get_env('PAYTM_MERCHANT_KEY')
//    const PAYTM_WEBSITE = await get_env('PAYTM_WEBSITE')

//    if (!bin || !txnToken || !orderId)
//       return res.status(400).json({
//          status: false,
//          message: 'Please provide bin, txnToken and orderId'
//       })
//    paytmParams.body = {
//       bin // Starting 6 digits of credit or debit card number like 411111
//    }

//    paytmParams.head = {
//       tokenType: 'TXN_TOKEN',
//       token: txnToken
//    }

//    const data = await makeRequest({
//       apiPath: `/fetchBinDetail?mid=${PAYTM_MERCHANT_ID}&orderId=${orderId}`,
//       data: paytmParams
//    })

//    res.status(200).json(data)
// }

// // send OTP to the customer’s mobile number for login into Paytm ecosystem. This OTP is valid for 2 minutes.
// export const sendOtp = async (req, res) => {
//    const { mobileNumber, txnToken, orderId } = req.body
//    var paytmParams = {}
//    const PAYTM_MERCHANT_ID = await get_env('PAYTM_MERCHANT_ID')
//    const PAYTM_MERCHANT_KEY = await get_env('PAYTM_MERCHANT_KEY')
//    const PAYTM_WEBSITE = await get_env('PAYTM_WEBSITE')

//    if (!mobileNumber || !txnToken || !orderId)
//       return res.status(400).json({
//          status: false,
//          message: 'Please provide mobileNumber, txnToken and orderId'
//       })
//    paytmParams.body = {
//       mobileNumber // 10 digit user mobile No
//    }

//    paytmParams.head = {
//       txnToken
//    }

//    const data = await makeRequest({
//       apiPath: `/login/sendOtp?mid=${PAYTM_MERCHANT_ID}&orderId=${orderId}`,
//       data: paytmParams
//    })
//    res.status(200).json(data)
// }

// // validate the OTP entered by user to complete authentication for login into Paytm ecosystem
// export const validateOtp = async (req, res) => {
//    const { otp, txnToken, orderId } = req.body
//    var paytmParams = {}
//    const PAYTM_MERCHANT_ID = await get_env('PAYTM_MERCHANT_ID')
//    const PAYTM_MERCHANT_KEY = await get_env('PAYTM_MERCHANT_KEY')
//    const PAYTM_WEBSITE = await get_env('PAYTM_WEBSITE')

//    if (!otp || !txnToken || !orderId)
//       return res.status(400).json({
//          status: false,
//          message: 'Please provide otp, txnToken and orderId'
//       })
//    paytmParams.body = {
//       otp // OTP sent to user
//    }

//    paytmParams.head = {
//       txnToken
//    }

//    const data = await makeRequest({
//       apiPath: `/login/validateOtp?mid=${PAYTM_MERCHANT_ID}&orderId=${orderId}`,
//       data: paytmParams
//    })

//    res.status(200).json(data)
// }

// // get the balance of Paytm Wallet, Paytm Postpaid and Paytm Payments Bank.
// export const fetchBalanceInfo = async (req, res) => {
//    const { txnToken, orderId } = req.body
//    var paytmParams = {}
//    const PAYTM_MERCHANT_ID = await get_env('PAYTM_MERCHANT_ID')
//    const PAYTM_MERCHANT_KEY = await get_env('PAYTM_MERCHANT_KEY')
//    const PAYTM_WEBSITE = await get_env('PAYTM_WEBSITE')

//    if (!txnToken || !orderId)
//       return res.status(400).json({
//          status: false,
//          message: 'Please provide txnToken and orderId'
//       })
//    paytmParams.body = {
//       paymentMode: 'BALANCE' // Paytm payment mode for which you need to fetch balance.
//    }

//    paytmParams.head = {
//       txnToken
//    }

//    const data = await makeRequest({
//       apiPath: `/userAsset/fetchBalanceInfo?mid=${PAYTM_MERCHANT_ID}&orderId=${orderId}`,
//       data: paytmParams
//    })

//    res.status(200).json(data)
// }

// //  list of Net Banking instruments with their success rate and icons , configured for given MID along with user addAndPay payment instruments
// export const fetchNBPaymentChannels = async (req, res) => {
//    const { txnToken, orderId } = req.body
//    var paytmParams = {}
//    const PAYTM_MERCHANT_ID = await get_env('PAYTM_MERCHANT_ID')
//    const PAYTM_MERCHANT_KEY = await get_env('PAYTM_MERCHANT_KEY')
//    const PAYTM_WEBSITE = await get_env('PAYTM_WEBSITE')

//    if (!txnToken || !orderId)
//       return res.status(400).json({
//          status: false,
//          message: 'Please provide txnToken and orderId'
//       })
//    paytmParams.body = {
//       type: 'MERCHANT' // Channel list as per the transaction flow.
//    }

//    paytmParams.head = {
//       tokenType: 'TXN_TOKEN',
//       txnToken
//    }

//    const data = await makeRequest({
//       apiPath: `/theia/api/v1/fetchNBPaymentChannels?mid=${PAYTM_MERCHANT_ID}&orderId=${orderId}`,
//       data: paytmParams
//    })

//    res.status(200).json(data)
// }

// //  fetches the list of emi details like tenure, interest rates, min and max amount for requested channel configured for given MID
// export const fetchEMIDetail = async (req, res) => {
//    const { channelCode, txnToken, orderId } = req.body
//    var paytmParams = {}
//    const PAYTM_MERCHANT_ID = await get_env('PAYTM_MERCHANT_ID')
//    const PAYTM_MERCHANT_KEY = await get_env('PAYTM_MERCHANT_KEY')
//    const PAYTM_WEBSITE = await get_env('PAYTM_WEBSITE')

//    if (!channelCode || !txnToken || !orderId)
//       return res.status(400).json({
//          status: false,
//          message: 'Please provide channelCode, txnToken and orderId'
//       })
//    paytmParams.body = {
//       channelCode // Channel list as per the transaction flow.
//    }

//    paytmParams.head = {
//       txnToken
//    }

//    const data = await makeRequest({
//       apiPath: `/fetchEMIDetail?mid=${PAYTM_MERCHANT_ID}&orderId=${orderId}`,
//       data: paytmParams
//    })

//    res.status(200).json(data)
// }

// //   validate user VPA address in case UPI collect flow.
// export const validateVpa = async (req, res) => {
//    const { vpa, txnToken, orderId } = req.body
//    var paytmParams = {}
//    const PAYTM_MERCHANT_ID = await get_env('PAYTM_MERCHANT_ID')
//    const PAYTM_MERCHANT_KEY = await get_env('PAYTM_MERCHANT_KEY')
//    const PAYTM_WEBSITE = await get_env('PAYTM_WEBSITE')

//    if (!vpa || !txnToken || !orderId)
//       return res.status(400).json({
//          status: false,
//          message: 'Please provide vpa, txnToken and orderId'
//       })
//    paytmParams.body = {
//       vpa // User VPA address
//    }

//    paytmParams.head = {
//       tokenType: 'TXN_TOKEN',
//       txnToken
//    }

//    const data = await makeRequest({
//       apiPath: `/theia/api/v1/vpa/validate?mid=${PAYTM_MERCHANT_ID}&orderId=${orderId}`,
//       data: paytmParams
//    })

//    res.status(200).json(data)
// }

// //   process the transaction with respect to paymentMode provided by merchant in the request
// export const processTransaction = async (req, res) => {
//    const { paymentMode, txnToken, orderId, ...rest } = req.body
//    var paytmParams = {}
//    const PAYTM_MERCHANT_ID = await get_env('PAYTM_MERCHANT_ID')
//    const PAYTM_MERCHANT_KEY = await get_env('PAYTM_MERCHANT_KEY')
//    const PAYTM_WEBSITE = await get_env('PAYTM_WEBSITE')

//    if (!paymentMode || !txnToken || !orderId)
//       return res.status(400).json({
//          status: false,
//          message: 'Please provide paymentMode, txnToken and orderId'
//       })
//    paytmParams.body = {
//       requestType: 'NATIVE',
//       mid: PAYTM_MERCHANT_ID,
//       orderId,
//       paymentMode, // payment mode used by customer for transaction.
//       ...rest
//    }

//    paytmParams.head = {
//       txnToken
//    }

//    const data = await makeRequest({
//       apiPath: `/theia/api/v1/processTransaction?mid=${PAYTM_MERCHANT_ID}&orderId=${orderId}`,
//       data: paytmParams
//    })

//    //   const actionUrl = data.body.bankForm.redirectForm.actionUrl;
//    //   const headers = data.body.bankForm.redirectForm.header;
//    //   const requiredData = data.body.bankForm.redirectForm.content;
//    //   const { data: htmlData } = await axios({
//    //     url: actionUrl,
//    //     data: requiredData,
//    //     headers,
//    //     method: "POST",
//    //   });
//    //   console.log(htmlData);
//    res.status(200).json(data)
// }

//  gets the transaction status corresponding to requested OrderId for specific merchant.
export const transactionStatus = async arg => {
   const { orderId } = arg
   var paytmParams = {}
   const PAYTM_MERCHANT_ID = await get_env('PAYTM_MERCHANT_ID')
   const PAYTM_MERCHANT_KEY = await get_env('PAYTM_MERCHANT_KEY')
   const PAYTM_WEBSITE = await get_env('PAYTM_WEBSITE')
   paytmParams.body = {
      mid: PAYTM_MERCHANT_ID,
      orderId
   }

   const generatedChecksumHash = await PAYTMCHECKSUM.generateSignature(
      JSON.stringify(paytmParams.body),
      PAYTM_MERCHANT_KEY
   )

   paytmParams.head = {
      signature: generatedChecksumHash
   }

   const data = await makeRequest({
      apiPath: `/v3/order/status`,
      data: paytmParams
   })

   return data
}

// //  used by the merchant to fetch the order level details for a given MID and respective date range.
// export const orderList = async (req, res) => {
//    const { orderId } = req.body
//    var paytmParams = {}
//    const PAYTM_MERCHANT_ID = await get_env('PAYTM_MERCHANT_ID')
//    const PAYTM_MERCHANT_KEY = await get_env('PAYTM_MERCHANT_KEY')
//    const PAYTM_WEBSITE = await get_env('PAYTM_WEBSITE')

//    if (!orderId)
//       return res.status(400).json({
//          status: false,
//          message: 'Please provide orderId'
//       })
//    paytmParams.body = {
//       mid: PAYTM_MERCHANT_ID,
//       orderId,
//       fromDate, // Pass the from date from which transactions need to fetch Note: Max Range supported is 30 days. The value of orderCreatedStartTime should be in 18 months.   Example format: YYYY-MM-DDTHH:MM:SS
//       toDate, // Pass the end date
//       orderSearchType, // Transaction type of payment Note: Need to put "|" pipe for separation in between.
//       orderSearchStatus, // Type of search status for Order List. Note: Need to put "|" pipe for separation in between.Possible Values: SUCCESS, FAILURE, PENDING
//       pageNumber, // Offset of records to show (Default: 1)
//       pageSize // Number of records to fetch for this Page (Default: 20)
//    }

//    const generatedChecksumHash = await PAYTMCHECKSUM.generateSignature(
//       JSON.stringify(paytmParams.body),
//       PAYTM_MERCHANT_KEY
//    )

//    paytmParams.head = {
//       signature: generatedChecksumHash,
//       tokenType: 'CHECKSUM'
//    }

//    const data = await makeRequest({
//       apiPath: `/merchant-passbook/search/list/order/v2`,
//       data: paytmParams
//    })

//    res.status(200).json(data)
// }

// //  When JSON request is made to processTransaction API, and merchant has preference nativeOtpSupported,
// // we return APIs for direct bank page which can be used by merchant on its own bank page.
// export const directBankRequest = async (req, res) => {
//    const { txnToken, requestType, otp } = req.body
//    var paytmParams = {}
//    const PAYTM_MERCHANT_ID = await get_env('PAYTM_MERCHANT_ID')
//    const PAYTM_MERCHANT_KEY = await get_env('PAYTM_MERCHANT_KEY')
//    const PAYTM_WEBSITE = await get_env('PAYTM_WEBSITE')

//    if (!txnToken || !requestType)
//       return res.status(400).json({
//          status: false,
//          message: 'Please provide txnToken and requestType'
//       })
//    paytmParams.body = {
//       txnToken,
//       requestType, // Bank form request type
//       otp // bank otp (only when request type is submit)
//    }

//    const data = await makeRequest({
//       apiPath: `/theia/api/v1/directBankRequest?mid=${PAYTM_MERCHANT_ID}&orderId=${orderId}`,
//       data: paytmParams
//    })

//    res.status(200).json(data)
// }

// //  used to obtain the security token named as Access token which can be further used in subsequent API calls to retrieve the read only data.
// export const getAccessToken = async (req, res) => {
//    const { referenceId, cardPreAuthType, preAuthBlockSeconds } = req.body
//    var paytmParams = {}
//    const PAYTM_MERCHANT_ID = await get_env('PAYTM_MERCHANT_ID')
//    const PAYTM_MERCHANT_KEY = await get_env('PAYTM_MERCHANT_KEY')
//    const PAYTM_WEBSITE = await get_env('PAYTM_WEBSITE')

//    if (!referenceId || !cardPreAuthType || !preAuthBlockSeconds)
//       return res.status(400).json({
//          status: false,
//          message:
//             'Please provide referenceId, cardPreAuthType and preAuthBlockSeconds'
//       })
//    paytmParams.body = {
//       mid: PAYTM_MERCHANT_ID,
//       referenceId,
//       cardPreAuthType,
//       preAuthBlockSeconds
//    }

//    const generatedChecksumHash = await PAYTMCHECKSUM.generateSignature(
//       JSON.stringify(paytmParams.body),
//       PAYTM_MERCHANT_KEY
//    )

//    paytmParams.head = {
//       tokenType: 'CHECKSUM',
//       token: generatedChecksumHash
//    }

//    const data = await makeRequest({
//       apiPath: `/theia/api/v1/token/create?mid=${mid}&referenceId=${referenceId}`,
//       data: paytmParams
//    })

//    res.status(200).json(data)
// }

// // used to get new JWT tokens by passing either authorization code or refresh token in the request.
// export const getOauthToken = async (req, res) => {
//    const { grantType, deviceId, code, refreshToken } = req.body
//    var paytmParams = {}
//    const PAYTM_MERCHANT_ID = await get_env('PAYTM_MERCHANT_ID')
//    const PAYTM_MERCHANT_KEY = await get_env('PAYTM_MERCHANT_KEY')
//    const PAYTM_WEBSITE = await get_env('PAYTM_WEBSITE')

//    if (!grantType || !deviceId)
//       return res.status(400).json({
//          status: false,
//          message: 'Please provide grantType and deviceId'
//       })
//    paytmParams.body = {
//       grantType,
//       deviceId,
//       code,
//       refreshToken
//    }

//    const data = await makeRequest({
//       baseUrl: `https://accounts-uat.paytm.com/oauth2/v3/token/sv1`,
//       data: paytmParams,
//       headers: {
//          'Content-Type': 'application/json',
//          Authorization: 'Bearer ' + req.headers.authorization // This is a base64 encoded string of “clientId:clientSecret”
//       }
//    })
//    res.status(200).json(data)
// }