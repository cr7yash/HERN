import styled from 'styled-components'
import { theme } from '../../../theme'
export const Card = styled.div`
   display: flex;
   flex-direction: column;
   align-items: flex-start;
   background: ${theme.colors.mainBackground};
   box-shadow: ${({ boxShadow = 'true' }) =>
      boxShadow === 'true'
         ? '0px 8px 12px 2px rgba(0, 0, 0, 0.32)'
         : 'none' || '0px 8px 12px 2px rgba(0, 0, 0, 0.32)'};
   border-radius: 16px;
   cursor: pointer;
   overflow: hidden;
   transition: all 0.3s ease-in-out;
   &:hover {
      box-shadow: rgba(0, 0, 0, 0.32) 0px 19px 43px;
      transform: translate3d(0px, -1.5px, 0px);
   }
   width: ${({ customWidth }) => customWidth};
`

export const CardImage = styled.div`
   width: 100%;
   height: 120px;
   overflow: hidden;
   img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 650ms;
      &:hover {
         transform: scale(1.03);
      }
   }
   @media (min-width: 769px) {
      height: 180px;
   }
`

export const CardBody = styled.div`
   color: ${theme.colors.textColor2};
   width: 100%;
   padding: 1rem;
   .exp-name {
      margin: 4px 0 4px 0;
      font-weight: 700;
      text-align: left;
      color: ${theme.colors.textColor2};
      font-family: 'Barlow Condensed';
   }
   .exp-info {
      font-weight: 800;
      font-size: ${theme.sizes.h7};
      span {
         font-weight: 400;
         font-size: ${theme.sizes.h7};
      }
   }
   .book-exp {
      text-align: center;
      font-weight: 800;
      font-size: ${theme.sizes.h8};
      color: ${theme.colors.textColor};
      background: ${theme.colors.textColor4};
      text-transform: uppercase;
      cursor: pointer;
      :hover {
         border: none;
         background: ${theme.colors.textColor};
         color: ${theme.colors.textColor4};
      }
   }
   .duration {
      display: flex;
      align-items: center;
      span {
         font-weight: 600;
         font-size: ${theme.sizes.h6};
         margin-left: 8px;
         text-transform: uppercase;
      }
   }
   .expertImgDiv {
      width: 100%;
      display: flex;
      flex: 1;
      align-items: center;
   }
   .expert-img {
      width: 28px;
      height: 28px;
      border-radius: 50px;
      margin-right: 0.5rem;
   }
   .expert-name {
      margin-bottom: 0 !important;
      font-family: 'Maven Pro';
      font-weight: 800;
      margin-bottom: 0;
      text-transform: uppercase;
   }
   @media (min-width: 769px) {
      .exp-info {
         font-weight: 600;
      }
      .duration {
         span {
            font-size: ${theme.sizes.h8};
         }
      }
      .book-exp {
         font-size: ${theme.sizes.h8};
      }
   }
`
