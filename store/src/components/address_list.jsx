import { useQuery } from '@apollo/react-hooks'
import classNames from 'classnames'
import { Col, Row } from 'antd'
import React, { useState, useEffect } from 'react'
import { useToasts } from 'react-toast-notifications'
import { CloseIcon, LocationIcon } from '../assets/icons'
import { CartContext, useUser } from '../context'
import { ZIPCODE_AVAILABILITY } from '../graphql'
import { Loader } from './loader'

const AddressList = ({
   closeTunnel,
   onSelect,
   zipCodes = true,
   tunnel = true,
}) => {
   const { user } = useUser()
   const { addToast } = useToasts()
   const { cartState } = React.useContext(CartContext)

   const addresses = user?.platform_customer?.addresses || []

   const addressByCart = cartState.cart?.address

   const [availableZipcodes, setAvailableZipcodes] = React.useState([])
   const [localAddress, setLocalAddress] = useState(null)

   const { loading } = useQuery(ZIPCODE_AVAILABILITY, {
      fetchPolicy: 'network-only',
      variables: {
         subscriptionId: {
            _eq: user?.subscriptionId,
         },
         zipcode: {},
      },
      onCompleted: ({ subscription_zipcode = [] }) => {
         if (zipCodes && subscription_zipcode.length) {
            setAvailableZipcodes(subscription_zipcode.map(z => z.zipcode))
         }
      },
      onError: error => {
         addToast('Something went wrong', { appearance: 'error' })
         console.log('checkZipcodeValidity -> zipcode -> error', error)
      },
   })

   const selectAddress = address => {
      if (zipCodes && availableZipcodes.includes(address.zipcode)) {
         onSelect(address)
      } else {
         setLocalAddress(address)
         onSelect(address)
      }
   }

   if (loading) return <Loader />

   return (
      <div className="hern-address-list">
         <div className="hern-address-list__header">
            <h3 className="hern-address-list__heading">Your saved addresses</h3>
            {tunnel && (
               <button className="hern-address-list__close-btn">
                  <CloseIcon
                     size={16}
                     color=" rgba(52,211,153,1)"
                     stroke="currentColor"
                     onClick={closeTunnel}
                  />
               </button>
            )}
         </div>
         <div className="hern-address-list-container__address">
            <Row>
               {user?.keycloakId ? (
                  addresses.map(address => {
                     const addressClasses = classNames(
                        'hern-address-list__address',
                        {
                           'hern-address-list__address--active': localAddress,
                        }
                     )
                     return (
                        <address
                           key={address?.id}
                           className={addressClasses}
                           tabIndex={1}
                           onClick={() => selectAddress(address)}
                        >
                           <AddressListHeader />
                           <div className="hern-address-list__address-landmark">
                              {address?.landmark}
                           </div>
                           <p className="hern-address-list__address-line1">
                              {address?.line1}, {address?.line2},{' '}
                              {address?.city},{address?.state},{' '}
                              {address?.zipcode}, {address?.country}
                           </p>
                        </address>
                     )
                  })
               ) : (
                  <address
                     key={addressByCart?.id || 1}
                     tabIndex={1}
                     className={classNames('hern-address-list__address', {
                        'hern-address-list__address--active':
                           localAddress === addressByCart,
                     })}
                     onClick={() => selectAddress(addressByCart)}
                  >
                     <p>{addressByCart?.line1}</p>
                     <p>{addressByCart?.line2}</p>
                     <span>{addressByCart?.city} </span>
                     <span>{addressByCart?.state} </span>
                     <span>
                        {addressByCart?.country}
                        {', '}
                     </span>
                     <span>{addressByCart?.zipcode}</span>
                  </address>
               )}
            </Row>
         </div>
      </div>
   )
}

export default AddressList
export const AddressListHeader = () => {
   return (
      <div
         style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '10px',
         }}
      >
         <LocationIcon />
         <label
            className={'hern-address-list-header__label'}
            htmlFor="address-list-header"
         >
            Delivery Area
         </label>
      </div>
   )
}
