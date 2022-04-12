import React from 'react'

export const EmptyCloche = ({ color = 'var(--hern-accent)' }) => {
   return (
      <svg
         width="300"
         height="301"
         viewBox="0 0 300 301"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
      >
         <rect
            width="300"
            height="300"
            transform="translate(0 0.679688)"
            fill="white"
         />
         <ellipse
            cx="149.147"
            cy="246.082"
            rx="107.86"
            ry="5.34859"
            fill={color}
            fillOpacity="0.25"
         />
         <rect
            width="10.7857"
            height="16.3175"
            rx="5.39286"
            transform="matrix(0.930244 -0.36694 0.367057 0.930198 104.045 84.3867)"
            fill="#28794E"
         />
         <path
            d="M238.998 147.236C229.549 123.291 210.974 104.08 187.358 93.8286C163.743 83.5771 137.021 83.1251 113.072 92.5719C89.1226 102.019 69.9078 120.591 59.6544 144.202C49.401 167.814 48.9489 194.53 58.3975 218.475L238.998 147.236Z"
            fill={color}
         />
         <ellipse
            rx="97.0715"
            ry="7.87928"
            transform="matrix(0.930249 -0.36693 0.367047 0.930202 149.146 183.102)"
            fill="#28794E"
         />
         <path
            d="M279.752 125.489C278.6 123.587 274.616 124.782 271.472 126.727V126.731C270.503 127.36 269.613 128.105 268.816 128.945C267.884 128.154 266.874 127.459 265.805 126.863C264.289 126.005 262.646 125.393 260.935 125.048C258.678 124.692 257.835 125.356 257.483 126.02C257.128 126.684 257.041 127.747 258.545 129.43C259.734 130.699 261.127 131.761 262.662 132.573C264.354 133.546 266.219 134.179 268.152 134.432H268.906C271.089 134.225 273.189 133.481 275.014 132.264C276.534 131.39 277.896 130.266 279.045 128.945C280.24 127.215 280.107 126.11 279.752 125.489L279.752 125.489ZM259.565 128.234C258.725 127.262 258.678 126.774 258.725 126.731C258.768 126.687 258.725 126.731 259.565 126.731C259.858 126.694 260.154 126.694 260.451 126.731C262.007 127.021 263.505 127.574 264.876 128.367C265.809 128.886 266.698 129.479 267.532 130.14V131.026V131.023C266.495 130.683 265.488 130.254 264.524 129.741C262.795 129.541 261.115 129.031 259.565 128.235L259.565 128.234ZM277.67 127.882C276.639 129.04 275.428 130.026 274.085 130.804C273.152 131.397 272.158 131.888 271.12 132.264V131.421C271.899 130.723 272.745 130.1 273.643 129.562C277.053 127.527 279.4 127.438 279.619 127.747C279.842 128.058 278.334 126.907 277.67 127.882V127.882Z"
            fill={color}
         />
         <path
            d="M269.697 134.29C302.402 188.905 173.668 166.293 182.714 241.432"
            stroke={color}
            strokeOpacity="0.8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="6 6"
         />
      </svg>
   )
}