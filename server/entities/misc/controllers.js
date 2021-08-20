import axios from 'axios'
import { get, groupBy, isEmpty } from 'lodash'
import { createEvent } from 'ics'
import { writeFileSync } from 'fs'
import path from 'path'
import { client } from '../../lib/graphql'
import get_env from '../../../get_env'
import { GET_SES_DOMAIN } from './graphql'
const fetch = require('node-fetch')
const AWS = require('aws-sdk')
const nodemailer = require('nodemailer')

AWS.config.update({ region: 'us-east-2' })

export const sendMail = async (req, res) => {
   try {
      const { emailInput, inviteInput = {} } = req.body.input
      const inputDomain = emailInput.from.split('@')[1]
      let updatedAttachments = []

      console.log('InviteINput', inviteInput)

      // Get the DKIM details from dailycloak
      const dkimDetails = await client.request(GET_SES_DOMAIN, {
         domain: inputDomain
      })

      if (dkimDetails.aws_ses.length === 0) {
         return res.status(400).json({
            success: false,
            message: `Domain ${inputDomain} is not registered. Cannot send emails.`
         })
      } else {
         // create nodemailer transport
         const transport = nodemailer.createTransport({
            SES: new AWS.SES({ apiVersion: '2010-12-01' }),
            dkim: {
               domainName: dkimDetails.aws_ses[0].domain,
               keySelector: dkimDetails.aws_ses[0].keySelector,
               privateKey: dkimDetails.aws_ses[0].privateKey.toString('binary')
            }
         })

         //build the invite event
         if (Object.keys(inviteInput).length) {
            const event = {
               start: inviteInput.start,
               duration: inviteInput.duration,
               title: inviteInput.title,
               description: inviteInput.description,
               location: inviteInput.location,
               url: inviteInput.url,
               geo: inviteInput.geo,
               categories: inviteInput.categories,
               status: inviteInput.status,
               busyStatus: inviteInput.busyStatus,
               organizer: inviteInput.organizer,
               attendees: inviteInput.attendees
            }
            createEvent(event, async (error, value) => {
               if (error) {
                  console.log(error)
                  return
               }
               console.log('EVENT OUTPUT', value)
               await writeFileSync(
                  `${__dirname}/calendarInvite/${inviteInput.title.replace(
                     ' ',
                     '_'
                  )}.ics`,
                  value
               )
            })
            updatedAttachments.push({
               filename: `${inviteInput.title.replace(' ', '_')}.ics`,
               path: `${__dirname}/calendarInvite/${inviteInput.title.replace(
                  ' ',
                  '_'
               )}.ics`,
               contentType: 'text/calendar'
            })
         }

         emailInput.attachments.forEach(attachment => {
            updatedAttachments.push(attachment)
         })

         // build and send the message
         const message = {
            from: emailInput.from,
            to: emailInput.to,
            subject: emailInput.subject,
            html: emailInput.html,
            attachments: updatedAttachments
         }

         if (dkimDetails.aws_ses[0].isVerified === true) {
            await transportEmail(transport, message)
         } else {
            throw new Error(
               `Domain - ${inputDomain} - is not verified. Cannot send emails.`
            )
         }

         return res.status(200).json({
            success: true,
            message: 'Email sent successfully!'
         })
      }
   } catch (error) {
      console.log(error)
      return res.status(400).json({
         success: false,
         message: error.message
      })
   }
}

const transportEmail = async (transporter, message) => {
   return new Promise((resolve, reject) => {
      transporter.sendMail(message, (err, info) => {
         if (err) {
            reject(err)
         } else {
            resolve(info)
         }
      })
   })
}

export const placeAutoComplete = async (req, res) => {
   try {
      const { key, input, location, components, language, types } = req.query
      if (key && input) {
         const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${key}&language=${language}&components=${components}&location=${location}`
         const response = await axios.get(url)
         return res.json(response.data)
      } else {
         throw Error('No key or input provided!')
      }
   } catch (err) {
      return res.status(400).json({
         success: false,
         message: err.message
      })
   }
}

export const placeDetails = async (req, res) => {
   try {
      const { key, placeid, language } = req.query
      if (key && placeid) {
         const url = `https://maps.googleapis.com/maps/api/place/details/json?key=${key}&placeid=${placeid}&language=${language}`
         const response = await axios.get(url)
         return res.json(response.data)
      } else {
         throw Error('No key or place id provided!')
      }
   } catch (err) {
      return res.status(400).json({
         success: false,
         message: err.message
      })
   }
}

