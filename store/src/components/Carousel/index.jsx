import React, { useRef } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import 'owl.carousel/dist/assets/owl.carousel.css'
import 'owl.carousel/dist/assets/owl.theme.default.css'
import { StyledDiv } from './styled'
import { ChevronLeft, ChevronRight } from '../Icons'
import { Card } from '../Card'
import { ExperienceSkeleton } from '../skeletonLoader'
import Masonry from '../Masonry'
import { theme } from '../../theme'
import { isEmpty, useWindowDimensions } from '../../utils'
const OwlCarousel = dynamic(import('react-owl-carousel'), {
   ssr: false
})

const Carousel = ({ data = [], type = 'experience', showWishlist = true }) => {
   const owlCarouselRef = useRef()
   const router = useRouter()
   return (
      <StyledDiv>
         <div className="prev_btn">
            <span onClick={() => owlCarouselRef.current.prev()}>
               <ChevronLeft size="64" color={theme.colors.textColor7} />
            </span>
         </div>
         <OwlCarousel
            onInitialize={carousel => {
               owlCarouselRef.current = carousel.relatedTarget
            }}
            className="owl-theme"
            items={3}
            loop={true}
            margin={32}
            nav={false}
            dots={true}
            mouseDrag={true}
            touchDrag={true}
         >
            {!isEmpty(data) &&
               data.map((item, index) => {
                  return (
                     <div className="owl_carousel_item" key={index}>
                        <Card
                           boxShadow={false}
                           key={index}
                           type={type}
                           data={item}
                           showWishlist={showWishlist}
                        />
                     </div>
                  )
               })}
         </OwlCarousel>
         <div className="next_btn">
            <span onClick={() => owlCarouselRef.current.next()}>
               <ChevronRight size="64" color={theme.colors.textColor7} />
            </span>
         </div>
      </StyledDiv>
   )
}
export default Carousel
