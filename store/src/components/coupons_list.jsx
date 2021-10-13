import React from 'react'
import { useSubscription } from '@apollo/react-hooks'
import { useUser } from '../context'
import { COUPONS } from '../graphql'
import { useConfig } from '../lib'
import { useMenu } from '../sections/select-menu'
import { Loader } from './loader'
import { CloseIcon } from '../assets/icons'
import classNames from 'classnames'
import { isClient } from '../utils'
const ReactPixel = isClient ? require('react-facebook-pixel').default : null

export const CouponsList = ({ createOrderCartRewards, closeTunnel }) => {
   const { state } = useMenu()
   const { brand } = useConfig()
   const { user } = useUser()
   const { id } = state?.occurenceCustomer?.cart

   const [availableCoupons, setAvailableCoupons] = React.useState([])
   const [applying, setApplying] = React.useState(false)

   const { loading, error } = useSubscription(COUPONS, {
      variables: {
         params: {
            cartId: id,
            keycloakId: user?.keycloakId,
         },
         brandId: brand.id,
      },
      onSubscriptionData: data => {
         const coupons = data.subscriptionData.data.coupons
         setAvailableCoupons([
            ...coupons.filter(coupon => coupon.visibilityCondition.isValid),
         ])

         // fb pixel custom event for coupon list
         ReactPixel.trackCustom('showCouponList', {
            coupons: [
               ...coupons.filter(coupon => coupon.visibilityCondition.isValid),
            ],
         })
      },
   })

   const handleApplyCoupon = coupon => {
      try {
         if (applying) return
         setApplying(true)
         const objects = []
         if (coupon.isRewardMulti) {
            for (const reward of coupon.rewards) {
               if (reward.condition.isValid) {
                  objects.push({ rewardId: reward.id, cartId: id })
               }
            }
         } else {
            const firstValidCoupon = coupon.rewards.find(
               reward => reward.condition.isValid
            )
            objects.push({
               rewardId: firstValidCoupon.id,
               cartId: id,
            })
         }
         // FB pixel custom event for coupon applied
         ReactPixel.trackCustom('couponApplied', coupon)

         createOrderCartRewards({
            variables: {
               objects,
            },
         })
      } catch (err) {
         console.log(err)
      } finally {
         setApplying(false)
      }
   }

   const isButtonDisabled = coupon => {
      return !coupon.rewards.some(reward => reward.condition.isValid)
   }

   if (loading) return <Loader />
   return (
      <div className="hern-coupons-list">
         <div className="hern-coupons-list__header">
            <div className="hern-coupons-list__heading">Available Coupons</div>
            <button className="hern-coupons-list__close-btn">
               <CloseIcon
                  size={16}
                  className="hern-coupons-list__close-btn__icon"
                  onClick={closeTunnel}
               />
            </button>
         </div>
         {!availableCoupons.length && <p>No coupons available!</p>}
         {availableCoupons.map(coupon => (
            <div className="hern-coupons-list__coupon" key={coupon.id}>
               <div className="hern-coupons-list__coupon__top">
                  <div className="hern-coupons-list__coupon__code">
                     {coupon.code}{' '}
                  </div>
                  <button
                     className={classNames(
                        'hern-coupons-list__coupon__apply-btn',
                        {
                           'hern-coupons-list__coupon__apply-btn':
                              isButtonDisabled(coupon),
                        }
                     )}
                     onClick={() => handleApplyCoupon(coupon)}
                  >
                     Apply
                  </button>
               </div>
               <div>
                  <p className="hern-coupons-list__coupon__title">
                     {coupon.metaDetails.title}
                  </p>
                  <p className="hern-coupons-list__coupon__description">
                     {coupon.metaDetails.description}
                  </p>
               </div>
            </div>
         ))}
      </div>
   )
}