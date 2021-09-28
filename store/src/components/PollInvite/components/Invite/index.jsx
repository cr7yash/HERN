import React, { useState } from 'react'
import jwt from 'jsonwebtoken'
import { useToasts } from 'react-toast-notifications'
import { useMutation } from '@apollo/client'
import { Wrapper } from './styles'
import {
   Button,
   Modal,
   useModal,
   InviteThrough,
   CopyIcon,
   SocialShare
} from '../../../../components'
import { theme } from '../../../../theme'
import { useAuth } from '../../../../Providers'
import {
   SEND_EMAIL,
   SEND_SMS,
   CREATE_EXPERIENCE_BOOKING_PARTICIPANT
} from '../../../../graphql'
import { useWindowDimensions, getDate, isNumeric } from '../../../../utils'

export default function Invite({ experienceBooking, isPollClosed }) {
   const { ModalContainer, isShow, show, hide } = useModal()
   const { addToast } = useToasts()
   const { width } = useWindowDimensions()
   const { state: userState } = useAuth()
   const { user = {} } = userState
   const [inviteList, setInviteList] = useState([])
   const [isReset, setIsReset] = useState(false)
   const [copyBtnClasses, setCopyBtnClasses] = useState(['customBtn'])
   const payload = {
      experienceBookingId: experienceBooking?.id,
      experienceBookingCartId: experienceBooking?.cartId,
      invitedBy: {
         name: user?.name,
         email: user?.email
      },
      cutoffDate: experienceBooking?.cutoffTime
   }
   const token = jwt.sign(payload, 'secret-key')

   //   mutation for creating experinceBookingParticipant
   const [createParticipant] = useMutation(
      CREATE_EXPERIENCE_BOOKING_PARTICIPANT,
      {
         onError: error => {
            console.error(error)
         }
      }
   )

   const [sendEmail, { loading: isSendingEmail }] = useMutation(SEND_EMAIL, {
      onError: error => {
         console.log(error)
         addToast('Something went wrong!', { appearance: 'error' })
      }
   })
   const [sendSms, { loading: isSendingSms }] = useMutation(SEND_SMS, {
      onError: error => {
         console.log(error)
         addToast('Something went wrong!', { appearance: 'error' })
      }
   })

   const openDrawer = () => {
      setIsReset(false)
      show()
   }

   const copyHandler = async () => {
      if (!isPollClosed) {
         setCopyBtnClasses(prev => [...prev, 'blink_me'])
         navigator.clipboard
            .writeText(
               `${window.location.origin}/pollInviteResponse?token=${token}`
            )
            .then(
               function () {
                  console.log('Async: Copying to clipboard was successful!')
                  setCopyBtnClasses(['customBtn'])
               },
               function (err) {
                  console.error('Async: Could not copy text: ', err)
               }
            )
      }
   }

   const sendInvitation = async () => {
      if (!isPollClosed) {
         inviteList.forEach(async inviteAddress => {
            const email = isNumeric(inviteAddress) ? null : inviteAddress
            const phone = isNumeric(inviteAddress) ? inviteAddress : null
            const { data: { createExperienceBookingParticipant = {} } = {} } =
               await createParticipant({
                  variables: {
                     object: {
                        experienceBookingId: experienceBooking?.id,
                        email,
                        phone,
                        childCart: {
                           data: {
                              parentCartId: experienceBooking?.cartId
                           }
                        }
                     }
                  }
               })
            const inviteToken = jwt.sign(
               {
                  ...payload,
                  participantId: createExperienceBookingParticipant?.id,
                  cartId: createExperienceBookingParticipant?.cartId,
                  invitee: {
                     name: '',
                     email,
                     phone
                  }
               },
               'secret-key'
            )
            if (isNumeric(inviteAddress)) {
               await sendSms({
                  variables: {
                     message: `Hey ${user?.email} has invited you, Here are Invite details: Invite Url: ${window.location.origin}/pollInviteResponse?token=${inviteToken}`,
                     phone: `+91${inviteAddress}`
                  }
               })
            } else {
               await sendEmail({
                  variables: {
                     emailInput: {
                        subject: 'POLL INVITE',
                        to: inviteAddress,
                        from:
                           (process.browser && window?._env_?.NO_REPLY_EMAIL) ||
                           process.env.NO_REPLY_EMAIL,
                        html: `<h3>Hello ${user?.email} has invited you, Here are Invite details: Invite Url: ${window.location.origin}/pollInviteResponse?token=${inviteToken}</h3>`,
                        attachments: []
                     }
                  }
               })
            }
         })
         addToast('Poll Invitation successfully send.', {
            appearance: 'success'
         })
         setInviteList([])
         setIsReset(true)
         hide()
      }
   }

   return (
      <Wrapper
         disabled={isPollClosed}
         title={isPollClosed && 'Poll cutoff date has expired'}
      >
         <div className="invitation-div">
            <div className="invite-msg-div">
               <Button
                  background={theme.colors.secondaryColor}
                  className={copyBtnClasses}
                  onClick={copyHandler}
                  disabled={isPollClosed}
               >
                  <span>
                     <CopyIcon
                        size={theme.sizes.h6}
                        color={theme.colors.textColor4}
                     />
                  </span>
                  Copy Poll Invite
               </Button>
            </div>
            <div style={{ margin: '1rem 0' }}>
               <SocialShare
                  url={`https://primanti.dailykit.org/pollInviteResponse?token=${token}`}
                  title="Poll Invitation"
                  quote={`${experienceBooking?.experienceBookingOptions[0]?.experienceClass?.experience?.title} Poll Invite`}
                  hashtag="#pollInvite"
               />
            </div>
            <p className="or">OR</p>
            <Button
               disabled={isPollClosed}
               onClick={openDrawer}
               className="customBtn"
            >
               Invite via Email & Phone
            </Button>
         </div>
         <ModalContainer isShow={isShow}>
            <Modal
               isOpen={isShow}
               close={hide}
               type={width > 769 ? 'sideDrawer' : 'bottomDrawer'}
               showActionButton={true}
               actionButtonTitle="Send Invite"
               actionHandler={sendInvitation}
               disabledActionButton={
                  isSendingEmail || isSendingSms || inviteList.length === 0
               }
            >
               <InviteThrough
                  isReset={isReset}
                  onChange={list => setInviteList(list)}
               />
            </Modal>
         </ModalContainer>
      </Wrapper>
   )
}