import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { signIn } from 'next-auth/client'
import { Wrapper, FormWrap } from './styles'
import ForgotPassword from './forgotPassword'
import Button from '../Button'
import InlineLoader from '../InlineLoader'
import Error from '../Error'
import Input from '../Input'
import Signup from '../signup'
import { useUser } from '../../Providers'
import { theme } from '../../theme'

export default function LoginComp({ isClicked, authBtnClassName, ...rest }) {
   const { toggleAuthenticationModal } = useUser()
   const [loading, setLoading] = useState(false)
   const [isForgotPasswordClicked, setIsForgotPasswordClicked] =
      React.useState(false)
   const [error, setError] = useState('')
   const [email, setEmail] = useState({ value: '' })
   const [password, setPassword] = useState({ value: '', showPassword: false })

   const handleSubmit = async e => {
      try {
         e.preventDefault()
         setLoading(true)
         const response = await signIn('email_password', {
            redirect: false,
            email: email.value,
            password: password.value
         })
         setLoading(false)
         if (response?.status !== 200) {
            setError('Email or password is incorrect!')
         } else if (response?.status === 200) {
            console.log('logged in')
            toggleAuthenticationModal(false)
            redirect()
         }
      } catch (err) {
         setLoading(false)
         toggleAuthenticationModal(false)
         console.error(err)
         setError('Email or password is incorrect!')
      }
   }

   return (
      <>
         {/* <p className="redirectToSignup">
            Don't have an account?{' '}
            <Link href="/signup">
            <a>SIGN UP</a>
            </Link>
         </p> */}
         {rest.showContent === 'signup' ? (
            <Signup setShowContent={rest.setShowContent} />
         ) : (
            <>
               {rest.showContent === 'login' ? (
                  <Wrapper {...rest}>
                     {/* <h1 className="heading text2">Log In</h1> */}
                     <div className="center-div-wrapper">
                        <FormWrap {...rest}>
                           <Input
                              type="email"
                              placeholder="Your email"
                              className="customInput"
                              autocomplete="off"
                              required
                              value={email.value}
                              onChange={e =>
                                 setEmail(prev => ({
                                    ...prev,
                                    value: e.target.value
                                 }))
                              }
                           />
                           <div className="password-wrap">
                              <Input
                                 type={
                                    password?.showPassword ? 'text' : 'password'
                                 }
                                 autocomplete="off"
                                 placeholder="Enter password"
                                 className="customInput"
                                 value={password.value}
                                 onChange={e =>
                                    setPassword(prev => ({
                                       ...prev,
                                       value: e.target.value
                                    }))
                                 }
                              />
                              <span
                                 className="eye-icon"
                                 onClick={() =>
                                    setPassword(prev => ({
                                       ...prev,
                                       showPassword: !prev.showPassword
                                    }))
                                 }
                              >
                                 <i
                                    class={
                                       password.showPassword
                                          ? 'fas fa-eye'
                                          : 'fas fa-eye-slash'
                                    }
                                 ></i>
                              </span>
                           </div>
                           {error && <Error>{error}</Error>}
                           <p
                              onClick={() =>
                                 rest.setShowContent('forgotPassword')
                              }
                              className="forgotPassword text9"
                           >
                              Forgot username / password?
                           </p>
                           <p className="signup_title text9">
                              NOT SIGNED UP YET?{' '}
                              <span
                                 onClick={() => rest.setShowContent('signup')}
                              >
                                 SIGN UP HERE
                              </span>
                           </p>
                        </FormWrap>

                        <div className={`loginBtnWrap ${authBtnClassName}`}>
                           <Button
                              disabled={loading}
                              onClick={handleSubmit}
                              className="loginBtn text3"
                           >
                              {loading ? (
                                 <InlineLoader
                                    color={theme.colors.textColor4}
                                 />
                              ) : (
                                 'Log in'
                              )}
                           </Button>
                        </div>
                     </div>
                  </Wrapper>
               ) : (
                  <ForgotPassword
                     close={() => setIsForgotPasswordClicked(false)}
                  />
               )}
            </>
         )}
      </>
   )
}

const redirect = () => {
   const inviteUrl = localStorage.getItem('bookingInviteUrl')
   if (inviteUrl) {
      window.location.href = inviteUrl
   } else {
      window.location.href = `${window.location.origin}/dashboard`
   }
}
