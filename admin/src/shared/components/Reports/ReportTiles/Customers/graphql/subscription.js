import gql from 'graphql-tag'

export const CUSTOMERS_COUNT = gql`
   subscription CUSTOMERS_COUNT($where: crm_customer_bool_exp!) {
      customers_aggregate(where: $where) {
         aggregate {
            count
         }
      }
   }
`

export const CUSTOMERS_DATA_OVERTIME = gql`
   subscription CUSTOMERS_DATA_OVERTIME(
      $args: insights_getCustomerByGroupby_args!
   ) {
      insights_analytics {
         getCustomersByGroupBy(args: $args)
      }
   }
`
export const FIRST_TIME_VS_RETURNING_CUSTOMER_SALES = gql`
   subscription firstTime($args: insights_getTotalEarnings_args!) {
      insights_analytics {
         getTotalEarnings(args: $args)
      }
   }
`
