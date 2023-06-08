import { useState, useRef, FormEvent, useEffect } from "react"
import Card from "../UI/Card"
import classes from "./authForm.module.css"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { langs, Langs } from "./authTexts"
import useError from "../CustomHooks/useError"
import { selectUserData, selectUserPreferences } from "./userSlice"
import { ReactComponent as Eye } from "./SVG/eye.svg"
import { ReactComponent as EyeOff } from "./SVG/eyeOff.svg"
import { selectTheme } from "../Navigation/themeSlice"

import { addDoc, collection } from "firebase/firestore"
import { fireStore } from "../../firebase-config"
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updatePassword,
} from "firebase/auth"
import { setModal } from "../Modal/modalSlice"
import { useAddLogMutation } from "../../logsApi"

/**
 * AuthForm Component
 *
 * A component providing multiple authentication options for users, including Email and Google sign-in.
 *
 * Props - No props are used in this component.
 *
 * State -
 * - authMethod: Maintains the current selected method of authentication.
 * - isLogin: Maintains the status if the user is logging in or creating a new account.
 * - passwordVisible: Maintains the visibility status of the password.
 *
 * Custom Hooks -
 * - useAppDispatch: This hook is provided by Redux Toolkit to dispatch actions.
 * - useAppSelector: This hook is provided by Redux Toolkit to select data from the Redux store.
 * - useError: This is a custom hook that returns an array where the first element is the error and the second element is a function to set the error.
 *
 * Functions -
 * - switchEmailAuthModeHandler: Switches between "Create an account" and "Login to an existing account" modes.
 * - switchAuthMethodHandler: Switches login method between Email and Google.
 * - saveError: Function to save any error to Firebase (Currently not in use).
 * - anonymousSignIn: Initiates an anonymous sign-in process using Firebase authentication (Currently not in use).
 * - googleSignIn: Initiates a Google sign-in process using Firebase authentication.
 * - changePassword: Updates the password of the current user (Currently not in use).
 * - togglePassword: Toggles the visibility of a password.
 * - submitHandler: Handles form submission for user Email login, and provides appropriate error messages based on the type of error encountered.
 */
