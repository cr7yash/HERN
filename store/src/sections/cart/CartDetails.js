import React, { useState, useEffect } from 'react'
import { CartContext, onDemandMenuContext, useUser } from '../../context'
import {
   Button,
   Divider,
   ProductCard,
   ModifierPopup,
   CounterButton,
   Loader,
} from '../../components'
import _, { isEmpty } from 'lodash'
import { combineCartItems, formatCurrency } from '../../utils'
import { DeleteIcon, EditIcon, EmptyCart, CloseIcon } from '../../assets/icons'
import { useLazyQuery, useQuery } from '@apollo/react-hooks'
import { PRODUCTS } from '../../graphql'
import Link from 'next/link'
import { useConfig } from '../../lib'

export const CartDetails = () => {
   //context
   const {
      cartState,
      methods,
      addToCart,
      combinedCartItems,
      isFinalCartLoading,
   } = React.useContext(CartContext)
   const { onDemandMenu } = React.useContext(onDemandMenuContext)
   const { brand, isConfigLoading, locationId } = useConfig()
   const { user } = useUser()

   //context data
   const { cart } = cartState
   const { isMenuLoading } = onDemandMenu

   //component state
   const [increaseProductId, setIncreaseProductId] = useState(null)
   const [increaseProduct, setIncreaseProduct] = useState(null)
   const [popUpType, setPopupType] = useState(null)
   const [cartDetailSelectedProduct, setCartDetailSelectedProduct] =
      useState(null)
   const [tip, setTip] = useState(null)

   const argsForByLocation = React.useMemo(
      () => ({
         params: {
            brandId: brand?.id,
            locationId: locationId,
         },
      }),
      [brand]
   )

   //fetch product detail which to be increase or edit
   useQuery(PRODUCTS, {
      skip: !increaseProductId,
      variables: {
         ids: increaseProductId,
         priceArgs: argsForByLocation,
         discountArgs: argsForByLocation,
         defaultCartItemArgs: argsForByLocation,
         productOptionPriceArgs: argsForByLocation,
         productOptionDiscountArgs: argsForByLocation,
         productOptionCartItemArgs: argsForByLocation,
         modifierCategoryOptionPriceArgs: argsForByLocation,
         modifierCategoryOptionDiscountArgs: argsForByLocation,
         modifierCategoryOptionCartItemArgs: argsForByLocation,
      },
      onCompleted: data => {
         if (data) {
            setIncreaseProduct(data.products[0])
         }
      },
   })

   //remove cartItem or cartItems
   const removeCartItems = cartItemIds => {
      console.log('removed id', cartItemIds)
      methods.cartItems.delete({
         variables: {
            where: {
               id: {
                  _in: cartItemIds,
               },
            },
         },
      })
   }

   //custom area for product card
   const customArea = props => {
      const { data } = props
      const { productId } = data

      return (
         <>
            <div className="hern-cart-product-custom-area">
               <div className="hern-cart-product-custom-area-quantity">
                  {/* <span>X{quantity}</span> */}

                  <CounterButton
                     count={data.ids.length}
                     incrementClick={() => {
                        if (data.childs.length === 0) {
                           addToCart({ productId: data.productId }, 1)
                           return
                        }
                        setCartDetailSelectedProduct(data)
                        setIncreaseProductId(productId)
                        setPopupType('newItem')
                     }}
                     decrementClick={() =>
                        removeCartItems([data.ids[data.ids.length - 1]])
                     }
                  />
                  {/* price */}
                  {data.childs[0].price !== 0 && (
                     <div>
                        {data.childs[0].discount > 0 && (
                           <span
                              style={{
                                 textDecoration: 'line-through',
                              }}
                           >
                              {formatCurrency(data.childs[0].price)}
                           </span>
                        )}

                        <span className="hern-cart-product-custom-area-price">
                           {formatCurrency(
                              data.childs[0].price - data.childs[0].discount
                           )}
                        </span>
                     </div>
                  )}
               </div>
               {/* <div className="hern-cart-product-custom-area-icons"> */}
               {/* </div> */}
            </div>
            <div style={{ position: 'relative', left: '5.5rem' }}>
               {data.childs.length > 0 && (
                  <EditIcon
                     size={12}
                     stroke={'#38a169'}
                     onClick={() => {
                        setCartDetailSelectedProduct(data)
                        setIncreaseProductId(productId)
                        setPopupType('edit')
                     }}
                     style={{ cursor: 'pointer', margin: '0rem 0.5rem' }}
                     title="Edit"
                  />
               )}
            </div>
         </>
      )
   }

   const closeModifier = () => {
      setIncreaseProduct(null)
      setCartDetailSelectedProduct(null)
      setIncreaseProductId(null)
   }

   const address = address => {
      if (!address) {
         return 'Address Not Available'
      }
   }

   if (isFinalCartLoading || isMenuLoading) {
      return (
         <div className="hern-cart-container">
            <div className="hern-cart-page">
               <div className="hern-cart-content">
                  <header>Cart</header>
                  <Loader />
               </div>
            </div>
         </div>
      )
   }

   if (
      cart == null ||
      isEmpty(cart) ||
      combinedCartItems?.length === 0 ||
      combinedCartItems === null
   ) {
      return (
         <div className="hern-cart-container">
            <div className="hern-cart-page" style={{ overflowY: 'hidden' }}>
               <div className="hern-cart-content">
                  <header>Cart</header>
                  <div className="hern-cart-empty-cart">
                     <EmptyCart />
                     <span>Oops! Your cart is empty </span>
                     <Button
                        className="hern-cart-go-to-menu-btn"
                        onClick={() => {}}
                     >
                        <Link href="/order">GO TO MENU</Link>
                     </Button>
                  </div>
               </div>
            </div>
         </div>
      )
   }

   return (
      <div className="hern-cart-container">
         <div className="hern-cart-page">
            <div className="hern-cart-content">
               <header>Cart</header>
               <section>
                  {/* address */}
                  <div className="hern-cart-delivery-info">
                     <span>YOUR ORDER(S)</span>
                     {/* <div className="hern-cart-delivery-details">
                        <span>Delivery Description</span>
                        <span>
                           {cart?.address ? address(cart?.address) : 'N/A'}
                        </span>
                     </div> */}
                  </div>
                  {/*products*/}
                  <div className="hern-cart-products-product-list">
                     {combinedCartItems.map((product, index) => {
                        return (
                           <div key={index}>
                              <ProductCard
                                 data={product}
                                 showImage={false}
                                 showProductAdditionalText={false}
                                 customAreaComponent={customArea}
                                 showModifier={Boolean(increaseProduct)}
                                 closeModifier={closeModifier}
                                 modifierPopupConfig={{
                                    productData: increaseProduct,
                                    showCounterBtn: Boolean(
                                       popUpType === 'edit'
                                    ),
                                    forNewItem: Boolean(
                                       popUpType === 'newItem'
                                    ),
                                    edit: Boolean(popUpType === 'edit'),
                                    productCartDetail:
                                       cartDetailSelectedProduct,
                                 }}
                                 useForThirdParty={true}
                              />
                           </div>
                        )
                     })}
                  </div>
                  <Divider />
                  {/* bill details */}
                  <div className="hern-cart-bill-details">
                     <span>BILL DETAILS</span>
                     <ul className="hern-cart-bill-details-list">
                        <li>
                           <span>{cart.billing.itemTotal.label}</span>
                           <span>
                              {formatCurrency(
                                 cart.billing.itemTotal.value || 0
                              )}
                           </span>
                        </li>
                        <li>
                           <span>{cart.billing.deliveryPrice.label}</span>
                           <span>
                              {formatCurrency(
                                 cart.billing.deliveryPrice.value || 0
                              )}
                           </span>
                        </li>
                        <li>
                           <span>{cart.billing.tax.label}</span>
                           <span>
                              {formatCurrency(cart.billing.tax.value || 0)}
                           </span>
                        </li>
                        <li>
                           <span>{cart.billing.discount.label}</span>
                           <span>
                              -{' '}
                              {formatCurrency(cart.billing.discount.value || 0)}
                           </span>
                        </li>
                        {user?.keycloakId && (
                           <li>
                              <span>
                                 {cart.billing.loyaltyPointsUsed.label}
                              </span>
                              <span>
                                 {cart.billing.loyaltyPointsUsed.value}
                              </span>
                           </li>
                        )}
                        {user?.keycloakId && (
                           <li>
                              <span>{cart.billing.walletAmountUsed.label}</span>
                              <span>{cart.billing.walletAmountUsed.value}</span>
                           </li>
                        )}
                        {tip && tip !== 0 && (
                           <li>
                              <span>Tip</span>
                              <span>{formatCurrency(tip)}</span>
                           </li>
                        )}
                        <li className="hern-cart-bill-details-list-total-price">
                           <span>{cart.billing.totalPrice.label}</span>
                           <span>
                              {formatCurrency(
                                 cart.billing.totalPrice.value || 0
                              )}
                           </span>
                        </li>
                     </ul>
                  </div>
                  {/* tip */}
                  {/* <Tips
                     setTip={setTip}
                     totalPrice={cart.billing.totalPrice.value}
                  /> */}
                  {/*
                  total
                  */}
               </section>
            </div>
            {/* bottom bar to proceed */}
            {/* <footer className="hern-cart-footer">
               <Button className="hern-cart-proceed-btn">PROCEED TO PAY</Button>
            </footer> */}
         </div>
      </div>
   )
}

