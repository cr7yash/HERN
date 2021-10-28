import React, { useState, useEffect } from 'react'
import Confetti from 'react-confetti'
import { useSubscription, useMutation } from '@apollo/client'
import { useRouter } from 'next/router'
import { useToasts } from 'react-toast-notifications'
import styled from 'styled-components'
import ReactHtmlParser from 'react-html-parser'
import { Button, Result, Spin } from 'antd'
import {
   BookingInvite,
   ChevronLeft,
   BackDrop,
   Payment,
   SpinnerIcon,
   SEO,
   Layout,
   InlineLoader,
   Button as ButtonComponent
} from '../../../../components'
import BookingCard from '../../../../pageComponents/BookingCard'
import { UPDATE_CART, CART_SUBSCRIPTION } from '../../../../graphql'
import { useUser, useExperienceInfo } from '../../../../Providers'
import { useWindowDimensions, fileParser, isEmpty } from '../../../../utils'
import { theme } from '../../../../theme'
import {
   getNavigationMenuItems,
   getBannerData,
   getGlobalFooter,
   protectedRoute
} from '../../../../lib'

function ManageBooking({
   navigationMenuItems,
   parsedData = [],
   footerHtml = ''
}) {
   const router = useRouter()
   const { bookingId } = router.query
   const { width, height } = useWindowDimensions()
   const { addToast } = useToasts()
   const { state: userState } = useUser()
   const { user = {} } = userState
   const [experienceInfo, setExperienceInfo] = useState(null)
   const [isCelebrating, setIsCelebrating] = useState(false)
   const [isBooking, setIsBooking] = useState(false)
   const [cartPayment, setCartPayment] = useState(null)
   const [actionUrl, setActionUrl] = useState('')
   const [loading, setLoading] = useState(true)

   const { error: cartSubscriptionError } = useSubscription(CART_SUBSCRIPTION, {
      variables: {
         where: {
            experienceBooking: {
               id: {
                  _eq: bookingId
               }
            }
         }
      },
      onSubscriptionData: async ({
         subscriptionData: { data: { carts = [] } = {} } = {}
      } = {}) => {
         const [cart] = carts
         if (!isEmpty(cart?.activeCartPayment)) {
            setCartPayment(cart?.activeCartPayment)
         }
         setExperienceInfo({
            ...cart,
            ...cart?.experienceClass?.experience,
            experienceClass: cart?.experienceClass,
            experienceClassType: cart?.experienceClassType
         })

         setLoading(false)
      }
   })
   const [updateCart, { loading: isCartUpdating }] = useMutation(UPDATE_CART, {
      refetchQueries: ['CART_INFO', 'CART_SUBSCRIPTION'],
      onError: error => {
         addToast('Opps! Something went wrong!', { appearance: 'error' })
         console.log(error)
      }
   })

   const stopCelebration = () => {
      router.push('/myBookings')
   }
   const startCelebration = () => {
      setIsCelebrating(true)
      setTimeout(stopCelebration, 5000)
   }

   const onPayHandler = async () => {
      setIsBooking(true)
      await updateCart({
         variables: {
            cartId: experienceInfo?.cartId,
            _inc: {
               paymentRetryAttempt: 1
            },
            _set: {
               stripeCustomerId: user?.stripeCustomerId,
               paymentMethodId: user?.defaultPaymentMethodId
            }
         }
      })
   }

   useEffect(() => {
      if (cartPayment?.paymentStatus === 'SUCCEEDED') {
         console.log('initiating celebration')
         startCelebration()
      } else if (cartPayment?.paymentStatus === 'REQUIRES_ACTION') {
         if (
            cartPayment?.transactionRemark &&
            Object.keys(cartPayment?.transactionRemark).length > 0 &&
            cartPayment?.transactionRemark.next_action
         ) {
            if (
               cartPayment?.transactionRemark.next_action.type ===
               'use_stripe_sdk'
            ) {
               setActionUrl(
                  cartPayment?.transactionRemark.next_action.use_stripe_sdk
                     .stripe_js
               )
            } else {
               setActionUrl(
                  cartPayment?.transactionRemark.next_action.redirect_to_url.url
               )
            }
         }
      }
   }, [cartPayment])

   if (loading) return <InlineLoader type="full" />
   if (cartSubscriptionError) {
      setLoading(false)
      addToast('Opps! Something went wrong!', { appearance: 'error' })
      console.error(cartSubscriptionError)
   }

   return (
      <Layout navigationMenuItems={navigationMenuItems} footerHtml={footerHtml}>
         <SEO title={`Booking-${bookingId}`} />
         <div id="myBooking-top-01">
            {Boolean(parsedData.length) &&
               ReactHtmlParser(
                  parsedData.find(fold => fold.id === 'myBooking-top-01')
                     ?.content
               )}
         </div>
         <Wrapper isBooking={isBooking}>
            <div className="checkout-heading">
               <Button
                  shape="circle"
                  icon={
                     <ChevronLeft size="24" color={theme.colors.textColor5} />
                  }
                  size="middle"
                  onClick={() =>
                     router.push(`/experiences/${experienceInfo?.experienceId}`)
                  }
               />
               <p className="go_back text10"> Back to bookings </p>
            </div>
            <h1 className="h1_head text1">Manage Booking</h1>
            {!isEmpty(experienceInfo) ? (
               <div className="container">
                  <div className="left-side-container">
                     <BookingInvite experienceBookingId={bookingId} />
                     {experienceInfo?.balancePayment > 0 && (
                        <Payment
                           type="checkout"
                           onPay={onPayHandler}
                           isOnPayDisabled={Boolean(
                              !user?.defaultPaymentMethodId || isCartUpdating
                           )}
                        />
                     )}
                  </div>
                  <div className="right-side-container">
                     <div className="sticky-card">
                        <BookingCard experienceInfo={experienceInfo} />
                     </div>
                  </div>
               </div>
            ) : (
               <Result
                  status="404"
                  title="Not Found!"
                  subTitle="Sorry, the page you visited does not exist."
                  extra={
                     <ButtonComponent
                        className="back_to_home_btn"
                        onClick={() => router.push('/')}
                     >
                        Back Home
                     </ButtonComponent>
                  }
               />
            )}
         </Wrapper>
         <BackdropDiv>
            <BackDrop show={isBooking}>
               <div className="booking-done">
                  {isCelebrating ? (
                     <Result status="success" />
                  ) : (
                     <div
                        style={{
                           display: 'flex',
                           justifyContent: 'center',
                           alignItems: 'center'
                        }}
                     >
                        <Spin size="large" />
                     </div>
                  )}
                  {isCelebrating ? (
                     <p>Successfully Booked the experience!</p>
                  ) : isEmpty(actionUrl) ? (
                     <p>Please wait while we book this experience...</p>
                  ) : (
                     <p>
                        Looks like your card requires authentication for
                        one-time payments.
                        <a
                           href={actionUrl}
                           className="action_url"
                           target="_blank"
                           rel="noreferrer"
                        >
                           Please authenticate your self here
                        </a>
                     </p>
                  )}
               </div>
               {isCelebrating && <Confetti width={width} height={height} />}
            </BackDrop>
         </BackdropDiv>
         <div id="myBooking-bottom-01">
            {Boolean(parsedData.length) &&
               ReactHtmlParser(
                  parsedData.find(fold => fold.id === 'myBooking-bottom-01')
                     ?.content
               )}
         </div>
      </Layout>
   )
}