export const AuthForm = () => {
  /** Access store */
  const dispatch = useAppDispatch()
  const { button } = useAppSelector(selectTheme)
  const { lang: currentLang } = useAppSelector(selectUserPreferences)
  const currentUser = useAppSelector(selectUserData)

  /** Local state */
  type AuthMethod = "options" | "email" | "google" | "anonymous" | "changePassword"
  const [authMethod, setAuthMethod] = useState<AuthMethod>("options")
  const [isLogin, setIsLogin] = useState(true)
  const [passwordVisible, setPasswordVisible] = useState(false)

  /** Error hooks */
  const [emailError, setEmailError] = useError()
  const [passwordError, setPasswordError] = useError()
  const [generalError, setGeneralError] = useError()

  const emailInputRef = useRef<HTMLInputElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)
  const newPasswordInputRef = useRef<HTMLInputElement>(null)

  /** Add log to firebase */
  const [addLog] = useAddLogMutation()

  /** Setup the GoogleAuthProvider for the googleSignIn method */
  let provider = useRef<GoogleAuthProvider>()
  useEffect(() => {
    try {
      provider.current = new GoogleAuthProvider()
    } catch (error) {
      setGeneralError(error)
    }
  }, [])

  /** Handle all hook errors */
  useEffect(() => {
    if (emailError === 0 || passwordError === 0 || generalError === 0) {
      // default error modal
      dispatch(setModal({ modalType: "error" }))
      setEmailError(null)
      setPasswordError(null)
    } else if (generalError) {
      setGeneralError(null)
      dispatch(setModal({ message: generalError }))
    }
  }, [emailError, passwordError, generalError])

  /** Access all text translations */
  const { main } = langs[currentLang as keyof Langs]

  // const errorDelay = 1000;
  // let waitUserEmail: ReturnType<typeof setTimeout>;
  // const handleEmailChange = () => {
  //   clearTimeout(waitUserEmail);

  //   waitUserEmail = setTimeout(() => {
  //     let ifError = false;
  //     if (emailInputRef.current?.value) {
  //       if (emailInputRef.current.value.length < 3) {
  //         ifError = true;
  //       }
  //       setIsEmailError(ifError);
  //     }
  //   }, errorDelay);
  // };

  /**
   * Applicable only for the Email login
   * Switches between Create an account and Login to an existing account
   */
  const switchEmailAuthModeHandler = () => {
    setIsLogin((prevState) => !prevState)
  }

  /**
   * Switches login method between Email and Google
   */
  const switchAuthMethodHandler = (method: AuthMethod) => {
    setAuthMethod(method)
  }

  /**
   * This function signs in a user anonymously.
   * Removed from the options.
   * Generated too many anonymous logins.
   */
  const anonymousSignIn = () => {
    dispatch(setModal({ modalType: "loader" }))
    try {
      signInAnonymously(getAuth())
    } catch (error: any) {}
  }

  /**
   * This function initiates a Google sign-in process using Firebase authentication and displays a loader
   * modal while waiting for the sign-in to complete.
   */
  const googleSignIn = () => {
    dispatch(setModal({ modalType: "loader" }))
    if (provider.current) {
      // Sign in Firebase using popup auth and Google as the identity provider.
      signInWithPopup(getAuth(), provider.current).catch((error) => {
        if (error.message.includes("auth/popup-closed-by-user")) {
          dispatch(setModal({ useModal: false }))
        } else {
          addLog({ type: "error while google login", error })
          setGeneralError(error)
        }
      })
    }
  }

  /**
   * TODO: not working yet
   * This function updates the password of the current user.
   */
  const changePassword = () => {
    const auth = getAuth()

    const newPassword = newPasswordInputRef.current?.value
    if (auth && newPassword) {
      const user = auth.currentUser
      if (user) {
        updatePassword(user, newPassword)
          .then(() => {
            // Update successful.
          })
          .catch((error) => {
            // An error ocurred
            // ...
          })
      }
    }
  }

  /**
   * The function toggles the visibility of a password.
   */
  const togglePassword = () => {
    setPasswordVisible(!passwordVisible)
  }

  /**
   * This function handles form submission for user Email login, displaying appropriate error messages
   * based on the type of error encountered.
   * @param {FormEvent} event - FormEvent is a type of event that is triggered when a form is submitted.
   * It contains information about the form submission, such as the form data and the submit button that
   * was clicked. In this code, the submitHandler function is called when the form is submitted, and the
   * event parameter is used to
   */
  const submitHandler = (event: FormEvent) => {
    event.preventDefault()
    setEmailError(null)
    setPasswordError(null)
    dispatch(setModal({ modalType: "loader" }))
    const enteredEmail = emailInputRef.current?.value
    const enteredPassword = passwordInputRef.current?.value

    if (enteredEmail && enteredPassword) {
      const authRequest = isLogin ? signInWithEmailAndPassword : createUserWithEmailAndPassword

      authRequest(getAuth(), enteredEmail, enteredPassword).catch((error) => {
        dispatch(setModal({ useModal: false }))
        const errorCode = error.code
        if (errorCode.includes("email")) {
          setEmailError(error)
        } else if (errorCode.includes("password")) {
          setPasswordError(error)
        } else {
          setGeneralError(error)
        }
      })
    }
  }

  return (
    <Card additionalClass="authForm">
      <section className={classes.auth}>
        {authMethod === "options" && (
          <div className={classes.options}>
            <h1>{main.options}</h1>

            <div className={classes.optionsBtns}>
              <button type="button" className={button} onClick={() => switchAuthMethodHandler("email")}>
                {main.email}
              </button>
              <button type="button" className={button} onClick={googleSignIn}>
                {main.googleSignIn}
              </button>
              {/* <button type="button" className={button} onClick={anonymousSignIn}>
                {main.anonymousSignIn}
              </button> */}
              {currentUser && (
                <button type="button" className={button} onClick={() => switchAuthMethodHandler("changePassword")}>
                  {main.changePassword}
                </button>
              )}
            </div>
          </div>
        )}
        {authMethod === "email" && (
          <div className={classes.emailForm}>
            <div className={classes.backBtn}>
              <button type="button" className={button} onClick={() => switchAuthMethodHandler("options")}>
                {main.goBack}
              </button>
            </div>
            <h1>{isLogin ? main.login : main.createAccount}</h1>

            <form onSubmit={submitHandler}>
              <div className={`${classes.control} ${emailError && classes.error}`}>
                <label htmlFor="email">{main.yourEmail}</label>
                <input id="email" required ref={emailInputRef} />
              </div>

              {emailError && <p className={classes.errorText}>{emailError}</p>}

              <div className={`${classes.control} ${passwordError && classes.error}`}>
                <label htmlFor="password">{main.yourPassword}</label>
                <input id="password" type={passwordVisible ? "text" : "password"} required ref={passwordInputRef} />
                <button type="button" className={classes.eyeSVG} onClick={() => togglePassword()}>
                  {passwordVisible ? <Eye /> : <EyeOff />}
                </button>
              </div>

              {passwordError && <p className={classes.errorText}>{passwordError}</p>}

              <div className={classes.actions}>
                <div className={classes.emailAuth}>
                  <button className={button}>{isLogin ? main.login : main.createAccount}</button>
                  <button type="button" className={button} onClick={switchEmailAuthModeHandler}>
                    {isLogin ? main.createAccount : main.goToLogin}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
        {authMethod === "changePassword" && (
          <div className={classes.emailForm}>
            <div className={classes.backBtn}>
              <button type="button" className={button} onClick={() => switchAuthMethodHandler("options")}>
                {main.goBack}
              </button>
            </div>
            <h1>Change password</h1>

            <form onSubmit={changePassword}>
              <div className={`${classes.control} ${passwordError && classes.error}`}>
                <label htmlFor="password">Your old password</label>
                <input id="password" type={passwordVisible ? "text" : "password"} required ref={passwordInputRef} />
                <button type="button" className={classes.eyeSVG} onClick={() => togglePassword()}>
                  {passwordVisible ? <Eye /> : <EyeOff />}
                </button>
              </div>

              {emailError && <p className={classes.errorText}>{emailError}</p>}

              <div className={`${classes.control} ${passwordError && classes.error}`}>
                <label htmlFor="password">Your new password</label>
                <input id="password" type={passwordVisible ? "text" : "password"} required ref={passwordInputRef} />
                <button type="button" className={classes.eyeSVG} onClick={() => togglePassword()}>
                  {passwordVisible ? <Eye /> : <EyeOff />}
                </button>
              </div>

              {passwordError && <p className={classes.errorText}>{passwordError}</p>}

              <div className={classes.actions}>
                <div className={classes.emailAuth}>
                  <button className={button} type="submit">
                    Change
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </section>
    </Card>
  )
}

export default AuthForm
