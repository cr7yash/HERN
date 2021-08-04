import axios from 'axios'
import get_env from '../../../get_env'

export const createCronEvent = async (req, res) => {
   try {
      const { cronEventInput = {} } = req.body.input
      const DATA_HUB = await get_env('DATA_HUB')

      const url = new URL(DATA_HUB).origin + '/datahub/v1/query'

      const HASURA_GRAPHQL_ADMIN_SECRET = await get_env(
         'HASURA_GRAPHQL_ADMIN_SECRET'
      )
      console.log(url, HASURA_GRAPHQL_ADMIN_SECRET)
      const data = await axios({
         url,
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            'x-hasura-role': 'admin',
            'x-hasura-admin-secret': HASURA_GRAPHQL_ADMIN_SECRET
         },
         data: {
            type: 'create_cron_trigger',
            args: cronEventInput
         }
      })
      if (data.status === 200) {
         return res.status(200).json({
            success: true,
            message: 'Successfully created cron event!'
         })
      }
   } catch (error) {
      return res.status(400).json({ success: false, message: error.message })
   }
}
