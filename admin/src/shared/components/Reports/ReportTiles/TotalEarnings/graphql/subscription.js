import gql from 'graphql-tag'

export const EARNING_BY_PRODUCT = gql`
   subscription EARNING_BY_PRODUCT(
      $earningByProductArgs: insights_getEarningByProducts_args!
   ) {
      insights_analytics {
         getEarningsByProducts(args: $earningByProductArgs)
      }
   }
`
export const EARNING_BY_CUSTOMERS = gql`
   subscription TOP_CUSTOMERS(
      $earningByCustomerArg: insights_getTopCustomers_args!
   ) {
      insights_analytics {
         getTopCustomers(args: $earningByCustomerArg)
         id
      }
   }
`
export const TOTAL_EARNING = gql`
   subscription TOTAL_EARNING($where: order_order_bool_exp!) {
      ordersAggregate(where: $where) {
         aggregate {
            sum {
               amountPaid
            }
         }
      }
   }
`
