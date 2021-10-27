import { useRouter } from 'next/router'
import React from 'react'
import { Layout, SEO } from '../../../components'
import { useUser } from '../../../context'
import {
   getPageProps,
   getRoute,
   isClient,
   processJsFile,
   renderPageContent,
} from '../../../utils'

const ProfilePage = props => {
   const router = useRouter()
   const { isAuthenticated, isLoading } = useUser()
   const { folds, settings, navigationMenus, seoSettings } = props

   React.useEffect(() => {
      if (!isAuthenticated && !isLoading) {
         isClient && localStorage.setItem('landed_on', location.href)
         router.push(getRoute('/get-started/register'))
      }
   }, [isAuthenticated, isLoading])

   React.useEffect(() => {
      try {
         processJsFile(folds)
      } catch (err) {
         console.log('Failed to render page: ', err)
      }
   }, [folds])

   return (
      <Layout settings={settings} navigationMenus={navigationMenus}>
         <SEO seoSettings={seoSettings} />
         <main>{renderPageContent(folds)}</main>
      </Layout>
   )
}

export default ProfilePage

export const getStaticProps = async ({ params }) => {
   const { parsedData, settings, navigationMenus, seoSettings } = await getPageProps(
      params,
      '/account/profile'
   )

   return {
      props: { folds: parsedData, settings, navigationMenus, seoSettings },
      revalidate: 60, // will be passed to the page component as props
   }
}
export async function getStaticPaths() {
   return {
      paths: [],
      fallback: 'blocking', // true -> build page if missing, false -> serve 404
   }
}