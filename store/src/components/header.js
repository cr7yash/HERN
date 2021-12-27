import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { signOut } from 'next-auth/client'
import { getProtectedRoutes, LoginWrapper } from '../utils'

import { useUser, useTranslation, CartContext } from '../context'
import {
   isClient,
   getInitials,
   getRoute,
   LocationSelectorWrapper,
   useQueryParams,
   useQueryParamState,
} from '../utils'
import MenuIcon from '../assets/icons/Menu'

import { ProfileSidebar } from './profile_sidebar'
import { CrossIcon, CartIcon, LocationMarker } from '../assets/icons'

import NavigationBar from './navbar'
import { useWindowSize } from '../utils/useWindowSize'
import { LanguageSwitch, TemplateFile } from '.'
import classNames from 'classnames'

const ReactPixel = isClient ? require('react-facebook-pixel').default : null

export const Header = ({ settings, navigationMenus }) => {
   const router = useRouter()
   const { width } = useWindowSize()
   const { isAuthenticated, user, isLoading } = useUser()
   const { t } = useTranslation()
   const logout = async () => {
      const currentPathName = router.pathname
      const isRouteProtected = Boolean(
         getProtectedRoutes(true).find(x => x === currentPathName)
      )
      await signOut({
         redirect: false,
      })

      if (isRouteProtected) {
         // router.push(signOutData.url)
         window.location.href = window.location.origin + getRoute('/')
      }
   }
   const params = useQueryParams()
   const [loginPopup, setLoginPopup, deleteLoginPopUp] =
      useQueryParamState('showLogin')

   const brand = settings['brand']['theme-brand']
   const theme = settings['Visual']['theme-color']
   const headerNavigationSettings =
      settings['navigation']?.['header-navigation']
   const isSubscriptionStore =
      settings?.availability?.isSubscriptionAvailable?.Subscription
         ?.isSubscriptionAvailable?.value
   const logo = settings?.brand?.['Brand Logo']?.brandLogo?.value
      ? settings?.brand?.['Brand Logo']?.brandLogo?.value
      : settings?.brand?.['Brand Logo']?.brandLogo?.default

   const showLogo =
      settings?.brand?.['Brand Logo']?.BrandLogo?.value ??
      settings?.brand?.['Brand Logo']?.BrandLogo?.default ??
      true

   const displayName = settings?.brand?.['Brand Logo']?.brandName?.value
      ? settings?.brand?.['Brand Logo']?.brandName?.value
      : settings?.brand?.['Brand Logo']?.brandName?.value
   const showBrandName =
      settings?.brand?.['Brand Logo']?.BrandName?.value ??
      settings?.brand?.['Brand Logo']?.BrandName?.default ??
      true

   const showLocationButton =
      settings?.['navigation']?.['Show Location Selector']?.[
         'Location-Selector'
      ]?.['Location-Selector'].value ?? true
   const showLanguageSwitcher =
      settings?.['navigation']?.['language-translation']?.[
         'LanguageTranslation'
      ]?.['showLanguageTranslation'].value ?? true

   console.log(
      'navigation',
      settings?.['navigation']?.['language-translation']?.[
         'LanguageTranslation'
      ]?.['showLanguageTranslation'].value,
      showLanguageSwitcher
   )
   const [toggle, setToggle] = React.useState(true)
   const [isMobileNavVisible, setIsMobileNavVisible] = React.useState(false)
   const [showLoginPopup, setShowLoginPopup] = React.useState(false)
   const [showLocationSelectorPopup, setShowLocationSelectionPopup] =
      React.useState(false)

   const newNavigationMenus = DataWithChildNodes(navigationMenus)

   const { cartState } = React.useContext(CartContext)
   const numberOfItemsOnCart =
      cartState?.cart?.cartItems_aggregate?.aggregate?.count

   // FB pixel event tracking for page view
   React.useEffect(() => {
      ReactPixel.pageView()
   }, [])
   return (
      <>
         {console.log(settings, isSubscriptionStore)}
         {headerNavigationSettings?.headerNavigation?.custom?.value ? (
            <TemplateFile
               path={headerNavigationSettings?.headerNavigation?.path?.value}
               data={{}}
            />
         ) : (
            <header
               className={classNames('hern-header', {
                  'hern-header--grid-3-col': !showLocationButton,
               })}
            >
               <Link
                  href={getRoute('/')}
                  title={displayName || 'Subscription Shop'}
               >
                  <div className="hern-header__brand">
                     {logo && showLogo && (
                        <img
                           src={logo}
                           alt={displayName || 'Subscription Shop'}
                        />
                     )}
                     {displayName && showBrandName && (
                        <span>{displayName}</span>
                     )}
                  </div>
               </Link>
               {showLocationButton && (
                  <button
                     style={{ display: 'flex', alignItems: 'center' }}
                     onClick={() => setShowLocationSelectionPopup(true)}
                  >
                     <LocationMarker /> {t('Location')}
                  </button>
               )}
               <section className="hern-navigatin-menu__wrapper">
                  <NavigationBar Data={newNavigationMenus}>
                     {showLanguageSwitcher && (
                        <li className="hern-navbar__list__item">
                           <LanguageSwitch />
                        </li>
                     )}
                     {isLoading ? (
                        <li className="hern-navbar__list__item__skeleton" />
                     ) : isAuthenticated &&
                       user?.isSubscriber &&
                       isSubscriptionStore ? (
                        <li className="hern-navbar__list__item">
                           <Link href={getRoute('/menu')}>
                              {t('Select Menu')}
                           </Link>
                        </li>
                     ) : (
                        <>
                           {isSubscriptionStore && (
                              <li className="hern-navbar__list__item">
                                 <Link href={getRoute('/our-menu')}>
                                    {t('Our Menu')}
                                 </Link>
                              </li>
                           )}
                        </>
                     )}
                     {!user?.isSubscriber && isSubscriptionStore && (
                        <li className="hern-navbar__list__item">
                           <Link href={getRoute('/our-plans')}>
                              {t('Get Started')}
                           </Link>
                        </li>
                     )}
                  </NavigationBar>
               </section>
               <section className="hern-header__auth">
                  {!isSubscriptionStore && (
                     <div
                        onClick={() => router.push(getRoute('/on-demand-cart'))}
                        className="hern-navbar__list__item hern-navbar__list__item--cart-icon"
                     >
                        <CartIcon size="20px" stroke="var(--hern-accent)" />
                        <span className="number-of-cart-item">
                           {numberOfItemsOnCart}
                        </span>
                     </div>
                  )}
                  {isLoading ? (
                     <>
                        <span className="hern-navbar__list__item__skeleton" />
                        <span className="hern-header__avatar__skeleton" />
                     </>
                  ) : isAuthenticated ? (
                     <>
                        {user?.platform_customer?.firstName &&
                           (isClient && width > 768 ? (
                              <span className="hern-header__avatar">
                                 <Link href={getRoute('/account/profile/')}>
                                    {getInitials(
                                       `${user.platform_customer.firstName} ${user.platform_customer.lastName}`
                                    )}
                                 </Link>
                              </span>
                           ) : (
                              <span
                                 className="hern-header__avatar"
                                 onClick={() => setToggle(!toggle)}
                              >
                                 {getInitials(
                                    `${user.platform_customer.firstName} ${user.platform_customer.lastName}`
                                 )}
                              </span>
                           ))}

                        <button
                           className="hern-header__logout-btn"
                           onClick={logout}
                        >
                           Logout
                        </button>
                     </>
                  ) : (
                     <button
                        className="hern-header__logout"
                        style={{
                           backgroundColor: `${
                              theme?.accent
                                 ? theme?.accent
                                 : 'rgba(37, 99, 235, 1)'
                           }`,
                        }}
                        onClick={() => setShowLoginPopup(true)}
                     >
                        Log In
                     </button>
                  )}
                  <button
                     className="hern-header__menu-btn"
                     onClick={() => setIsMobileNavVisible(!isMobileNavVisible)}
                  >
                     {isMobileNavVisible ? (
                        <CrossIcon stroke="#111" size={24} />
                     ) : (
                        <MenuIcon />
                     )}
                  </button>
               </section>
               {isMobileNavVisible && (
                  <section className="hern-navigatin-menu__wrapper--mobile">
                     <NavigationBar Data={newNavigationMenus}>
                        {isAuthenticated &&
                        user?.isSubscriber &&
                        isSubscriptionStore ? (
                           <li className="hern-navbar__list__item">
                              <Link href={getRoute('/menu')}>Select Menu</Link>
                           </li>
                        ) : (
                           <>
                              {isSubscriptionStore && (
                                 <li className="hern-navbar__list__item">
                                    <Link href={getRoute('/our-menu')}>
                                       Our Menu
                                    </Link>
                                 </li>
                              )}
                           </>
                        )}
                        {!user?.isSubscriber && isSubscriptionStore && (
                           <li className="hern-navbar__list__item">
                              <Link href={getRoute('/our-plans')}>
                                 Get Started
                              </Link>
                           </li>
                        )}
                     </NavigationBar>
                  </section>
               )}
            </header>
         )}
         <LocationSelectorWrapper
            showLocationSelectorPopup={showLocationSelectorPopup}
            setShowLocationSelectionPopup={setShowLocationSelectionPopup}
            settings={settings}
         />
         {isClient && width < 768 && (
            <ProfileSidebar toggle={toggle} logout={logout} />
         )}
         {/* <LoginWrapper
            closeLoginPopup={() => {
               setLoginPopup('false')
            }}
            showLoginPopup={Boolean(params['showLogin'] === 'true')}
         /> */}
         <LoginWrapper
            closeLoginPopup={() => setShowLoginPopup(false)}
            showLoginPopup={showLoginPopup}
         />
      </>
   )
}

const DataWithChildNodes = dataList => {
   dataList.map(each => {
      const newFilter = dataList.filter(
         x => x.parentNavigationMenuItemId === each.id
      )
      each.childNodes = newFilter
      return each
   })
   return dataList
}
