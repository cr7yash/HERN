import React from 'react'

const BrandAppIcon = ({ active }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M8.14844 15.2217C12.2906 15.2217 15.6484 11.8638 15.6484 7.72168C15.6484 3.57954 12.2906 0.22168 8.14844 0.22168C4.0063 0.22168 0.648438 3.57954 0.648438 7.72168C0.648438 11.8638 4.0063 15.2217 8.14844 15.2217ZM8.23445 4.4882C8.19587 4.42198 8.1002 4.42198 8.06162 4.4882L7.03873 6.24441C7.0246 6.26867 7.00092 6.28587 6.97348 6.29181L4.98714 6.72195C4.91223 6.73817 4.88267 6.82916 4.93373 6.88631L6.28789 8.40184C6.3066 8.42278 6.31564 8.45061 6.31281 8.47854L6.10808 10.5006C6.10036 10.5768 6.17776 10.6331 6.2479 10.6022L8.10771 9.78261C8.1334 9.77129 8.16267 9.77129 8.18836 9.78261L10.0482 10.6022C10.1183 10.6331 10.1957 10.5768 10.188 10.5006L9.98326 8.47854C9.98043 8.45061 9.98947 8.42278 10.0082 8.40184L11.3623 6.88631C11.4134 6.82916 11.3838 6.73817 11.3089 6.72195L9.32259 6.29181C9.29515 6.28587 9.27147 6.26867 9.25734 6.24441L8.23445 4.4882Z"
            fill={active ? "#367BF5" : "#555B6E"} />
    </svg>
)
export default BrandAppIcon