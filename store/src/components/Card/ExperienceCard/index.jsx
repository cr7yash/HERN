import React from 'react'
import { Flex } from '@dailykit/ui'
import Image from 'next/image'
import { useRouter } from 'next/router'
import moment from 'moment'
import { Card, CardImage, CardBody } from './styles.js'
import { Clock, UsersIcon, BookmarkIcon } from '../../Icons'
import Wishlist from '../../Wishlist'
import { theme } from '../../../theme.js'
import { useUser } from '../../../Providers'

export default function ExperienceCard({
   cardDetails,
   showWishlist = true,
   ...props
}) {
   const { experience } = cardDetails
   const { state: userState } = useUser()
   const { user = {} } = userState
   const expert = experience?.experienceClasses[0]?.experienceClassExpert
   const router = useRouter()
   const onClickHandler = () => {
      router.push(`/experiences/${experience?.id}`)
   }
   return (
      <Card {...props}>
         <CardImage onClick={onClickHandler}>
            <img
               src={experience?.assets?.images[0]}
               alt="experience"
               // layout="fill"
            />
            {showWishlist && (
               <Wishlist
                  className="bookmark-icon"
                  title={
                     experience?.isSaved
                        ? 'Click to remove from wishlist'
                        : 'Click to add to wishlist'
                  }
                  method={experience?.isSaved ? 'delete' : 'create'}
                  variable={
                     experience?.isSaved
                        ? experience?.customer_savedEntities[0]?.id
                        : {
                             keycloakId: user?.keycloakId,
                             experienceId: experience?.id
                          }
                  }
                  icon={
                     <BookmarkIcon
                        width="32"
                        height="54"
                        color={
                           experience?.isSaved
                              ? theme.colors.tertiaryColor
                              : theme.colors.textColor4
                        }
                     />
                  }
               />
            )}
         </CardImage>
         <CardBody {...props}>
            <h2 className="exp-name text6" onClick={onClickHandler}>
               {experience?.title}
            </h2>
            <Flex
               container
               alignItems="center"
               justifyContent="space-between"
               margin="0 0 4px 0"
            >
               {expert ? (
                  <div className="expertImgDiv">
                     {/* {Boolean(expert?.assets?.images.length) && (
                        <Image
                           className="expert-img"
                           src={
                              expert?.assets?.images[0] ||
                              `https://ui-avatars.com/api/?name=${expert?.firstName}+${expert?.lastName}&background=fff&color=15171F&size=500&rounded=true`
                           }
                           alt="expert-img"
                           layout="fill"
                        />
                     )} */}
                     <p>{`${expert?.firstName} ${expert?.lastName}`}</p>
                  </div>
               ) : (
                  <p>Duration</p>
               )}
               <span className="duration">
                  <Clock
                     size={theme.sizes.h6}
                     color={
                        props.backgroundMode === 'light'
                           ? theme.colors.textColor5
                           : theme.colors.textColor4
                     }
                  />
                  <span>
                     {moment
                        .duration(experience?.experienceClasses[0]?.duration)
                        .asMinutes()}
                     min
                  </span>
               </span>
            </Flex>
            <Flex
               container
               alignItems="center"
               justifyContent="space-between"
               margin="0 0 4px 0"
            >
               <Flex container alignItems="center">
                  <span className="duration">
                     <UsersIcon
                        size={theme.sizes.h6}
                        color={
                           props.backgroundMode === 'light'
                              ? theme.colors.textColor5
                              : theme.colors.textColor4
                        }
                     />
                  </span>
                  <span className="exp-users-info">
                     {experience?.experienceClasses[0]
                        ?.privateExperienceClassType?.minimumParticipant || 1}
                     -
                     {experience?.experienceClasses[0]
                        ?.privateExperienceClassType?.maximumParticipant || 1}
                  </span>
               </Flex>

               <p className="exp-info">
                  ${' '}
                  {experience?.experienceClasses[0]?.privateExperienceClassType
                     ?.minimumBookingAmount || 0}
               </p>
            </Flex>
            {/* <p className="book-exp">Book</p> */}
         </CardBody>
      </Card>
   )
}