export default protectedRoute(ManageBooking)

export const getStaticProps = async () => {
   const domain = 'primanti.dailykit.org'
   const navigationMenuItems = await getNavigationMenuItems(domain)
   const where = {
      id: {
         _in: ['myBooking-top-01', 'myBooking-bottom-01']
      }
   }
   const bannerData = await getBannerData(where)
   const parsedData = await fileParser(bannerData)
   const footerHtml = await getGlobalFooter()
   return {
      props: {
         navigationMenuItems,
         parsedData,
         footerHtml
      }
   }
}

export const getStaticPaths = async () => {
   return {
      paths: [],
      fallback: 'blocking'
   }
}

const Wrapper = styled.div`
   width: 100%;
   color: ${theme.colors.textColor4};
   padding: 64px 80px;
   filter: ${({ isBooking }) => isBooking && 'blur(4px)'};
   .experience-date {
      h4 {
         font-size: ${theme.sizes.h8};
      }
      p {
         font-size: ${theme.sizes.h8};
      }
   }
   .h1_head {
      color: ${theme.colors.textColor5};
      font-weight: 400;
      text-align: left;
      text-transform: uppercase;
      font-family: League-Gothic;
      margin-bottom: 0 !important;
   }
   .checkout-heading {
      display: flex;
      align-items: center;
      margin-bottom: 2rem;
      .go_back {
         color: ${theme.colors.textColor7};
         font-family: Proxima Nova;
         font-style: normal;
         font-weight: 600;
         letter-spacing: 0.3em;
         margin-bottom: 0 !important;
         margin-left: 1rem;
      }
      .ant-btn {
         display: flex;
         align-items: center;
         justify-content: center;
         background: ${theme.colors.textColor4};
         &:hover {
            color: ${theme.colors.textColor5};
            border-color: ${theme.colors.textColor5};
            background: ${theme.colors.textColor4};
            svg {
               stroke: ${theme.colors.textColor5};
            }
         }
      }
   }
   .container {
      width: 100%;
      display: flex;
      justify-content: flex-start;
      align-items: stretch;
      margin: 0 auto;
      .left-side-container {
         position: relative !important;
         width: 50% !important;
         margin-left: 0% !important;
         margin-right: 0% !important;
         .left-side-heading {
            font-size: ${theme.sizes.h4};
            margin-bottom: 32px;
         }
         .select-participants {
            margin-top: 16px;
            border: 1px solid ${theme.colors.textColor4};
            border-radius: 4px;
         }
         .payment-div {
            padding: 32px 0;
            .payment-icon-wrapper {
               display: flex;
               align-items: center;
               .payment-icon {
                  margin-right: 8px;
               }
            }
         }
         .sticky-payment {
            position: sticky !important;
            top: 80px !important;
            z-index: 1 !important;
            display: inline-block !important;
            width: 100% !important;
            padding-right: 1px !important;
         }
      }
      .right-side-container {
         position: relative !important;
         width: 41.6667% !important;
         margin-left: 8.33333% !important;
         margin-right: 0% !important;
         .sticky-card {
            position: sticky !important;
            top: 80px !important;
            z-index: 1 !important;
            display: inline-block !important;
            width: 100% !important;
            padding-right: 1px !important;
         }
      }
   }
   .back_to_home_btn {
      width: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${theme.colors.textColor};
      color: ${theme.colors.textColor4};
      font-family: Proxima Nova;
      font-style: normal;
      font-weight: 800;
      letter-spacing: 0.16em;
      margin: 0 auto;
      padding: 0 2rem;
   }
   @media (max-width: 769px) {
      padding: 32px 26px;
      .container {
         width: 100%;
         display: flex;
         flex-direction: column;
         justify-content: flex-start;
         align-items: stretch;
         margin: 0 auto;
         .left-side-container {
            width: 100% !important;
            margin-bottom: 64px;
         }
         .right-side-container {
            order: -1;
            margin: 0 0 1rem 0 !important;
            position: relative !important;
            width: 100% !important;
            .sticky-card {
               .card-wrapper {
                  padding: 0;
                  border: none;
               }
            }
         }
      }
   }
`

export const BackdropDiv = styled.div`
   .action_url {
      display: block;
      text-decoration: underline;
   }
   .ant-result {
      padding: 0 2rem;
   }
   .ant-result-success .ant-result-icon > .anticon {
      color: ${theme.colors.textColor4};
   }
   .ant-spin .ant-spin-dot {
      width: 2em;
      height: 2em;
      .ant-spin-dot-item {
         background-color: ${theme.colors.textColor4};
         width: 2rem;
         height: 2rem;
      }
   }
`