const ModifiersList = props => {
   const { data } = props
   console.log('this is modifier data', data)
   return (
      <div className="hern-cart-product-modifiers">
         <span className="hern-cart-product-modifiers-heading">
            Product Option:
         </span>
         <div className="hern-cart-product-modifiers-product-option">
            <span>{data.childs[0].productOption.label || 'N/A'}</span>{' '}
            {data.childs[0].price !== 0 && (
               <div>
                  {data.childs[0].discount > 0 && (
                     <span
                        style={{
                           textDecoration: 'line-through',
                        }}
                     >
                        {formatCurrency(data.childs[0].price)}
                     </span>
                  )}
                  <span style={{ marginLeft: '6px' }}>
                     {formatCurrency(
                        data.childs[0].price - data.childs[0].discount
                     )}
                  </span>
               </div>
            )}
         </div>
         <div className="hern-cart-product-modifiers-list">
            {data.childs[0].childs.some(each => each.modifierOption) && (
               <span className="hern-cart-product-modifiers-heading">
                  Add ons:
               </span>
            )}
            <ul>
               {data.childs.length > 0 &&
                  data.childs[0].childs.map((modifier, index) =>
                     modifier.modifierOption ? (
                        <li key={index}>
                           <span>{modifier.modifierOption.name}</span>

                           {modifier.price !== 0 && (
                              <div>
                                 {modifier.discount > 0 && (
                                    <span
                                       style={{
                                          textDecoration: 'line-through',
                                       }}
                                    >
                                       {formatCurrency(modifier.price)}
                                    </span>
                                 )}
                                 <span style={{ marginLeft: '6px' }}>
                                    {formatCurrency(
                                       modifier.price - modifier.discount
                                    )}
                                 </span>
                              </div>
                           )}
                        </li>
                     ) : null
                  )}
            </ul>
         </div>
      </div>
   )
}

