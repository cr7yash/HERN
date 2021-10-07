import React, { useRef, useState, useEffect, useContext } from 'react'
import {
   Text,
   Loader,
   Flex,
   IconButton,
   Form,
   ComboButton,
   Tunnels,
   Tunnel,
   useTunnel,
   PlusIcon,
} from '@dailykit/ui'
import { useSubscription, useQuery, useMutation } from '@apollo/react-hooks'
import { ReactTabulator, reactFormatter } from '@dailykit/react-tabulator'
import { useLocation } from 'react-router-dom'
import { StyledWrapper } from './styled'
import BrandContext from '../../../context/Brand'
import {
   BRAND_PAGES_LISTING,
   BRAND_TOTAL_PAGES,
   WEBPAGE_ARCHIVED,
   UPDATE_WEBPAGE,
} from '../../../graphql'
import { Tooltip, InlineLoader, Banner } from '../../../../../shared/components'
import { DeleteIcon } from '../../../../../shared/assets/icons'
import { useTooltip, useTabs } from '../../../../../shared/providers'
import PageCreationTunnel from './Tunnel'

import { currencyFmt, logger } from '../../../../../shared/utils'
import options from '../tableOption'
import { toast } from 'react-toastify'

const PageListing = () => {
   const location = useLocation()
   const [tunnels, openTunnel, closeTunnel] = useTunnel()
   const [context, setContext] = useContext(BrandContext)
   const { addTab, tab, closeAllTabs } = useTabs()
   const { tooltip } = useTooltip()
   const tableRef = useRef(null)
   const [pageList, setPageList] = useState(undefined)
   const prevBrandId = useRef(context.brandId)

   //    Subscription for page listing
   const { loading, error } = useSubscription(BRAND_PAGES_LISTING, {
      variables: {
         brandId: context.brandId,
      },
      onSubscriptionData: data => {
         const result = data.subscriptionData.data.brands_brandPages.map(
            page => {
               return {
                  id: page.brandId,
                  internalPageName: page.internalPageName,
                  url: `${context.brandDomain}${page.route}`,
                  pageVisit: 'N/A',
                  published: page.published,
               }
            }
         )
         console.log(result)
         setPageList(result)
      },
   })

   const {
      data: {
         brands_brandPages_aggregate: { aggregate: { count = 0 } = {} } = {},
      } = {},
      loading: totalPagesLoading,
      error: totalPagesError,
   } = useSubscription(BRAND_TOTAL_PAGES, {
      variables: {
         brandId: context.brandId,
      },
   })

   //    Mutation for delete
   const [deletePage] = useMutation(WEBPAGE_ARCHIVED, {
      onCompleted: () => {
         toast.success('Page deleted!')
      },
      onError: error => {
         logger(error)
         toast.error('Could not delete!')
      },
   })

   // Mutation for page publish toggle
   const [updatePage] = useMutation(UPDATE_WEBPAGE, {
      onCompleted: () => {
         toast.success('Updated!')
      },
      onError: error => {
         toast.error('Something went wrong')
         logger(error)
      },
   })

   useEffect(() => {
      if (!tab) {
         addTab('Pages', location.pathname)
      }
   }, [addTab, tab])

   // delete Handler
   const deleteHandler = (e, page) => {
      e.stopPropagation()
      if (
         window.confirm(
            `Are you sure you want to delete this page - ${page.internalPageName}?`
         )
      ) {
         deletePage({
            variables: {
               brandId: context.brandId,
            },
         })
      }
   }

   const rowClick = (e, cell) => {
      const { id, internalPageName } = cell._cell.row.data
      const param = `${location.pathname}/${id}/${internalPageName}`
      console.log(param)
      addTab(internalPageName, param)
   }

   // toggle handler
   const toggleHandler = (toggle, id, route) => {
      const val = !toggle
      // if (val && !isvalid) {
      //    toast.error(`Coupon should be valid!`)
      // } else {
      updatePage({
         variables: {
            pageId: id,
            route: route,
            set: {
               published: val,
            },
         },
      })
   }

   const DeleteButton = () => {
      return (
         <IconButton type="ghost">
            <DeleteIcon color="#FF5A52" />
         </IconButton>
      )
   }

   const ToggleButton = ({ cell }) => {
      const rowData = cell._cell.row.data
      return (
         <Form.Group>
            <Form.Toggle
               name={`[page_active${rowData.id}`}
               onChange={() => toggleHandler(rowData.published, rowData.id, rowData.route)}
               value={rowData.published}
            />
         </Form.Group>
      )
   }

   const columns = [
      {
         title: 'Internal Page Name',
         field: 'internalPageName',
         headerFilter: true,
         hozAlign: 'left',
         cssClass: 'rowClick',
         cellClick: (e, cell) => {
            rowClick(e, cell)
         },
         headerTooltip: column => {
            const identifier = 'page_listing_pageName_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
         width: 300,
      },
      {
         title: 'URL',
         field: 'url',
         headerFilter: true,
         hozAlign: 'left',
         titleFormatter: cell => {
            cell.getElement().style.textAlign = 'left'
            return '' + cell.getValue()
         },
         headerTooltip: column => {
            const identifier = 'page_listing_url_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         title: 'Page Visit',
         field: 'pageVisit',
         hozAlign: 'left',
         headerTooltip: column => {
            const identifier = 'page_listing_pageVisit_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
         width: 150,
      },
      {
         title: 'Published',
         field: 'published',
         hozAlign: 'center',
         formatter: reactFormatter(<ToggleButton />),
         titleFormatter: cell => {
            cell.getElement().style.textAlign = 'center'
            return '' + cell.getValue()
         },
         width: '150',
         headerTooltip: column => {
            const identifier = 'page_listing_published_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         title: 'Action',
         field: 'action',
         cellClick: (e, cell) => {
            e.stopPropagation()
            deleteHandler(e, cell._cell.row.data)
         },
         formatter: reactFormatter(<DeleteButton />),
         hozAlign: 'center',
         titleFormatter: cell => {
            cell.getElement().style.textAlign = 'center'
            return '' + cell.getValue()
         },
         width: 150,
      },
   ]

   if (context.brandId !== prevBrandId.current) {
      closeAllTabs()
   }

   if (loading || totalPagesLoading) {
      return <InlineLoader />
   }
   if (error || totalPagesError) {
      toast.error('Something went wrong123!')
      logger(error || totalPagesError)
   }
   return (
      <StyledWrapper>
         <Banner id="content-app-pages-listing-top" />
         <Flex
            container
            height="80px"
            alignItems="center"
            justifyContent="space-between"
         >
            <Flex container alignItems="center">
               <Text as="h2" style={{ marginBottom: '0em' }}  >
                  Page(
                  {count})
               </Text>
               <Tooltip identifier="customer_list_heading" />
            </Flex>
            <ComboButton type="solid" size="md" onClick={() => openTunnel(1)}>
               <PlusIcon color="#fff" /> Create Page
            </ComboButton>
         </Flex>

         {Boolean(pageList) && (
            <ReactTabulator
               columns={columns}
               data={pageList}
               options={{
                  ...options,
                  placeholder: 'No Pages Available Yet !',
               }}
               ref={tableRef}
            />
         )}
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1}>
               <PageCreationTunnel close={closeTunnel} />
            </Tunnel>
         </Tunnels>
         <Banner id="content-app-pages-listing-bottom" />
      </StyledWrapper>
   )
}

export default PageListing
