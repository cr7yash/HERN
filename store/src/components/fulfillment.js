import React, { useState, useEffect } from 'react'
import { Col, Radio, Row, Space, Carousel } from 'antd'
import { useConfig } from '../lib'
import {
   DineinTable,
   GPSIcon,
   OrderTime,
   ArrowLeftIcon,
   ArrowRightIcon,
} from '../assets/icons'
import {
   BRAND_LOCATIONS,
   BRAND_ONDEMAND_DELIVERY_RECURRENCES,
   GET_BRAND_LOCATION,
   ONDEMAND_DINE_BRAND_RECURRENCES,
   ONDEMAND_PICKUP_BRAND_RECURRENCES,
   PREORDER_DELIVERY_BRAND_RECURRENCES,
   PREORDER_PICKUP_BRAND_RECURRENCES,
   SCHEDULED_DINEIN_BRAND_RECURRENCES,
} from '../graphql'
import { getDistance, convertDistance } from 'geolib'
import moment from 'moment'

import {
   get_env,
   isClient,
   isPreOrderDeliveryAvailable,
   isStoreOnDemandDeliveryAvailable,
   generateDeliverySlots,
   generateMiniSlots,
   isStoreOnDemandPickupAvailable,
   isStorePreOrderPickupAvailable,
   generatePickUpSlots,
   generateTimeStamp,
} from '../utils'
import { CartContext, useUser } from '../context'
import { useQuery } from '@apollo/react-hooks'
import { Loader, Button } from '.'
import classNames from 'classnames'
// import AddressListOuter from './address_list_outer'
import { AddressTunnel } from '../sections/select-delivery/address_tunnel'
import AddressList from './address_list'
// import AddressList from './address_list'

export const FulfillmentForm = ({ isEdit, setIsEdit }) => {
   const { brand, orderTabs, locationId, selectedOrderTab, configOf } =
      useConfig()
   const { user } = useUser()
   const theme = configOf('theme-color', 'Visual')
   const addresses = user?.platform_customer?.addresses || []

   // check whether user select fulfillment type or not
   const selectedFulfillmentType = React.useMemo(() =>
      selectedOrderTab ? selectedOrderTab.replace('_', ' ').split(' ')[1] : null
   )
   const [fulfillmentType, setFulfillmentType] = useState(
      selectedFulfillmentType || 'PICKUP'
   )
   const [address, setAddress] = useState(null)
   const [brandLocation, setBrandLocation] = useState(null)

   const [userCoordinate, setUserCoordinate] = useState({
      latitude: null,
      longitude: null,
   })

   // useEffect(() => {
   //    const localUserLocation = JSON.parse(localStorage.getItem('userLocation'))
   //    console.log(localUserLocation, "localUserLocation")
   //    if (localUserLocation) {
   //       setAddress(localUserLocation)
   //    }
   // }, [])

   // get all store when user address available
   const {
      loading: brandLocationLoading,
      data: { brands_brand_location_aggregate = {} } = {},
   } = useQuery(BRAND_LOCATIONS, {
      skip: !address?.city || !address?.state || !brand || !brand?.id,
      variables: {
         where: {
            _or: [
               {
                  location: {
                     city: { _eq: address?.city },
                     state: { _eq: address?.state },
                  },
               },
               {
                  _or: [
                     { doesDeliverOutsideCity: { _eq: true } },
                     { doesDeliverOutsideState: { _eq: true } },
                  ],
               },
            ],
            brandId: { _eq: brand.id },
            ...(locationId || { locationId: { _eq: locationId } }),
         },
      },
      onCompleted: data => {
         if (data && data.brands_brand_location_aggregate.nodes.length !== 0) {
            setBrandLocation(data.brands_brand_location_aggregate.nodes)
         }
      },
      onError: error => {
         console.log(error)
      },
   })

   const orderTabFulfillmentType = React.useMemo(
      () =>
         orderTabs
            ? orderTabs.map(eachTab => eachTab.orderFulfillmentTypeLabel)
            : null,
      [orderTabs]
   )

   const [deliveryRadioOptions] = useState([
      {
         label: 'Deliver',
         value: 'DELIVERY',
         disabled: !(
            orderTabFulfillmentType.includes('ONDEMAND_DELIVERY') ||
            orderTabFulfillmentType.includes('PREORDER_DELIVERY')
         ),
      },
      {
         label: 'Pickup',
         value: 'PICKUP',
         disabled: !(
            orderTabFulfillmentType.includes('ONDEMAND_PICKUP') ||
            orderTabFulfillmentType.includes('PREORDER_PICKUP')
         ),
      },
      // (orderTabFulfillmentType.includes('ONDEMAND_DINEIN') ||
      //    orderTabFulfillmentType.includes('SCHEDULED_DINEIN')) && {
      //    label: 'Dinein',
      //    value: 'DINEIN',
      //    disabled: !(
      //       orderTabFulfillmentType.includes('ONDEMAND_DINEIN') ||
      //       orderTabFulfillmentType.includes('SCHEDULED_DINEIN')
      //    ),
      // },
   ])

   const onAddressSelect = newAddress => {
      const modifiedAddress = {
         ...newAddress,
         latitude: newAddress.lat,
         longitude: newAddress.lng,
         address: { zipcode: newAddress.zipcode },
      }
      setAddress(modifiedAddress)
      localStorage.setItem('userLocation', JSON.stringify(modifiedAddress))
   }
   const onPickUpAddressSelect = newAddress => {
      const modifiedAddress = {
         ...newAddress,
         latitude: newAddress.lat,
         longitude: newAddress.lng,
         address: { zipcode: newAddress.zipcode },
      }
      setAddress(modifiedAddress)
      localStorage.setItem('userLocation', JSON.stringify(modifiedAddress))
   }

   return (
      <div className="hern-cart__fulfillment-card">
         <div style={{ position: 'relative' }}>
            <div className="hern-cart__fulfillment-heading">
               <DineinTable style={{}} />
               <span className="hern-cart__fulfillment-heading-text">
                  How would you like to order?
               </span>
            </div>
            {isEdit && (
               <Button
                  onClick={() => {
                     setIsEdit(false)
                  }}
                  className="hern-cart__fulfillment-change-btn"
                  style={{
                     color: theme?.accent || 'rgba(5, 150, 105, 1)',
                     border: `1px solid ${theme?.accent || 'rgba(5, 150, 105, 1)'
                        }`,
                     bottom: '8px',
                  }}
               >
                  Cancel
               </Button>
            )}
            <Space size={'large'} style={{ margin: '10px 0' }}>
               <Radio.Group
                  options={deliveryRadioOptions}
                  onChange={e => {
                     setFulfillmentType(e.target.value)
                     setAddress(null)
                  }}
                  value={fulfillmentType}
               />
            </Space>
            {fulfillmentType === 'DELIVERY' && (
               <Row>
                  <Col span={12}>
                     <AddressTunnel outside={true} />
                  </Col>
                  <Col span={24}>
                     <AddressList
                        zipCodes={false}
                        tunnel={false}
                        onSelect={onAddressSelect}
                     />
                  </Col>
               </Row>
            )}
         </div>
         {fulfillmentType === 'DELIVERY' && (
            <Delivery
               brands_brand_location_aggregate={brands_brand_location_aggregate}
               address={address}
               orderTabFulfillmentType={orderTabFulfillmentType}
               brandLocation={brandLocation}
            />
         )}
         {fulfillmentType === 'PICKUP' && (
            <Pickup
               brands_brand_location_aggregate={brands_brand_location_aggregate}
               address={address}
               orderTabFulfillmentType={orderTabFulfillmentType}
               onPickUpAddressSelect={onPickUpAddressSelect}
               brandLocation={brandLocation}
            />
         )}
      </div>
   )
}

