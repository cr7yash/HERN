import React from 'react'

export const WarningIcon = ({ size = 24 }) => {
   return (
      <svg
         xmlns="http://www.w3.org/2000/svg"
         enable-background="new 0 0 47.5 47.5"
         viewBox="0 0 47.5 47.5"
         width={size}
         height={size}
      >
         <defs>
            <clipPath id="a" clipPathUnits="userSpaceOnUse">
               <path d="M 0,38 38,38 38,0 0,0 0,38 Z" />
            </clipPath>
         </defs>
         <g clipPath="url(#a)" transform="matrix(1.25 0 0 -1.25 0 47.5)">
            <path
               fill="#ffcc4d"
               d="m 0,0 c -1.842,0 -2.654,1.338 -1.806,2.973 l 15.609,30.055 c 0.848,1.635 2.238,1.635 3.087,0 L 32.499,2.973 C 33.349,1.338 32.536,0 30.693,0 L 0,0 Z"
               transform="translate(3.653 2)"
            />
            <path
               fill="#231f20"
               d="M 0,0 C 0,1.302 0.961,2.108 2.232,2.108 3.473,2.108 4.465,1.271 4.465,0 l 0,-11.938 c 0,-1.271 -0.992,-2.108 -2.233,-2.108 -1.271,0 -2.232,0.807 -2.232,2.108 L 0,0 Z m -0.187,-18.293 c 0,1.333 1.086,2.418 2.419,2.418 1.333,0 2.419,-1.085 2.419,-2.418 0,-1.334 -1.086,-2.419 -2.419,-2.419 -1.333,0 -2.419,1.085 -2.419,2.419"
               transform="translate(16.769 26.34)"
            />
         </g>
      </svg>
   )
}
