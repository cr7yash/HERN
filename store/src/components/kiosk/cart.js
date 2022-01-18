import {
   Button,
   Col,
   Layout,
   Modal,
   Row,
   Menu,
   Dropdown,
   Space,
   Spin,
} from 'antd'
import React, { useEffect, useState } from 'react'
import isEmpty from 'lodash/isEmpty'

import {
   ArrowLeftIcon,
   ArrowLeftIconBG,
   ArrowRightIcon,
   DeleteIcon,
   DownVector,
   EditIcon,
   EmptyCart,
   PaymentModeIcon,
   UpVector,
} from '../../assets/icons'
import { useTranslation, CartContext } from '../../context'
import { KioskCounterButton } from './component'
import { formatCurrency } from '../../utils'
import { PRODUCTS, GET_MODIFIER_BY_ID } from '../../graphql'
import { useConfig } from '../../lib'
import { KioskModifier } from './component'
import { useLazyQuery, useQuery } from '@apollo/react-hooks'
import KioskButton from './component/button'
import { ProgressBar } from './component/progressBar'
import { Coupon } from '../coupon'
import PayButton from '../PayButton'

const { Header, Content, Footer } = Layout

export const KioskCart = props => {
   //context
   const { cartState, methods, addToCart, isFinalCartLoading } =
      React.useContext(CartContext)
   const { cart } = cartState
   const { config, combinedCartItems, setCurrentPage } = props
   const { t, direction } = useTranslation()

   //remove cartItem or cartItems
   const removeCartItems = cartItemIds => {
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

   if (combinedCartItems === null) {
      return <p>{t('No cart available')}</p>
   }
   if (isFinalCartLoading) {
      return (
         <div
            style={{
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               height: '100%',
            }}
         >
            <Spin size="large" tip="Loading Cart..." />
         </div>
      )
   }

   return (
      <Layout style={{ height: '100%', overflowY: 'hidden' }}>
         <div
            style={{
               background: `${config.kioskSettings.theme.primaryColorLight.value}`,
               padding: '1em 2em',
               height: '6em',
            }}
         >
            <ProgressBar config={config} setCurrentPage={setCurrentPage} />
         </div>
         {/* <Header className="hern-kiosk__cart-section-header">
            <Row className="hern-kiosk__cart-section-header-row">
               <Col span={4}>
                  <ArrowLeftIconBG
                     bgColor={config.kioskSettings.theme.primaryColor.value}
                     onClick={() => {
                        setCurrentPage('menuPage')
                     }}
                  />
               </Col>
               <Col
                  span={16}
                  className="hern-kiosk__cart-section-checkout-text"
               >
                  <span>{t('CHECKOUT')}</span>
               </Col>
               <Col
                  span={4}
                  className="hern-kiosk__cart-section-see-more-text"
                  style={{
                     color: config.kioskSettings.theme.primaryColor.value,
                  }}
               >
                  <span
                     onClick={() => {
                        setCurrentPage('menuPage')
                     }}
                  >
                     {t('SEE MENU')}
                  </span>
               </Col>
            </Row>
         </Header> */}

         {(cartState.cart == null || combinedCartItems.length === 0) && (
            <div className="hern-cart-empty-cart">
               <EmptyCart width={558} height={480} />
               <span>{t('Oops! Your cart is empty')} </span>
               <span
                  onClick={() => {
                     setCurrentPage('menuPage')
                  }}
                  style={{
                     color: `${config.kioskSettings.theme.primaryColor.value}`,
                  }}
               >
                  {t('GO TO MENU')}
               </span>
            </div>
         )}
         {cartState.cart && combinedCartItems.length > 0 && (
            <>
               <Content style={{ backgroundColor: '#ffffff' }}>
                  <div className="hern-kiosk__cart-cards-container">
                     <div className="hern-kiosk__cart-cards-container-header">
                        <span>{t('REVIEW ORDER')}</span>
                        <span
                           style={{
                              color: `${config.kioskSettings.theme.primaryColor.value}`,
                              cursor: 'pointer',
                           }}
                           onClick={() => {
                              const cartItemsIds = combinedCartItems
                                 .map(each => each.ids)
                                 .flat()
                              removeCartItems(cartItemsIds)
                           }}
                        >
                           {t('CLEAR CART')}
                        </span>
                     </div>
                     <div className="hern-kiosk__cart-cards">
                        {combinedCartItems.map((product, index) => {
                           return (
                              <CartCard
                                 config={config}
                                 productData={product}
                                 removeCartItems={removeCartItems}
                              />
                           )
                        })}
                     </div>
                  </div>
               </Content>
               <Footer className="hern-kiosk__cart-page-footer">
                  <Layout>
                     <Header className="hern-kiosk__cart-page-offer">
                        <Offers config={config} />
                     </Header>
                     <Content className="hern-kiosk__cart-page-price-detail">
                        <div className="hern-kiosk-cart-bill-details">
                           <span>{t('BILL DETAILS')}</span>
                           <ul className="hern-kiosk-cart-bill-details-list">
                              <li>
                                 <span style={{ fontWeight: 'bold' }}>
                                    {t('Total Price')}
                                 </span>
                                 <span style={{ fontWeight: 'bold' }}>
                                    {formatCurrency(
                                       cart?.billing?.totalPrice?.value || 0
                                    )}
                                 </span>
                              </li>
                              <li>
                                 <span>{t('Tax')}</span>
                                 <span>
                                    {formatCurrency(
                                       cart?.billing?.tax?.value || 0
                                    )}
                                 </span>
                              </li>
                              <li>
                                 <span>{t('Discount')}</span>
                                 <span>
                                    {'-'}{' '}
                                    {formatCurrency(
                                       cart?.billing?.discount?.value || 0
                                    )}
                                 </span>
                              </li>
                           </ul>
                        </div>
                     </Content>
                     <Footer className="hern-kiosk__cart-page-proceed-to-checkout">
                        {/* <CartPageFooter cart={cart} methods={methods} /> */}
                        <PayButton
                           cartId={cart?.id}
                           className="hern-kiosk__kiosk-button hern-kiosk__cart-place-order-btn"
                        >
                           {/* <KioskButton customClass="hern-kiosk__cart-place-order-btn"> */}
                           <span className="hern-kiosk__cart-place-order-btn-total">
                              {formatCurrency(
                                 cart?.billing?.totalPrice?.value || 0
                              )}
                           </span>
                           <span className="hern-kiosk__cart-place-order-btn-text">
                              {t('Place Order')}
                           </span>
                           {direction === 'ltr' ? (
                              <ArrowRightIcon
                                 stroke={
                                    config.kioskSettings.theme.primaryColor
                                       .value
                                 }
                              />
                           ) : (
                              <ArrowLeftIcon
                                 stroke={
                                    config.kioskSettings.theme.primaryColor
                                       .value
                                 }
                              />
                           )}

                           {/* </KioskButton> */}
                        </PayButton>
                     </Footer>
                  </Layout>
               </Footer>
            </>
         )}
      </Layout>
   )
}

const CartCard = props => {
   const { config, productData, removeCartItems } = props
   const { brand, kioskDetails, isConfigLoading } = useConfig()
   const { addToCart } = React.useContext(CartContext)
   const { t, dynamicTrans, locale } = useTranslation()

   const [modifyProductId, setModifyProductId] = useState(null)
   const [modifyProduct, setModifyProduct] = useState(null)
   const [modifierType, setModifierType] = useState(null)
   const [cartDetailSelectedProduct, setCartDetailSelectedProduct] =
      useState(null)
   const [showAdditionalDetailsOnCard, setShowAdditionalDetailsOnCard] =
      useState(false) // show modifier and product options details
   const [showChooseIncreaseType, setShowChooseIncreaseType] = useState(false) // show I'll choose or repeat last one popup
   const [showModifier, setShowModifier] = useState(false) // show modifier popup
   const [forRepeatLastOne, setForRepeatLastOne] = useState(false) // to run repeatLastOne fn in PRODUCTS query

   let totalPrice = 0
   let totalDiscount = 0
   const price = product => {
      if (!isEmpty(product)) {
         totalPrice += product.price
         totalDiscount += product.discount
         if (!isEmpty(product.childs)) {
            product.childs.forEach(product => {
               price(product)
            })
         }
         return { totalPrice, totalDiscount }
      }
   }
   const getTotalPrice = React.useMemo(() => price(productData), [productData])
   const argsForByLocation = React.useMemo(
      () => ({
         params: {
            brandId: brand?.id,
            locationId: kioskDetails?.locationId,
         },
      }),
      [brand]
   )

   //fetch product detail which to be increase or edit
   const { data: repeatLastOneData } = useQuery(PRODUCTS, {
      skip: !modifyProductId,
      variables: {
         ids: modifyProductId,
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
         // use for repeat last one order
         if (forRepeatLastOne) {
            if (data) {
               repeatLastOne(data.products[0])
               return
            }
         }
         if (data) {
            setModifyProduct(data.products[0])
         }
      },
   })
   const additionalModifiersIds = React.useMemo(() => {
      if (repeatLastOneData) {
         return repeatLastOneData?.products[0]?.productOptions
            ?.find(
               x =>
                  x.id === cartDetailSelectedProduct.childs[0].productOption.id
            )
            .modifier.categories.reduce(
               (acc, obj) => [...acc, ...obj.options],
               []
            )
            .map(x => x.additionalModifierTemplateId)
            .filter(x => x !== null)
      } else {
         return null
      }
   }, [repeatLastOneData])

   const { data: nestedModifierData } = useQuery(GET_MODIFIER_BY_ID, {
      variables: {
         priceArgs: argsForByLocation,
         discountArgs: argsForByLocation,
         modifierCategoryOptionCartItemArgs: argsForByLocation,
         id: additionalModifiersIds,
      },
      skip: isConfigLoading || !brand?.id || !additionalModifiersIds,
   })

   const repeatLastOne = productData => {
      const productOptionId =
         cartDetailSelectedProduct.childs[0].productOption.id
      const modifierCategoryOptionsIds =
         cartDetailSelectedProduct.childs[0].childs.map(
            x => x?.modifierOption?.id
         )

      const nestedModifierOptionsIds =
         cartDetailSelectedProduct.childs[0].childs
            .reduce((acc, obj) => [...acc, ...obj.childs], [])
            .map(x => x.modifierOption?.id)

      //selected product option
      const selectedProductOption = productData.productOptions?.find(
         x => x.id == productOptionId
      )

      //selected modifiers
      let singleModifier = []
      let multipleModifier = []
      if (selectedProductOption.modifier) {
         selectedProductOption.modifier.categories.forEach(category => {
            category.options.forEach(option => {
               const selectedOption = {
                  modifierCategoryID: category.id,
                  modifierCategoryOptionsID: option.id,
                  modifierCategoryOptionsPrice: option.price,
                  cartItem: option.cartItem,
               }
               if (category.type === 'single') {
                  if (modifierCategoryOptionsIds.includes(option.id)) {
                     singleModifier = singleModifier.concat(selectedOption)
                  }
               }
               if (category.type === 'multiple') {
                  if (modifierCategoryOptionsIds.includes(option.id)) {
                     multipleModifier = multipleModifier.concat(selectedOption)
                  }
               }
            })
         })
      }
      const singleNestedModifier = []
      const multiNestedModifier = []
      if (false) {
         nestedModifierData.modifiers.forEach(eachModifierTemplate => {
            eachModifierTemplate.categories.forEach(category => {
               category.options.forEach(option => {
                  const selectedOption = {
                     modifierCategoryID: category.id,
                     modifierCategoryOptionsID: option.id,
                     modifierCategoryOptionsPrice: option.price,
                     cartItem: option.cartItem,
                  }
                  if (category.type === 'single') {
                     if (modifierCategoryOptionsIds.includes(option.id)) {
                        singleNestedModifier =
                           singleNestedModifier.concat(selectedOption)
                     }
                  }
                  if (category.type === 'multiple') {
                     if (modifierCategoryOptionsIds.includes(option.id)) {
                        multiNestedModifier =
                           multiNestedModifier.concat(selectedOption)
                     }
                  }
               })
            })
         })
      }
      const allSelectedOptions = [...singleModifier, ...multipleModifier]
      const allNestedSelectedOptions = [
         ...singleNestedModifier,
         ...multiNestedModifier,
      ]
      const cartItem = getCartItemWithModifiers(
         selectedProductOption.cartItem,
         allSelectedOptions.map(x => x.cartItem)
      )

      addToCart(cartItem, 1)
      setForRepeatLastOne(false)
      setModifyProduct(null)
      setModifyProductId(null)
      setCartDetailSelectedProduct(null)
      setShowChooseIncreaseType(false)
   }

   const onCloseModifier = () => {
      setModifyProduct(null)
      setModifyProductId(null)
      setShowModifier(false)
   }

   useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [locale, showAdditionalDetailsOnCard])
   return (
      <div className="hern-kiosk__cart-card">
         <img
            src={productData.image}
            alt="p-image"
            className="hern-kiosk__cart-card-p-image"
         />
         <div className="hern-kiosk__cart-card-p-mid">
            <div className="hern-kiosk__cart-card-p-details">
               <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span
                     className="hern-kiosk__cart-card-p-name"
                     style={{ color: '#5A5A5A' }}
                     data-translation="true"
                     data-original-value={productData.name}
                  >
                     {productData.name}
                  </span>{' '}
                  {productData.childs.length > 0 && (
                     <>
                        {showAdditionalDetailsOnCard ? (
                           <UpVector
                              style={{ marginLeft: '1em' }}
                              onClick={() => {
                                 setShowAdditionalDetailsOnCard(
                                    !showAdditionalDetailsOnCard
                                 )
                              }}
                           />
                        ) : (
                           <DownVector
                              style={{ marginLeft: '1em' }}
                              onClick={() => {
                                 setShowAdditionalDetailsOnCard(
                                    !showAdditionalDetailsOnCard
                                 )
                              }}
                           />
                        )}
                     </>
                  )}
               </div>
               {showAdditionalDetailsOnCard && (
                  <div className="hern-kiosk-cart-product-modifiers">
                     {/* <span className="hern-kiosk-cart-product-modifiers-heading">
                        Product Option:
                     </span> */}
                     <div className="hern-kiosk-cart-product-modifiers-product-option">
                        <span
                           data-translation="true"
                           data-original-value={
                              productData.childs[0].productOption.label || 'N/A'
                           }
                        >
                           {productData.childs[0].productOption.label || 'N/A'}
                        </span>{' '}
                        {productData.childs[0].price !== 0 && (
                           <div
                              style={{
                                 fontSize: '1.5em',
                                 marginTop: '10px',
                              }}
                           >
                              {
                                 <>
                                    {productData.childs[0].discount > 0 && (
                                       <span
                                          style={{
                                             textDecoration: 'line-through',
                                          }}
                                       >
                                          {formatCurrency(
                                             productData.childs[0].price
                                          )}
                                       </span>
                                    )}
                                    <span style={{ marginLeft: '6px' }}>
                                       {formatCurrency(
                                          productData.childs[0].price -
                                             productData.childs[0].discount
                                       )}
                                    </span>
                                 </>
                              }
                           </div>
                        )}
                     </div>
                     <div className="hern-kiosk-cart-product-modifiers-list">
                        {productData.childs[0].childs.some(
                           each => each.modifierOption
                        ) && (
                           <>
                              <ul>
                                 {productData.childs.length > 0 &&
                                    productData.childs[0].childs.map(
                                       (modifier, index) =>
                                          modifier.modifierOption ? (
                                             <li
                                                key={index}
                                                className="hern-kiosk__parent-modifier-list"
                                             >
                                                <div className="hern-kiosk__modifier-details">
                                                   <span
                                                      data-translation="true"
                                                      data-original-value={
                                                         modifier.modifierOption
                                                            .name
                                                      }
                                                   >
                                                      {
                                                         modifier.modifierOption
                                                            .name
                                                      }
                                                   </span>

                                                   {modifier.price !== 0 && (
                                                      <div>
                                                         {
                                                            <>
                                                               {modifier.discount >
                                                                  0 && (
                                                                  <span
                                                                     style={{
                                                                        textDecoration:
                                                                           'line-through',
                                                                     }}
                                                                  >
                                                                     {formatCurrency(
                                                                        modifier.price
                                                                     )}
                                                                  </span>
                                                               )}
                                                               <span
                                                                  style={{
                                                                     marginLeft:
                                                                        '6px',
                                                                  }}
                                                               >
                                                                  {formatCurrency(
                                                                     modifier.price -
                                                                        modifier.discount
                                                                  )}
                                                               </span>
                                                            </>
                                                         }
                                                      </div>
                                                   )}
                                                </div>
                                                {modifier.childs.length > 0 && (
                                                   <ul>
                                                      {modifier.childs.map(
                                                         (
                                                            eachNestedModifier,
                                                            index
                                                         ) => {
                                                            return (
                                                               <li key={index}>
                                                                  <span
                                                                     data-translation="true"
                                                                     data-original-value={
                                                                        eachNestedModifier
                                                                           .modifierOption
                                                                           .name
                                                                     }
                                                                  >
                                                                     {
                                                                        eachNestedModifier
                                                                           .modifierOption
                                                                           .name
                                                                     }
                                                                  </span>
                                                                  {eachNestedModifier.price !==
                                                                     0 && (
                                                                     <div>
                                                                        {
                                                                           <>
                                                                              {eachNestedModifier.discount >
                                                                                 0 && (
                                                                                 <span
                                                                                    style={{
                                                                                       textDecoration:
                                                                                          'line-through',
                                                                                    }}
                                                                                 >
                                                                                    {formatCurrency(
                                                                                       eachNestedModifier.price
                                                                                    )}
                                                                                 </span>
                                                                              )}
                                                                              <span
                                                                                 style={{
                                                                                    marginLeft:
                                                                                       '6px',
                                                                                 }}
                                                                              >
                                                                                 {formatCurrency(
                                                                                    eachNestedModifier.price -
                                                                                       eachNestedModifier.discount
                                                                                 )}
                                                                              </span>
                                                                           </>
                                                                        }
                                                                     </div>
                                                                  )}
                                                               </li>
                                                            )
                                                         }
                                                      )}
                                                   </ul>
                                                )}
                                             </li>
                                          ) : null
                                    )}
                              </ul>
                           </>
                        )}
                     </div>
                  </div>
               )}
            </div>
            <KioskCounterButton
               config={config}
               quantity={productData.ids.length}
               onMinusClick={() => {
                  removeCartItems([productData.ids[productData.ids.length - 1]])
               }}
               onPlusClick={() => {
                  setShowChooseIncreaseType(true)
               }}
               style={{
                  border: '1px solid #0F6BB1',
                  width: '20em',
                  justifyContent: 'space-around',
               }}
            />
         </div>
         <Modal
            title={t('Repeat last used customization')}
            visible={showChooseIncreaseType}
            centered={true}
            onCancel={() => {
               setShowChooseIncreaseType(false)
            }}
            closable={false}
            footer={null}
         >
            <div
               style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
               }}
            >
               <KioskButton
                  onClick={() => {
                     setModifierType('newItem')
                     setCartDetailSelectedProduct(productData)
                     setModifyProductId(productData.productId)
                     setShowChooseIncreaseType(false)
                     setShowModifier(true)
                  }}
                  style={{
                     border: `2px solid ${config.kioskSettings.theme.secondaryColor.value}`,
                     background: 'transparent',
                     padding: '.1em 2em',
                  }}
               >
                  {t(`I'LL CHOOSE`)}
               </KioskButton>
               <KioskButton
                  style={{ padding: '.1em 2em' }}
                  onClick={() => {
                     setCartDetailSelectedProduct(productData)
                     setModifyProductId(productData.productId)
                     setForRepeatLastOne(true)
                  }}
               >
                  {t('REPEAT LAST ONE')}
               </KioskButton>
            </div>
         </Modal>
         <div className="hern-kiosk__cart-card-actions">
            <div className="hern-kiosk__cart-card-action-buttons">
               {productData.childs.length > 0 && (
                  <EditIcon
                     stroke={config.kioskSettings.theme.primaryColor.value}
                     style={{ cursor: 'pointer', margin: '0 .5em' }}
                     title="Edit"
                     size={50}
                     onClick={() => {
                        setModifierType('edit')
                        setCartDetailSelectedProduct(productData)
                        setModifyProductId(productData.productId)
                        setShowModifier(true)
                     }}
                  />
               )}
               <DeleteIcon
                  stroke={config.kioskSettings.theme.primaryColor.value}
                  style={{ cursor: 'pointer', margin: '0 0 0 .5em' }}
                  title="Delete"
                  size={50}
                  onClick={() => {
                     removeCartItems(productData.ids)
                  }}
               />
            </div>
            <div
               className="hern-kiosk__cart-cards-price"
               style={{ color: '#5A5A5A' }}
            >
               {getTotalPrice.totalDiscount > 0 && (
                  <>
                     <span style={{ textDecoration: 'line-through' }}>
                        {' '}
                        {formatCurrency(getTotalPrice.totalPrice)}
                     </span>
                     <br />
                  </>
               )}
               <span>
                  {getTotalPrice.totalPrice !== 0
                     ? formatCurrency(
                          getTotalPrice.totalPrice - getTotalPrice.totalDiscount
                       )
                     : null}
               </span>
            </div>
         </div>
         {modifyProduct && showModifier && (
            <KioskModifier
               config={config}
               onCloseModifier={onCloseModifier}
               productData={modifyProduct}
               forNewItem={Boolean(modifierType === 'newItem')}
               edit={Boolean(modifierType === 'edit')}
               productCartDetail={cartDetailSelectedProduct}
            />
         )}
      </div>
   )
}

