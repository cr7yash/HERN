import React from 'react'
import { Layout, SEO } from '../../components'
import { getPageProps, processJsFile, renderPageContent } from '../../utils'

const ChangePlanPage = props => {
   const { settings, navigationMenus, folds } = props
   React.useEffect(() => {
      try {
         processJsFile(folds)
      } catch (err) {
         console.log('Failed to render page: ', err)
      }
   }, [folds])

   return (
      <Layout settings={settings} navigationMenus={navigationMenus}>
         <SEO title="Profile" />
         <main>{renderPageContent(folds)}</main>
      </Layout>
   )
}

export const getStaticProps = async ({ params }) => {
   const { parsedData, seo, settings, navigationMenus } = await getPageProps(
      params,
      '/change-plan'
   )

   return {
      props: { folds: parsedData, seo, settings, navigationMenus },
      revalidate: 60, // will be passed to the page component as props
   }
}
export async function getStaticPaths() {
   return {
      paths: [],
      fallback: 'blocking', // true -> build page if missing, false -> serve 404
   }
}

export default ChangePlanPage