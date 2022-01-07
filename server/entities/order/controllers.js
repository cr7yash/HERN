import axios from 'axios'

import { client } from '../../lib/graphql'
import { SEND_MAIL, UPDATE_CART } from './graphql/mutations'
import {
   CUSTOMER,
   EMAIL_SETTINGS,
   ORDER_BY_CART,
   CART,
   LOCATION_KIOSK
} from './graphql/queries'

import { logger2 } from '../../utils'
import { fetch_html } from './functions'
import get_env from '../../../get_env'

export const handleStatusChange = async (req, res) => {
   const { id, source, status, brandId, customerKeycloakId } =
      req.body.event.data.new
   try {
      if (!brandId) throw { message: 'Brand id is required!', code: 409 }
      if (!customerKeycloakId)
         throw { message: 'Customer id is required!', code: 409 }

      const { brand } = await client.request(EMAIL_SETTINGS, {
         id: brandId
      })

      if (!brand) throw { message: 'No such brand id exists!', code: 404 }

      const template = {
         type: '',
         name: '',
         email: '',
         template: {},
         subject: ''
      }

      const { orders = [] } = await client.request(ORDER_BY_CART, {
         cartId: { _eq: id }
      })

      if (orders.length === 0)
         return res.status(200).json({
            success: true,
            message: 'No order is attached to provided cart!'
         })

      const [order] = orders

      if (order && order.isRejected) {
         if (brand.cancelled.length === 0)
            return res.status(200).json({
               success: true,
               message: 'Setting for order cancelled template doesnt exists!'
            })

         const [data] = brand.cancelled
         template.type = 'Cancelled'
         template.name = data.name
         template.email = data.email
         template.template = data.template
         template.subject = `Your order ORD:#${id} from ${data.name} has been cancelled`
      } else if (status === 'ORDER_PENDING') {
         if (brand.new.length === 0 || brand.subs_new.length === 0)
            return res.status(200).json({
               success: true,
               message: 'Setting for new order template doesnt exists!'
            })
         if (source === 'subscription') {
            const [data] = brand.subs_new
            template.type = 'New'
            template.name = data.name
            template.email = data.email
            template.template = data.template
            template.subject = `Your order ORD:#${id} from ${data.name} has been placed.`
         } else {
            const [data] = brand.new
            template.type = 'New'
            template.name = data.name
            template.email = data.email
            template.template = data.template
            template.subject = `Your order ORD:#${id} from ${data.name} has been placed.`
         }
      } else if (status === 'ORDER_DELIVERED') {
         if (brand.delivered.length === 0)
            return res.status(200).json({
               success: true,
               message: 'Setting for order delivered template doesnt exists!'
            })
         const [data] = brand.delivered
         template.type = 'Delivered'
         template.name = data.name
         template.email = data.email
         template.template = data.template
         template.subject = `Your order ORD:#${id} from ${data.name} has been delivered`
      }

      if (!template.type)
         return res.status(200).json({
            success: true,
            message: 'This order status has not been mapped!'
         })

      let html = await fetch_html(template.template, {
         new: { id: order.id }
      })

      const customer = {
         email: ''
      }

      const { customer: consumer } = await client.request(CUSTOMER, {
         keycloakId: customerKeycloakId
      })

      if (!consumer) throw { message: 'No such customer exists', code: 404 }

      if ('email' in consumer && consumer.email) {
         customer.email = consumer.email
      }

      if (!customer.email)
         return res.status(200).json({
            success: true,
            message: 'Customer does not have email linked!'
         })

      await client.request(SEND_MAIL, {
         emailInput: {
            html,
            attachments: [],
            to: customer.email,
            subject: template.subject,
            from: `"${template.name}" ${template.email}`
         }
      })
      return res.status(200).json({ success: true, template, customer, html })
   } catch (error) {
      console.log(error)
      // logger2({
      //    meta: { order: { id } },
      //    endpoint: '/api/order/status',
      //    trace: error
      // })
      return res.status('code' in error && error.code ? error.code : 500).json({
         success: false,
         error
      })
   }
}

export const posistOrderPush = async (req, res) => {
   try {
      const { id } = req.body.event.data.new
      const POSIST_API_KEY = await get_env('POSIST_API_KEY')
      const { cart = {} } = await client.request(CART, {
         id
      })
      const { locationKiosk = {} } = await client.request(LOCATION_KIOSK, {
         id: cart.locationKioskId
      })

      const posistOrder = cart.posistOrderDetails
      const posist_customer_key =
         locationKiosk.location.brand_locations[0].posist_customer_key
      console.log(posistOrder)
      const response = await axios.post({
         url: `http://posistapi.com/api/v1/online_order/push?customer_key=${posist_customer_key}`,
         headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${POSIST_API_KEY}`
         },
         data: posistOrder
      })
      if (response.status === 200) {
         const posistOrderResponse = response.data
         await client.request(UPDATE_CART, {
            id,
            _set: {
               posistOrderResponse,
               posistOrderStatus: 'CREATED'
            }
         })
         return res.status(200).json({
            success: true,
            data: posistOrderResponse,
            message: 'Order pushed to posist successfully'
         })
      } else {
         return {
            success: false,
            message: 'Error in pushing order to posist'
         }
      }
   } catch (error) {
      console.error(error)
      return res.status(500).json({
         success: false,
         error
      })
   }
}