// const CartPageFooter = props => {
//    const { cart, methods } = props
//    const { t } = useTranslation()
//    const [selectedMethod, setSelectedMethod] = useState(
//       cart.paymentMethods?.find(
//          x => x.id === cart.toUseAvailablePaymentOptionId
//       )
//    )
//    useEffect(() => {
//       setSelectedMethod(
//          cart.paymentMethods?.find(
//             x => x.id === cart.toUseAvailablePaymentOptionId
//          )
//       )
//    }, [cart])
//    // const paymentMethods = (
//    //    <Menu
//    //       onClick={item => {
//    //          const option = cart.paymentMethods?.find(x => x.id === +item.key)
//    //          // setSelectedMethod(option)
//    //          methods.cart.update({
//    //             variables: {
//    //                id: cart.id,
//    //                _set: {
//    //                   toUseAvailablePaymentOptionId: option.id,
//    //                },
//    //             },
//    //          })
//    //       }}
//    //    >
//    //       {cart.paymentMethods.map((eachMethod, index) => (
//    //          <Menu.Item key={eachMethod.id}>
//    //             <span>{eachMethod.label}</span>
//    //          </Menu.Item>
//    //       ))}
//    //    </Menu>
//    // )
//    return (
//       <div className="hern-kiosk__cart-page-footer-footer">
//          <Dropdown
//             overlay={paymentMethods}
//             trigger={['click']}
//             placement="topCenter"
//          >
//             <div>
//                <div style={{ display: 'flex', alignItems: 'center' }}>
//                   <PaymentModeIcon />
//                   <span
//                      style={{
//                         margin: '0 .5em',
//                         fontSize: '1.4em',
//                         fontWeight: '500',
//                      }}
//                   >
//                      {t('Payment Method')}
//                   </span>
//                   <UpVector size={20} />
//                </div>
//                <span className="hern-kiosk__cart-payment-method-label">
//                   {selectedMethod?.label || 'Please choose payment method'}
//                </span>
//             </div>
//          </Dropdown>
//       </div>
//    )
// }

const Offers = props => {
   const { config } = props
   const { cartState } = React.useContext(CartContext)

   return (
      <div className="hern-kiosk__cart-offers-container">
         <Coupon cart={cartState.cart} config={config} />
      </div>
   )
}
const getCartItemWithModifiers = (
   cartItemInput,
   selectedModifiersInput,
   nestedModifiersInput
) => {
   const finalCartItem = { ...cartItemInput }

   const combinedModifiers = selectedModifiersInput.reduce(
      (acc, obj) => [...acc, ...obj.data],
      []
   )
   const dataArr = finalCartItem?.childs?.data[0]?.childs?.data
   const dataArrLength = dataArr.length

   finalCartItem.childs.data[0].childs.data = [...dataArr, ...combinedModifiers]
   if (nestedModifiersInput) {
      const nestedCombinedModifiers = nestedModifiersInput.reduce(
         (acc, obj) => [...acc, ...obj.data],
         []
      )
      finalCartItem.childs.data[0].childs.data[0].childs = {}
      finalCartItem.childs.data[0].childs.data[0].childs['data'] =
         nestedCombinedModifiers
   }

   return finalCartItem
}
