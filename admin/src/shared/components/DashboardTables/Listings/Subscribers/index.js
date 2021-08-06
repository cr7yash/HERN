import { useSubscription } from '@apollo/react-hooks'
import React, { useState } from 'react'
import '../../tableStyle.css'
import { toast } from 'react-toastify'
import { logger } from '../../../../utils'
import { ErrorState } from '../../../ErrorState'
import { InlineLoader } from '../../../InlineLoader'
import { DashboardTableContext } from '../../context'
import { SUBSCRIBERS_LIST } from '../../graphql/subscription'
import TableOptions from '../../tableOptions'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import { TableHeader } from '../../shared'
import { Filler } from '@dailykit/ui'

const SubscribersTable = () => {
   const { dashboardTableState } = React.useContext(DashboardTableContext)
   const [subscribersList, setSubscriberList] = useState([])
   const [status, setStatus] = useState({ loading: true })

   //subscription
   const { loading: subsLoading, error: subsError } = useSubscription(
      SUBSCRIBERS_LIST,
      {
         variables: {
            where:
               dashboardTableState.from && dashboardTableState.to
                  ? {
                       customer: {
                          isSubscriber: { _eq: true },
                          created_at: {
                             _gte: dashboardTableState.from,
                             _neq: dashboardTableState.to,
                          },
                       },
                    }
                  : {
                       customer: {
                          isSubscriber: { _eq: true },
                       },
                    },
         },
         onSubscriptionData: ({ subscriptionData }) => {
            if (subscriptionData.data.brandCustomers.length > 0) {
               let flatBrandCustomerData =
                  subscriptionData.data.brandCustomers.map(customer => {
                     const flatCustomer = {}
                     flatCustomer.fullName =
                        customer.customer.platform_customer_.fullName || 'N/A'
                     flatCustomer.created_at =
                        customer.customer.platform_customer_.created_at || 'N/A'
                     flatCustomer.email =
                        customer.customer.platform_customer_.email || 'N/A'
                     flatCustomer.phoneNumber =
                        customer.customer.platform_customer_.phoneNumber ||
                        'N/A'
                     return flatBrandCustomerData
                  })
               setSubscriberList(flatBrandCustomerData)
               setStatus({ ...status, loading: false })
               return
            }
            setSubscriberList(subscriptionData.data.brandCustomers)
            setStatus({ ...status, loading: false })
         },
      }
   )

   //columns for table
   const columns = [
      { title: 'Customer Name', field: 'fullName' },
      { title: 'Subscription Date', field: 'created_at' },
      { title: 'Email', field: 'email' },
      {
         title: 'Phone Number',
         field: 'phoneNumber',
      },
   ]

   if (status.loading || subsLoading) {
      return <InlineLoader />
   }
   if (subsError) {
      logger(subsError)
      toast.error('Could not get the Insight data')
      return (
         <ErrorState height="320px" message="Could not get the Insight data" />
      )
   }
   if (subscribersList.length == 0) {
      return <Filler message="No Subscriber Available" />
   }
   return (
      <>
         <TableHeader heading="Subscribers so far"></TableHeader>
         <ReactTabulator
            data={subscribersList}
            columns={columns}
            options={TableOptions}
            className="dashboard-table"
         />
      </>
   )
}
export default SubscribersTable
