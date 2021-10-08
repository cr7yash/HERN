import React from 'react'
import styled from 'styled-components'

const DeleteIcon = () => (
   <StyleButton
      width="28"
      height="29"
      viewBox="0 0 28 29"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
   >
      <rect y="0.0280762" width="28" height="28" rx="4" fill="#F9F9F9" />
      <path
         fill-rule="evenodd"
         clip-rule="evenodd"
         d="M16.3337 9.52808H19.25C19.8023 9.52808 20.25 9.97579 20.25 10.5281C20.25 11.0804 19.8023 11.5281 19.25 11.5281H18.0837V18.6947C18.0837 19.3391 17.5613 19.8614 16.917 19.8614H11.0837C10.4393 19.8614 9.91699 19.3391 9.91699 18.6947V11.5281H8.75C8.19772 11.5281 7.75 11.0804 7.75 10.5281C7.75 9.97579 8.19772 9.52808 8.75 9.52808H11.667V9.36149C11.667 8.71716 12.1893 8.19482 12.8337 8.19482H15.167C15.8113 8.19482 16.3337 8.71716 16.3337 9.36149V9.52808ZM13.333 13.4448C13.333 13.1687 13.1091 12.9448 12.833 12.9448C12.5569 12.9448 12.333 13.1687 12.333 13.4448V16.9448C12.333 17.221 12.5569 17.4448 12.833 17.4448C13.1091 17.4448 13.333 17.221 13.333 16.9448V13.4448ZM15.167 12.9448C15.4431 12.9448 15.667 13.1687 15.667 13.4448V16.9448C15.667 17.221 15.4431 17.4448 15.167 17.4448C14.8908 17.4448 14.667 17.221 14.667 16.9448V13.4448C14.667 13.1687 14.8908 12.9448 15.167 12.9448Z"
         fill="#919699"
      />
   </StyleButton>
)

export default DeleteIcon

const StyleButton = styled.svg`
   &:hover {
      background-color: rgba(249, 249, 249, 1);
      border-radius: 4px;
   }

   &:active {
      > path {
         fill: #367bf5;
      }
   }
`