const Delivery = props => {
   const {
      brands_brand_location_aggregate,
      address,
      orderTabFulfillmentType,
      brandLocation,
   } = props
   const { brand, locationId, orderTabs } = useConfig()
   const { methods, cartState } = React.useContext(CartContext)

   const [deliveryType, setDeliveryType] = useState(null)
   const [status, setStatus] = useState('loading')
   const [selectedStore, setSelectedStore] = useState(null)
   const [sortedBrandLocation, setSortedBrandLocation] = useState(null)
   const [onDemandBrandRecurrence, setOnDemandBrandReoccurrence] =
      useState(null)
   const [preOrderBrandRecurrence, setPreOrderBrandReoccurrence] =
      useState(null)
   const [deliverySlots, setDeliverySlots] = useState(null)
   const [selectedSlot, setSelectedSlot] = useState(null)
   const [fulfillmentTabInfo, setFulfillmentTabInfo] = useState({
      orderTabId: null,
      locationId: null,
      // fulfillmentInfo: null,
   })

   const [deliveryRadioOptions] = useState([
      {
         label: 'Now',
         value: 'ONDEMAND',
         disabled: !(
            orderTabFulfillmentType &&
            orderTabFulfillmentType.includes('ONDEMAND_DELIVERY')
         ),
      },
      {
         label: 'Later',
         value: 'PREORDER',
         disabled: !(
            orderTabFulfillmentType &&
            orderTabFulfillmentType.includes('PREORDER_DELIVERY')
         ),
      },
   ])

   const fulfillmentStatus = React.useMemo(() => {
      let type
      if (deliveryType === 'ONDEMAND' || deliveryType === 'PREORDER') {
         type = 'deliveryStatus'
         return type
      }
   }, [deliveryType])

   const brandRecurrences = React.useMemo(() =>
      deliveryType === 'ONDEMAND'
         ? onDemandBrandRecurrence
         : preOrderBrandRecurrence
   )

   // onDemand delivery
   const { loading: brandRecurrencesLoading } = useQuery(
      BRAND_ONDEMAND_DELIVERY_RECURRENCES,
      {
         skip:
            !brands_brand_location_aggregate?.nodes ||
            !brands_brand_location_aggregate?.nodes?.length > 0 ||
            !brand ||
            !brand.id ||
            !(deliveryType === 'ONDEMAND'),
         variables: {
            where: {
               recurrence: {
                  isActive: { _eq: true },
                  type: { _eq: 'ONDEMAND_DELIVERY' },
               },
               _or: [
                  {
                     brandLocationId: {
                        _in: brands_brand_location_aggregate?.nodes?.map(
                           x => x.id
                        ),
                     },
                  },
                  { brandId: { _eq: brand.id } },
               ],
               isActive: { _eq: true },
            },
         },
         fetchPolicy: 'network-only',
         onCompleted: data => {
            if (data) {
               setOnDemandBrandReoccurrence(data.brandRecurrences)
            }
         },
         onError: e => {
            console.log('Ondemand brand recurrences error:::', e)
         },
      }
   )

   // preOrderDelivery
   const { loading: preOrderBrandRecurrencesLoading } = useQuery(
      PREORDER_DELIVERY_BRAND_RECURRENCES,
      {
         skip:
            !brands_brand_location_aggregate?.nodes ||
            !brands_brand_location_aggregate?.nodes?.length > 0 ||
            !brand ||
            !brand.id ||
            !(deliveryType === 'PREORDER'),
         variables: {
            where: {
               recurrence: {
                  isActive: { _eq: true },
                  type: { _eq: 'PREORDER_DELIVERY' },
               },
               _or: [
                  {
                     brandLocationId: {
                        _in: brands_brand_location_aggregate?.nodes?.map(
                           x => x.id
                        ),
                     },
                  },
                  { brandId: { _eq: brand.id } },
               ],
               isActive: { _eq: true },
            },
         },
         fetchPolicy: 'network-only',
         onCompleted: data => {
            if (data) {
               setPreOrderBrandReoccurrence(data.brandRecurrences)
            }
         },
         onError: e => {
            console.log('preOrder brand recurrences error:::', e)
         },
      }
   )
   useEffect(() => {
      // if locationId already available then need not to choose store automatically
      if (
         !locationId &&
         address &&
         sortedBrandLocation &&
         sortedBrandLocation.every(eachStore =>
            Boolean(eachStore[fulfillmentStatus])
         )
      ) {
         const firstStore = sortedBrandLocation.filter(
            eachStore => eachStore[fulfillmentStatus].status
         )[0]
         setSelectedStore(firstStore)
         if (deliveryType === 'PREORDER') {
            const deliverySlots = generateDeliverySlots([
               firstStore.deliveryStatus.rec.recurrence,
            ])
            const miniSlots = generateMiniSlots(deliverySlots.data, 60)
            setDeliverySlots(miniSlots)
         }
      }
      if (locationId) {
      }
   }, [sortedBrandLocation, address])

   useEffect(() => {
      if (brandLocation && address && deliveryType) {
         ; (async () => {
            const bar = await getAerialDistance(brandLocation, true)
            setSortedBrandLocation(bar)
         })()
      }
   }, [brandLocation, brandRecurrences, address, deliveryType])

   const getAerialDistance = async (data, sorted = false) => {
      const userLocation = JSON.parse(localStorage.getItem('userLocation'))
      const userLocationWithLatLang = {
         latitude: userLocation.latitude,
         longitude: userLocation.longitude,
      }

      // // add arial distance
      const dataWithAerialDistance = await Promise.all(
         data.map(async eachStore => {
            const aerialDistance = getDistance(
               userLocationWithLatLang,
               eachStore.location.locationAddress.locationCoordinates,
               0.1
            )
            const aerialDistanceInMiles = convertDistance(aerialDistance, 'mi')
            eachStore['aerialDistance'] = parseFloat(
               aerialDistanceInMiles.toFixed(2)
            )
            eachStore['distanceUnit'] = 'mi'
            if (brandRecurrences && deliveryType === 'ONDEMAND') {
               const deliveryStatus = await isStoreOnDemandDeliveryAvailable(
                  brandRecurrences,
                  eachStore
               )
               eachStore[fulfillmentStatus] = deliveryStatus
            }
            if (brandRecurrences && deliveryType === 'PREORDER') {
               const deliveryStatus = await isPreOrderDeliveryAvailable(
                  brandRecurrences,
                  eachStore
               )
               eachStore[fulfillmentStatus] = deliveryStatus
            }
            return eachStore
         })
      )
      // sort by distance
      if (sorted) {
         const sortedDataWithAerialDistance = _.sortBy(dataWithAerialDistance, [
            x => x.aerialDistance,
         ])

         if (brandRecurrences) {
            setStatus('success')
         }
         return sortedDataWithAerialDistance
      }
      return dataWithAerialDistance
   }

   const onFulfillmentTimeClick = timestamp => {
      const slotInfo = {
         slot: {
            from: timestamp.from,
            to: timestamp.to,
            mileRangeId: selectedStore.deliveryStatus.mileRangeInfo.id,
         },
         type: 'PREORDER_DELIVERY',
      }
      methods.cart.update({
         variables: {
            id: cartState?.cart?.id,
            _set: {
               ...fulfillmentTabInfo,
               fulfillmentInfo: slotInfo,
               address,
            },
         },
      })
      setIsEdit(false)
   }
   useEffect(() => {
      if (deliveryType === 'ONDEMAND' && selectedStore) {
         onNowClick()
      }
   }, [deliveryType, selectedStore])

   const onNowClick = () => {
      const slotInfo = {
         slot: {
            from: moment().format(),
            to: moment()
               .add(
                  selectedStore.deliveryStatus.mileRangeInfo.prepTime,
                  'minutes'
               )
               .format(),
            mileRangeId: selectedStore.deliveryStatus.mileRangeInfo.id,
         },
         type: 'ONDEMAND_DELIVERY',
      }

      methods.cart.update({
         variables: {
            id: cartState?.cart?.id,
            _set: {
               ...fulfillmentTabInfo,
               fulfillmentInfo: slotInfo,
               locationId: selectedStore.id,
               address,
            },
         },
      })
      setIsEdit(false)
   }

   // for ondemand delivery
   useEffect(() => {
      if (selectedStore) {
         setFulfillmentTabInfo(prev => {
            return { ...prev, locationId: selectedStore.id }
         })
      }
   }, [selectedStore])

   // if (!locationId && selectedStore === null) {
   //    return <p>Please Select an address</p>
   // }
   // if (!selectedStore.deliveryStatus.status) {
   //    return <p>{selectedStore.deliveryStatus.message}</p>
   // }

   if (!address) {
      return <p>Please Select an address</p>
   }

   return (
      <div className="hern-cart__fulfillment-time-section">
         <div className="hern-cart__fulfillment-time-section-heading">
            <OrderTime />
            <span>When would you like to order?</span>
         </div>

         <Radio.Group
            options={deliveryRadioOptions}
            onChange={e => {
               setDeliveryType(e.target.value)
               const orderTabId = orderTabs.find(
                  t =>
                     t.orderFulfillmentTypeLabel ===
                     `${e.target.value}_DELIVERY`
               )?.id
               setFulfillmentTabInfo(prev => {
                  return { ...prev, orderTabId }
               })
            }}
            value={deliveryType}
            className="hern-cart__fulfillment-date-slot"
         />

         {!deliveryType ? (
            <p>Please select a delivery type.</p>
         ) : sortedBrandLocation === null || selectedStore === null ? (
            <Loader inline />
         ) : !selectedStore?.deliveryStatus?.status ? (
            <p>{selectedStore.deliveryStatus.message}</p>
         ) : deliveryType === 'ONDEMAND' ? (
            <p>Store Available for Delivery</p>
         ) : deliverySlots == null ? (
            <Loader inline />
         ) : (
            <Space direction={'vertical'}>
               <div>
                  <p className="hern-cart__fulfillment-slot-heading">
                     Fulfillment Date
                  </p>
                  <Radio.Group
                     onChange={e => {
                        setSelectedSlot(e.target.value)
                     }}
                  >
                     <Space size={'middle'}>
                        {deliverySlots.map((eachSlot, index) => {
                           return (
                              <Radio.Button value={eachSlot}>
                                 {moment(eachSlot.date).format('DD MMM YY')}
                              </Radio.Button>
                           )
                        })}
                     </Space>
                  </Radio.Group>
               </div>
               {selectedSlot && (
                  <div>
                     <p className="hern-cart__fulfillment-slot-heading">
                        Fulfillment Time
                     </p>
                     <Radio.Group
                        onChange={e => {
                           const newTimeStamp = generateTimeStamp(
                              e.target.value.time,
                              selectedSlot.date,
                              60
                           )
                           onFulfillmentTimeClick(newTimeStamp)
                        }}
                     >
                        {selectedSlot.slots.map((eachSlot, index, elements) => {
                           const slot = {
                              from: eachSlot.time,
                              to: elements[index + 1]?.time || eachSlot.end,
                           }
                           return (
                              <Radio.Button value={eachSlot}>
                                 {slot.from}
                                 {'-'}
                                 {slot.to}
                              </Radio.Button>
                           )
                        })}
                     </Radio.Group>
                  </div>
               )}
            </Space>
         )}
      </div>
   )
}

