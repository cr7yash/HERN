import React from 'react'

const HelpIcon = ({color = '#367BF5'}) => {
   return (
      <svg
         width="28"
         height="28"
         viewBox="0 0 28 28"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
      >
         <path
            d="M13.9664 16.4951C13.7129 16.4951 13.5041 16.4284 13.34 16.2949C13.1909 16.1613 13.1163 15.9777 13.1163 15.7441C13.1163 15.1321 13.2655 14.6147 13.5638 14.1919C13.862 13.7691 14.2946 13.3074 14.8613 12.8067C15.3087 12.4061 15.6368 12.0723 15.8456 11.8053C16.0544 11.5382 16.1588 11.2378 16.1588 10.904C16.1588 10.5369 15.9724 10.2476 15.5996 10.0362C15.2416 9.81363 14.7494 9.70237 14.123 9.70237C13.5861 9.70237 13.0716 9.79138 12.5794 9.9694C12.0872 10.1363 11.513 10.3811 10.8568 10.7038C10.484 10.8595 10.1782 10.9374 9.9396 10.9374C9.68606 10.9374 9.46234 10.854 9.26846 10.6871C9.08949 10.509 9 10.3032 9 10.0695C9 9.74687 9.17897 9.4854 9.53691 9.28512C10.1633 8.88456 10.9016 8.57302 11.7517 8.35049C12.6018 8.11683 13.4594 8 14.3244 8C15.2342 8 16.0395 8.11683 16.7405 8.35049C17.4564 8.58415 18.0082 8.90682 18.396 9.3185C18.7987 9.73018 19 10.2031 19 10.7371C19 11.3157 18.8136 11.822 18.4407 12.2559C18.0679 12.6787 17.5235 13.1572 16.8076 13.6912C16.1961 14.1586 15.7338 14.5535 15.4206 14.8762C15.1223 15.1878 14.9359 15.5438 14.8613 15.9444C14.8166 16.1224 14.7122 16.2615 14.5481 16.3616C14.399 16.4506 14.2051 16.4951 13.9664 16.4951ZM14.0112 20C13.5339 20 13.1387 19.8832 12.8255 19.6495C12.5123 19.4047 12.3557 19.1043 12.3557 18.7483C12.3557 18.3922 12.5123 18.0974 12.8255 17.8637C13.1387 17.6189 13.5339 17.4965 14.0112 17.4965C14.4884 17.4965 14.8837 17.6189 15.1969 17.8637C15.5101 18.0974 15.6667 18.3922 15.6667 18.7483C15.6667 19.1043 15.5026 19.4047 15.1745 19.6495C14.8613 19.8832 14.4735 20 14.0112 20Z"
            fill={color}
         />
      </svg>
   )
}

export default HelpIcon