export const getDistance = async (req, res) => {
   try {
      const { key, lat1, lon1, lat2, lon2 } = req.body
      if (key && lat1 && lon1 && lat2 && lon2) {
         const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${lat1},${lon1}&destinations=${lat2},${lon2}&key=${key}`
         const response = await axios.get(url)
         return res.json(response.data)
      } else {
         throw Error('No key or coordinates provided!')
      }
   } catch (err) {
      return res.status(400).json({
         success: false,
         message: err.message
      })
   }
}

const STAFF_USERS = `
   query users($email: String_comparison_exp!) {
      users: settings_user(where: { email: $email }) {
         id
         email
         keycloakId
      }
   }
`

const UPDATE_STAFF_USER = `
   mutation updateUser(
      $where: settings_user_bool_exp!
      $_set: settings_user_set_input!
   ) {
      updateUser: update_settings_user(where: $where, _set: $_set) {
         affected_rows
      }
   }
`

export const authorizeRequest = async (req, res) => {
   try {
      const staffId = req.body.headers['Staff-Id']
      const staffEmail = req.body.headers['Staff-Email']

      const keycloakId = req.body.headers['Keycloak-Id']
      const cartId = req.body.headers['Cart-Id']
      const brandId = req.body.headers['Brand-Id']
      const brandCustomerId = req.body.headers['Brand-Customer-Id']
      const source = req.body.headers['Source']

      let staffUserExists = false
      if (staffId) {
         const { users = [] } = await client.request(STAFF_USERS, {
            email: { _eq: staffEmail }
         })
         if (users.length > 0) {
            staffUserExists = true
            const [user] = users
            if (user.keycloakId !== staffId) {
               await client.request(UPDATE_STAFF_USER, {
                  where: { email: { _eq: staffEmail } },
                  _set: { keycloakId: staffId }
               })
            }
         }
      }

      return res.status(200).json({
         'X-Hasura-Role': keycloakId ? 'consumer' : 'guest-consumer',
         'X-Hasura-Source': source,
         'X-Hasura-Brand-Id': brandId,
         ...(keycloakId && {
            'X-Hasura-Keycloak-Id': keycloakId
         }),
         ...(cartId && { 'X-Hasura-Cart-Id': cartId }),
         ...(brandCustomerId && {
            'X-Hasura-Brand-Customer-Id': brandCustomerId
         }),
         ...(staffId &&
            staffUserExists && {
               'X-Hasura-Role': 'admin',
               'X-Hasura-Staff-Id': staffId,
               'X-Hasura-Email-Id': staffEmail
            })
      })
   } catch (error) {
      return res.status(404).json({ success: false, error: error.message })
   }
}
const ENVS = `
   query envs {
      envs: settings_env {
         id
         title
         value
         belongsTo
      }
   }
`

/*
used to create env config files and populate with relevant envs
*/
export const populate_env = async (req, res) => {
   try {
      const { envs } = await client.request(ENVS)
      if (isEmpty(envs)) {
         throw Error('No envs found!')
      } else {
         const grouped = groupBy(envs, 'belongsTo')

         const server = {}

         get(grouped, 'server', {}).forEach(node => {
            server[node.title] = node.value
         })

         writeFileSync(
            path.join(__dirname, '../../../', 'config.js'),
            'module.exports = ' + JSON.stringify(server, null, 2)
         )

         const store = {}

         get(grouped, 'store', {}).forEach(node => {
            store[node.title] = node.value
         })

         const PATH_TO_SUBS = path.join(
            __dirname,
            '../../../',
            'store',
            'public',
            'env-config.js'
         )

         writeFileSync(
            PATH_TO_SUBS,
            'window._env_ = ' + JSON.stringify(store, null, 2)
         )

         const admin = {}

         get(grouped, 'admin', []).forEach(node => {
            admin[node.title] = node.value
         })

         if (process.env.NODE_ENV === 'development') {
            const PATH_TO_ADMIN = path.join(
               __dirname,
               '../../../',
               'admin',
               'public',
               'env-config.js'
            )
            writeFileSync(
               PATH_TO_ADMIN,
               'window._env_ = ' + JSON.stringify(admin, null, 2)
            )
         } else {
            const PATH_TO_ADMIN = path.join(
               __dirname,
               '../../../',
               'admin',
               'build',
               'env-config.js'
            )
            writeFileSync(
               PATH_TO_ADMIN,
               'window._env_ = ' + JSON.stringify(admin, null, 2)
            )
         }

         return res.status(200).json({
            success: true,
            data: { server, store, admin }
         })
      }
   } catch (error) {
      return res.status(404).json({ success: false, error: error.message })
   }
}
