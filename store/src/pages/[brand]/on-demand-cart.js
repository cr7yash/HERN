import React from 'react'
import { useRouter } from 'next/router'
import { SEO, Layout } from '../../components'
import styled from 'styled-components'
import { useUser } from '../../context'
import {
   getPageProps,
   getRoute,
   isClient,
   processExternalFiles,
   renderPageContent,
} from '../../utils'

const CartPage = props => {
   const router = useRouter()
   const { isAuthenticated, isLoading } = useUser()
   const { folds, settings, navigationMenus, seoSettings, linkedFiles } = props
   React.useEffect(() => {
      try {
         processExternalFiles(folds, linkedFiles)
      } catch (err) {
         console.log('Failed to render page: ', err)
      }
   }, [folds])

   return (
      <Layout settings={settings} navigationMenus={navigationMenus}>
         <SEO seoSettings={seoSettings} />
         <Main>{renderPageContent(folds)}</Main>
      </Layout>
   )
}

export default CartPage

export const getStaticProps = async ({ params }) => {
   const { parsedData, settings, navigationMenus, seoSettings, linkedFiles } =
      await getPageProps(params, '/on-demand-cart')

   return {
      props: {
         folds: parsedData,
         linkedFiles,
         settings,
         navigationMenus,
         seoSettings,
      },
      revalidate: 60, // will be passed to the page component as props
   }
}
export async function getStaticPaths() {
   return {
      paths: [],
      fallback: 'blocking', // true -> build page if missing, false -> serve 404
   }
}

const Main = styled.div`
padding: 29px 100px;
background: #f9f9f9;
`