const Tips = props => {
   //props
   const { totalPrice, setTip } = props

   //component state
   const [customPanel, setCustomPanel] = useState(false)
   const [tipAmount, setTipAmount] = useState(0)
   const [activeOption, setActiveOption] = useState(null)

   const classesForTipOption = option => {
      if (option === activeOption) {
         return 'hern-cart__tip-tip-option hern-cart__tip-tip-option--active'
      }
      return 'hern-cart__tip-tip-option'
   }

   const predefinedTip = option => {
      if (activeOption !== option) {
         setActiveOption(option)
         setTip((totalPrice * option) / 100)
      } else {
         setActiveOption(null)
         setTip(null)
      }
   }
   return (
      <div className="hern-cart__tip">
         <div className="hern-cart__tip-heading">
            <span>Add a Tip</span>
         </div>
         {!customPanel && (
            <div className="hern-cart__tip-tip-options-list">
               <ul>
                  {/* <li>0% {formatCurrency(0)}</li> */}
                  <li
                     className={classesForTipOption(5)}
                     onClick={() => {
                        predefinedTip(5)
                     }}
                  >
                     <span>5%</span>{' '}
                     <span>{formatCurrency(totalPrice * 0.05)}</span>
                  </li>
                  <li
                     className={classesForTipOption(10)}
                     onClick={() => {
                        predefinedTip(10)
                     }}
                  >
                     <span>10%</span>{' '}
                     <span>{formatCurrency(totalPrice * 0.1)}</span>
                  </li>
                  <li
                     className={classesForTipOption(15)}
                     onClick={() => {
                        predefinedTip(15)
                     }}
                  >
                     <span>15%</span>{' '}
                     <span> {formatCurrency(totalPrice * 0.15)}</span>
                  </li>
               </ul>

               <button
                  className="hern-cart__tip-add-custom-btn"
                  onClick={() => {
                     setCustomPanel(prevState => !prevState)
                  }}
               >
                  Custom
               </button>
            </div>
         )}
         {customPanel && (
            <div className="hern-cart__tip-custom-tip">
               <div className="hern-cart__tip-input-field">
                  <span>
                     {formatCurrency(0)
                        .replace(/\d/g, '')
                        .replace(/\./g, '')
                        .trim()}
                  </span>
                  <input
                     // type="number"
                     type="text"
                     pattern="[0-9]*"
                     placeholder="Enter amount..."
                     value={tipAmount}
                     onChange={e => {
                        setTipAmount(e.target.value)
                     }}
                  />
               </div>
               <button
                  className="hern-cart__tip-add-tip-btn"
                  onClick={() => {
                     setTip(parseFloat(tipAmount))
                     setCustomPanel(prevState => !prevState)
                  }}
               >
                  ADD
               </button>
               <CloseIcon
                  title="Close"
                  size={18}
                  stroke={'#404040CC'}
                  style={{ marginLeft: '10px', cursor: 'pointer' }}
                  onClick={() => {
                     setCustomPanel(prevState => !prevState)
                  }}
               />
            </div>
         )}
      </div>
   )
}
