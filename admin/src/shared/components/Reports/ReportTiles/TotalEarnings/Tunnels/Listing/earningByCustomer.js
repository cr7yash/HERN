import React from 'react'
import { ReactTabulator } from '@dailykit/react-tabulator'
import TableOptions from '../tableOptions'
import { Dropdown, DropdownButton, Flex, Spacer, Text } from '@dailykit/ui'
const EarningByCustomerTable = props => {
   const { earningByCustomerData } = props
   const earningByCustomerRef = React.useRef()

   const downloadCsvData = () => {
      earningByCustomerRef.current.table.download(
         'csv',
         'earning-by-product-data.csv'
      )
   }

   const downloadPdfData = () => {
      earningByCustomerRef.current.table.downloadToTab(
         'pdf',
         'earning-by-product-data.pdf'
      )
   }

   const downloadXlsxData = () => {
      earningByCustomerRef.current.table.download(
         'xlsx',
         'earning-by-product-data.xlsx'
      )
   }

   //columns for table
   const columns = [
      {
         title: 'Customer Name',
         field: 'fullName',
      },
      {
         title: 'Customer Email',
         field: 'email',
      },
      {
         title: 'Orders',
         field: 'orders',
      },
      {
         title: 'Tax',
         field: 'totalTax',
      },
      {
         title: 'Discount',
         field: 'totalDiscount',
      },
      {
         title: 'Net Sale',
         field: 'netSale',
      },
      {
         title: 'Total Sale',
         field: 'totalAmountPaid',
      },
   ]

   //dropdown options
   const dropdownOptions = [
      {
         id: 1,
         title: 'Orders',
         payload: 'orders',
      },
      {
         id: 2,
         title: 'Tax',
         payload: 'totalTax',
      },
      {
         id: 3,
         title: 'Discount',
         payload: 'totalDiscount',
      },
   ]

   //default ids for columns to be show dropdown
   const defaultIds = () => {
      const defaultShowColumns = localStorage.getItem(
         'earning-by-customer-table-show-columns'
      )
      const parseDefaultColumns = defaultShowColumns
         ? JSON.parse(defaultShowColumns)
         : [1, 2, 3]
      return parseDefaultColumns
   }

   //columns to be show dropdown selected option fn
   const selectedOption = option => {
      const ids = option.map(x => x.id)
      localStorage.setItem(
         'earning-by-customer-table-show-columns',
         JSON.stringify(ids)
      )
      dropdownOptions.forEach(eachOption => {
         if (ids.includes(eachOption.id)) {
            earningByCustomerRef.current.table.showColumn(eachOption.payload)
         } else {
            earningByCustomerRef.current.table.hideColumn(eachOption.payload)
         }
      })
   }

   //columns to be show dropdown search option
   const searchedOption = option => console.log(option)

   // fn run after table data loaded
   const dataLoaded = () => {
      const defaultShowColumns = localStorage.getItem(
         'earning-by-product-table-show-columns'
      )
      const parseDefaultColumns = JSON.parse(defaultShowColumns)
      if (parseDefaultColumns) {
         dropdownOptions.forEach(eachOption => {
            if (!parseDefaultColumns.includes(eachOption.id)) {
               earningByCustomerRef.current.table.hideColumn(eachOption.payload)
            }
         })
      }
   }

   return (
      <>
         <Flex container flexDirection="column">
            <Text as="h3" style={{ padding: '0px 10px' }}>
               Earning By Customer Table
            </Text>
            <Flex
               container
               justifyContent="flex-end"
               alignItems="center"
               padding="0px 10px"
            >
               <DropdownButton title="Download" width="150px">
                  <DropdownButton.Options>
                     <DropdownButton.Option onClick={() => downloadCsvData()}>
                        CSV
                     </DropdownButton.Option>
                     <DropdownButton.Option onClick={() => downloadPdfData()}>
                        PDF
                     </DropdownButton.Option>
                     <DropdownButton.Option onClick={() => downloadXlsxData()}>
                        XLSX
                     </DropdownButton.Option>
                  </DropdownButton.Options>
               </DropdownButton>
               <Spacer xAxis size="20px" />
               <Dropdown
                  type="multi"
                  options={dropdownOptions}
                  defaultIds={defaultIds()}
                  searchedOption={searchedOption}
                  selectedOption={selectedOption}
                  placeholder="Columns to be show..."
                  typeName="option"
                  selectedOptionsVisible={false}
               />
            </Flex>
            <Spacer size="10px" />
            <ReactTabulator
               ref={earningByCustomerRef}
               dataLoaded={dataLoaded}
               data={earningByCustomerData}
               columns={columns}
               options={TableOptions}
            />
         </Flex>
      </>
   )
}
export default EarningByCustomerTable