const Pickup = props => {
   const {
      brands_brand_location_aggregate,
      address,
      orderTabFulfillmentType,
      onPickUpAddressSelect,
      brandLocation,
   } = props

   const { brand, locationId, configOf, orderTabs } = useConfig()
   const { methods, cartState } = React.useContext(CartContext)

   const theme = configOf('theme-color', 'visual')
   const storeCarousal = React.useRef()
   const lastCarousal = e => {
      e.stopPropagation()
      storeCarousal.current.prev()
   }
   const nextCarousal = e => {
      e.stopPropagation()
      storeCarousal.current.next()
   }

   const [pickupRadioOptions] = useState([
      {
         label: 'Now',
         value: 'ONDEMAND',
         disabled:
            orderTabFulfillmentType &&
            !orderTabFulfillmentType.includes('ONDEMAND_PICKUP'),
      },
      {
         label: 'Later',
         value: 'PREORDER',
         disabled:
            orderTabFulfillmentType &&
            !orderTabFulfillmentType.includes('PREORDER_PICKUP'),
      },
   ])

   const [pickupType, setPickUpType] = useState(null)
   const [onDemandBrandRecurrence, setOnDemandBrandReoccurrence] =
      useState(null)
   const [preOrderBrandRecurrence, setPreOrderBrandReoccurrence] =
      useState(null)
   const [status, setStatus] = useState('loading')
   const [sortedBrandLocation, setSortedBrandLocation] = useState(null)
   const [selectedStore, setSelectedStore] = useState(null)
   const [pickupSlots, setPickupSlots] = useState(null)
   const [selectedSlot, setSelectedSlot] = useState(null)
   const [fulfillmentTabInfo, setFulfillmentTabInfo] = useState({
      orderTabId: null,
      locationId: null,
   })
   const fulfillmentStatus = React.useMemo(() => {
      let type
      if (pickupType === 'ONDEMAND' || pickupType === 'PREORDER') {
         type = 'pickupStatus'
         return type
      }
   }, [pickupType])
   const { loading: onDemandPickupRecurrenceLoading } = useQuery(
      ONDEMAND_PICKUP_BRAND_RECURRENCES,
      {
         skip: !brand || !brand.id,
         variables: {
            where: {
               isActive: { _eq: true },
               recurrence: {
                  isActive: { _eq: true },
                  type: { _eq: 'ONDEMAND_PICKUP' },
               },
               brandId: { _eq: brand.id },
            },
         },
         onCompleted: data => {
            if (data) {
               setOnDemandBrandReoccurrence(data.brandRecurrences)
            }
         },
      }
   )
   const { loading: preOrderPickRecurrencesLoading } = useQuery(
      PREORDER_PICKUP_BRAND_RECURRENCES,
      {
         skip: !brand || !brand.id,
         variables: {
            where: {
               isActive: { _eq: true },
               recurrence: {
                  isActive: { _eq: true },
                  type: { _eq: 'PREORDER_PICKUP' },
               },
               brandId: { _eq: brand.id },
            },
         },
         onCompleted: data => {
            if (data) {
               setPreOrderBrandReoccurrence(data.brandRecurrences)
            }
         },
      }
   )
   const brandRecurrences = React.useMemo(() =>
      pickupType === 'ONDEMAND'
         ? onDemandBrandRecurrence
         : preOrderBrandRecurrence
   )

   useEffect(() => {
      if (pickupType === 'PREORDER' && selectedStore) {
         const pickupSlots = generatePickUpSlots(
            selectedStore.pickupStatus.rec.map(x => x.recurrence)
         )
         const miniSlots = generateMiniSlots(pickupSlots.data, 60)
         setPickupSlots(miniSlots)
      }
   }, [selectedStore])

   useEffect(() => {
      if (brandLocation && address) {
         ; (async () => {
            const bar = await getAerialDistance(brandLocation, true)
            setSortedBrandLocation(bar)
         })()
      }
   }, [brandLocation, brandRecurrences, address, pickupType])

   const getAerialDistance = async (data, sorted = false) => {
      const userLocation = JSON.parse(localStorage.getItem('userLocation'))
      const userLocationWithLatLang = {
         latitude: userLocation.latitude,
         longitude: userLocation.longitude,
      }

      // // add arial distance
      const dataWithAerialDistance = await Promise.all(
         data.map(async eachStore => {
            const aerialDistance = getDistance(
               userLocationWithLatLang,
               eachStore.location.locationAddress.locationCoordinates,
               0.1
            )
            const aerialDistanceInMiles = convertDistance(aerialDistance, 'mi')
            eachStore['aerialDistance'] = parseFloat(
               aerialDistanceInMiles.toFixed(2)
            )
            eachStore['distanceUnit'] = 'mi'
            if (brandRecurrences && pickupType === 'ONDEMAND') {
               const pickupStatus = await isStoreOnDemandPickupAvailable(
                  brandRecurrences,
                  eachStore
               )
               eachStore[fulfillmentStatus] = pickupStatus
            }
            if (brandRecurrences && pickupType === 'PREORDER') {
               const pickupStatus = await isStorePreOrderPickupAvailable(
                  brandRecurrences,
                  eachStore
               )
               eachStore[fulfillmentStatus] = pickupStatus
            }
            return eachStore
         })
      )
      // sort by distance
      if (sorted) {
         const sortedDataWithAerialDistance = _.sortBy(dataWithAerialDistance, [
            x => x.aerialDistance,
         ])

         if (brandRecurrences) {
            setStatus('success')
         }
         return sortedDataWithAerialDistance
      }
      return dataWithAerialDistance
   }

   useEffect(() => {
      if (pickupType === 'ONDEMAND' && selectedStore) {
         onNowPickup()
      }
   }, [selectedStore, pickupType])

   const onNowPickup = () => {
      const mileRange = selectedStore.pickupStatus.timeSlotInfo.mileRanges
         ? selectedStore.pickupStatus.timeSlotInfo.mileRanges[0]
         : null
      const slotInfo = {
         slot: {
            from: moment().format(),
            to: moment()
               .add(mileRange ? mileRange.prepTime : 60, 'minutes')
               .format(),
            timeslotId: selectedStore.pickupStatus.timeSlotInfo.id,
         },
         type: 'ONDEMAND_PICKUP',
      }

      methods.cart.update({
         variables: {
            id: cartState?.cart?.id,
            _set: {
               ...fulfillmentTabInfo,
               fulfillmentInfo: slotInfo,
               locationId: selectedStore.id,
               address,
            },
         },
      })
      setIsEdit(false)
   }

   const onFulfillmentTimeClick = timestamp => {
      let timeslotInfo = null
      selectedStore.pickupStatus.rec.forEach(x => {
         x.recurrence.timeSlots.forEach(timeSlot => {
            const format = 'HH:mm:ss'
            const chosenTime = moment(timestamp.from).format(format)
            const toTime = moment(timeSlot.to, format)
            const fromTime = moment(timeSlot.from, format)
            const isInBetween = moment(chosenTime, format).isBetween(
               fromTime,
               toTime
            )
            if (isInBetween) {
               timeslotInfo = timeSlot
            }
         })
      })

      const slotInfo = {
         slot: {
            from: timestamp.from,
            to: timestamp.to,
            timeslotId: timeslotInfo ? timeslotInfo?.id : null,
         },
         type: 'PREORDER_PICKUP',
      }

      methods.cart.update({
         variables: {
            id: cartState?.cart?.id,
            _set: {
               ...fulfillmentTabInfo,
               fulfillmentInfo: slotInfo,
               address,
               locationId: selectedStore.id,
            },
         },
      })
      setIsEdit(false)
   }
   return (
      <div>
         <Row>
            <Col span={10}>
               <AddressTunnel
                  outside={true}
                  showAddressForm={false}
                  onInputFiledSelect={onPickUpAddressSelect}
               />
            </Col>
         </Row>
         {!address ? (
            <p>Please Select an address</p>
         ) : (
            <div style={{ position: 'relative' }}>
               <div className="hern-cart__fulfillment-time-section-heading">
                  <OrderTime />
                  <span>When would you like your order?</span>
               </div>
               <div>
                  <Radio.Group
                     options={pickupRadioOptions}
                     onChange={e => {
                        setPickUpType(e.target.value)
                        const orderTabId = orderTabs.find(
                           t =>
                              t.orderFulfillmentTypeLabel ===
                              `${e.target.value}_DELIVERY`
                        )?.id
                        setFulfillmentTabInfo(prev => {
                           return { ...prev, orderTabId }
                        })
                        setSelectedStore(null)
                     }}
                     value={pickupType}
                  />
               </div>
            </div>
         )}
         {sortedBrandLocation &&
            sortedBrandLocation.some(x => x?.pickupStatus?.status) && (
               <div style={{ position: 'relative' }}>
                  <ArrowLeftIcon
                     size={24}
                     className="hern-cart__store-arrow hern-cart__store-arrow-left"
                     style={{
                        background: `${theme?.accent}` || '#367bf599',
                     }}
                     onClick={lastCarousal}
                  />
                  <ArrowRightIcon
                     size={24}
                     className="hern-cart__store-arrow hern-cart__store-arrow-right"
                     style={{
                        background: `${theme?.accent}` || '#367bf599',
                     }}
                     onClick={nextCarousal}
                  />
                  <Carousel
                     ref={storeCarousal}
                     dots={false}
                     slidesToShow={3}
                     slidesToScroll={3}
                     infinite={false}
                  >
                     {sortedBrandLocation.map((eachStore, index) => {
                        const {
                           location: {
                              label,
                              id,
                              locationAddress,
                              city,
                              state,
                              country,
                              zipcode,
                           },
                           aerialDistance,
                           distanceUnit,
                        } = eachStore
                        const { line1, line2 } = locationAddress
                        if (!eachStore[fulfillmentStatus].status) {
                           return null
                        }
                        return (
                           <div
                              key={index}
                              className={classNames(
                                 'hern-store-location-selector__each-store',
                                 {
                                    'hern-store-location-selector__each-store--border':
                                       selectedStore && id === selectedStore.id,
                                 }
                              )}
                              onClick={() => {
                                 if (eachStore[fulfillmentStatus].status) {
                                    setSelectedStore(eachStore)
                                 }
                              }}
                              style={{ cursor: 'pointer' }}
                           >
                              <div className="hern-store-location-selector__store-location-info-container">
                                 <div className="hern-store-location-selector__store-location-details">
                                    {true && (
                                       <span className="hern-store-location__store-location-label">
                                          {label}
                                       </span>
                                    )}
                                    {true && (
                                       <>
                                          <span className="hern-store-location__store-location-address hern-store-location__store-location-address-line1">
                                             {line1}
                                          </span>
                                          <span className="hern-store-location__store-location-address hern-store-location__store-location-address-line2">
                                             {line2}
                                          </span>
                                          <span className="hern-store-location__store-location-address hern-store-location__store-location-address-c-s-c-z">
                                             {city} {state} {country}
                                             {' ('}
                                             {zipcode}
                                             {')'}
                                          </span>
                                       </>
                                    )}
                                 </div>
                              </div>
                              <div className="hern-store-location-selector__time-distance">
                                 <div className="hern-store-location-selector__aerialDistance">
                                    <span>
                                       {aerialDistance} {distanceUnit}
                                    </span>
                                 </div>
                              </div>
                           </div>
                        )
                     })}
                  </Carousel>
               </div>
            )}
         {pickupType === 'PREORDER' && pickupSlots && (
            <Space direction={'vertical'}>
               <div>
                  <p className="hern-cart__fulfillment-slot-heading">
                     Fulfillment Date
                  </p>
                  <Radio.Group
                     onChange={e => {
                        setSelectedSlot(e.target.value)
                     }}
                  >
                     <Space size={'middle'}>
                        {pickupSlots.map((eachSlot, index) => {
                           return (
                              <Radio.Button value={eachSlot}>
                                 {moment(eachSlot.date).format('DD MMM YY')}
                              </Radio.Button>
                           )
                        })}
                     </Space>
                  </Radio.Group>
               </div>
               {selectedSlot && (
                  <div>
                     <p className="hern-cart__fulfillment-slot-heading">
                        Fulfillment Time
                     </p>
                     <Radio.Group
                        onChange={e => {
                           const newTimeStamp = generateTimeStamp(
                              e.target.value.time,
                              selectedSlot.date,
                              60
                           )
                           onFulfillmentTimeClick(newTimeStamp)
                        }}
                     >
                        {selectedSlot.slots.map((eachSlot, index, elements) => {
                           const slot = {
                              from: eachSlot.time,
                              to: elements[index + 1]?.time || eachSlot.end,
                           }
                           return (
                              <Radio.Button value={eachSlot}>
                                 {slot.from}
                                 {'-'}
                                 {slot.to}
                              </Radio.Button>
                           )
                        })}
                     </Radio.Group>
                  </div>
               )}
            </Space>
         )}
         <div></div>
      </div>
   )
}

