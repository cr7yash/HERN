import React from 'react'
import { CartDetails } from './CartDetails'
import {
   Fulfillment,
   LoyaltyPoints,
   Loader,
   Button,
   PaymentOptionsRenderer,
   Coupon,
   WalletAmount,
} from '../../components'
import { CartContext, onDemandMenuContext, useUser } from '../../context'
import { EmptyCart, PaymentIcon } from '../../assets/icons'
import Link from 'next/link'
import { UserInfo, UserType } from '../../components'
import { useConfig } from '../../lib'
import { isEmpty } from 'lodash'

export const OnDemandCart = () => {
   const {
      cartState,
      combinedCartItems,
      isCartLoading,
      cartItemsLoading,
      isFinalCartLoading,
      storedCartId,
   } = React.useContext(CartContext)
   const { isAuthenticated, userType, isLoading } = useUser()
   const { onDemandMenu } = React.useContext(onDemandMenuContext)

   const { isMenuLoading } = onDemandMenu

   const { settings } = useConfig()

   const isLoyaltyPointsAvailable =
      settings?.rewards?.find(
         setting => setting?.identifier === 'Loyalty Points Availability'
      )?.value?.['Loyalty Points']?.IsLoyaltyPointsAvailable?.value ?? true

   if (isFinalCartLoading || isMenuLoading) {
      return <Loader type="cart-loading" />
   }

   if (
      storedCartId === null ||
      isEmpty(cartState?.cart) ||
      combinedCartItems === null ||
      combinedCartItems?.length === 0
   ) {
      return (
         <div className="hern-cart-empty-cart">
            <EmptyCart />
            <span>Oops! Your cart is empty </span>
            <Button className="hern-cart-go-to-menu-btn" onClick={() => {}}>
               <Link href="/order">GO TO MENU</Link>
            </Button>
         </div>
      )
   }
   if (!isAuthenticated && userType !== 'guest') {
      return (
         <div className="hern-on-demand-cart-section">
            <div className="hern-on-demand-cart-section__left">
               <UserType />
            </div>
            <div className="hern-on-demand-cart-section__right">
               <CartDetails />
            </div>
         </div>
      )
   }
   return (
      <div className="hern-on-demand-cart-section">
         <div className="hern-on-demand-cart-section__left">
            <div className="hern-ondemand-cart__left-card">
               <UserInfo cart={cartState.cart} />
            </div>
            <div className="hern-ondemand-cart__left-card">
               <Fulfillment cart={cartState.cart} />
            </div>
            <div className="hern-ondemand-cart__left-card">
               <Coupon upFrontLayout={true} cart={cartState.cart} />
            </div>
            {isAuthenticated && isLoyaltyPointsAvailable && (
               <div className="hern-ondemand-cart__left-card">
                  <LoyaltyPoints cart={cartState.cart} version={2} />
               </div>
            )}
            {isAuthenticated && (
               <div className="hern-ondemand-cart__left-card">
                  <WalletAmount cart={cartState.cart} version={2} />
               </div>
            )}
            <div className="hern-ondemand-cart__left-card">
               <div tw="p-4">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                     <PaymentIcon />
                     <span className="hern-user-info__heading">Payment</span>
                  </div>
                  <PaymentOptionsRenderer cartId={cartState?.cart?.id} />
               </div>
            </div>
         </div>
         <div className="hern-on-demand-cart-section__right">
            <CartDetails />
         </div>
      </div>
   )
}