export const Fulfillment = () => {
   const { cartState } = React.useContext(CartContext)
   const { brand, configOf } = useConfig()
   const theme = configOf('theme-color', 'Visual')

   const [isEdit, setIsEdit] = useState(false)
   const title = React.useMemo(() => {
      switch (cartState.cart?.fulfillmentInfo?.type) {
         case 'ONDEMAND_DELIVERY':
            return 'Delivery'
         case 'PREORDER_DELIVERY':
            return 'Schedule Delivery'
         case 'PREORDER_PICKUP':
            return 'Schedule Pickup'
         case 'ONDEMAND_PICKUP':
            return 'Pickup'
      }
   }, [cartState.cart])

   const {
      loading: brandLocationLading,
      error: brandLocationError,
      data: brandLocation,
   } = useQuery(BRAND_LOCATIONS, {
      skip:
         !brand || !brand?.id || !cartState.cart || !cartState.cart?.locationId,
      variables: {
         where: {
            brandId: { _eq: brand.id },
            locationId: { _eq: cartState.cart?.locationId },
         },
      },
   })

   const addressInfo = React.useMemo(() => {
      if (
         cartState.cart?.fulfillmentInfo?.type === 'ONDEMAND_DELIVERY' ||
         cartState.cart?.fulfillmentInfo?.type === 'PREORDER_DELIVERY'
      ) {
         const { location } =
            brandLocation.brands_brand_location_aggregate.nodes[0]
         const brandCoordinate = {
            latitude: location.lat,
            longitude: location.lng,
         }
         const aerialDistance = getDistance(
            {
               latitude: cartState.cart.address.lat,
               longitude: cartState.cart.address.lng,
            },
            brandCoordinate,
            0.1
         )
         const aerialDistanceInMiles = convertDistance(aerialDistance, 'mi')
         return {
            ...cartState.cart.address,
            aerialDistance: aerialDistanceInMiles,
            distanceUnit: 'mi',
         }
      }
      if (
         cartState.cart?.fulfillmentInfo?.type === 'ONDEMAND_PICKUP' ||
         cartState.cart?.fulfillmentInfo?.type === 'PREORDER_PICKUP'
      ) {
         if (!brandLocation) {
            return {}
         }
         const {
            location: {
               label,
               id,
               locationAddress,
               city,
               state,
               country,
               zipcode,
               lat,
               lng,
            },
         } = brandLocation.brands_brand_location_aggregate.nodes[0]
         const { line1, line2 } = locationAddress
         const aerialDistance = getDistance(
            {
               latitude: cartState.cart.address.lat,
               longitude: cartState.cart.address.lng,
            },
            {
               latitude: lat,
               longitude: lng,
            },
            0.1
         )
         const aerialDistanceInMiles = convertDistance(aerialDistance, 'mi')
         return {
            label,
            id,
            city,
            state,
            country,
            zipcode,
            line1,
            line2,
            aerialDistance: aerialDistanceInMiles,
            distanceUnit: 'mi',
         }
      }
   }, [cartState.cart, brandLocation])
   if (brandLocationLading) {
      return <Loader inline />
   }
   return (
      <>
         {cartState.cart?.fulfillmentInfo === null || isEdit ? (
            <FulfillmentForm isEdit={isEdit} setIsEdit={setIsEdit} />
         ) : (
            <div className="hern-cart__fulfillment-card">
               <div className="hern-cart__fulfillment-heading">
                  <DineinTable />
                  <span className="hern-cart__fulfillment-heading-text">
                     How would you like to your order?
                  </span>
               </div>
               <div style={{ position: 'relative' }}>
                  <label style={{ marginTop: '5px' }}>
                     {title}{' '}
                     {(cartState.cart?.fulfillmentInfo?.type ===
                        'PREORDER_PICKUP' ||
                        cartState.cart?.fulfillmentInfo?.type ===
                        'PREORDER_DELIVERY') && (
                           <span>
                              {' '}
                              on{' '}
                              {moment(
                                 cartState.cart?.fulfillmentInfo?.slot?.from
                              ).format('DD MMM YYYY')}
                              {' ('}
                              {moment(
                                 cartState.cart?.fulfillmentInfo?.slot?.from
                              ).format('HH:mm')}
                              {'-'}
                              {moment(
                                 cartState.cart?.fulfillmentInfo?.slot?.to
                              ).format('HH:mm')}
                              {')'}
                           </span>
                        )}
                  </label>
                  <Button
                     onClick={() => {
                        setIsEdit(true)
                     }}
                     className="hern-cart__fulfillment-change-btn"
                     style={{
                        color: theme?.accent || 'rgba(5, 150, 105, 1)',
                        border: `1px solid ${theme?.accent || 'rgba(5, 150, 105, 1)'
                           }`,
                     }}
                  >
                     Change
                  </Button>
                  <div
                     className={classNames(
                        'hern-store-location-selector__each-store'
                     )}
                  >
                     <div className="hern-store-location-selector__store-location-info-container">
                        <div className="hern-store-location-selector__store-location-details">
                           <span className="hern-store-location__store-location-label">
                              {addressInfo.label}
                           </span>

                           <span className="hern-store-location__store-location-address hern-store-location__store-location-address-line1">
                              {addressInfo.line1}
                           </span>
                           <span className="hern-store-location__store-location-address hern-store-location__store-location-address-line2">
                              {addressInfo.line2}
                           </span>
                           <span className="hern-store-location__store-location-address hern-store-location__store-location-address-c-s-c-z">
                              {addressInfo.city} {addressInfo.state}{' '}
                              {addressInfo.country}
                              {' ('}
                              {addressInfo.zipcode}
                              {')'}
                           </span>
                        </div>
                     </div>
                     <div className="hern-store-location-selector__time-distance">
                        <div className="hern-store-location-selector__aerialDistance">
                           <span>
                              {addressInfo.aerialDistance.toFixed(2)}{' '}
                              {addressInfo.distanceUnit}
                           </span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </>
   )
}
