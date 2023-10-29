import { useState, useRef, FormEvent, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { langs, Langs } from "./authTexts"
import useError from "../CustomHooks/useError"
import { selectUserData, selectUserPreferences } from "./userSlice"
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
import useAuthContext from "../../app/auth-context"
import { useNavigate } from "react-router-dom"
import { Button, Grid, Stack, Typography } from "@mui/material"
import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import TextField from "@mui/material/TextField"
import InputAdornment from "@mui/material/InputAdornment"
import IconButton from "@mui/material/IconButton"
import { VisibilityOff } from "@mui/icons-material"

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
  const [newPasswordError, setNewPasswordError] = useError()

  const emailInputRef = useRef<HTMLInputElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)
  const newPasswordInputRef = useRef<HTMLInputElement>(null)

  /** Access Context */
  const authCtx = useAuthContext()

  /** Access Router */
  const navigate = useNavigate()

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
    if (emailError === 0 || passwordError === 0 || generalError === 0 || newPasswordError === 0) {
      // default error modal
      dispatch(setModal({ modalType: "error" }))
      setEmailError(null)
      setPasswordError(null)
      setNewPasswordError(null)
    } else if (generalError) {
      setGeneralError(null)
      dispatch(setModal({ message: generalError }))
    }
  }, [emailError, passwordError, generalError, newPasswordError])

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
      signInWithPopup(getAuth(), provider.current)
        .catch((error) => {
          if (error.message.includes("auth/popup-closed-by-user")) {
            // The modal is closed by the user without any action
            dispatch(setModal({ useModal: false }))
          } else {
            addLog({ type: "error while google login", error })
            setGeneralError(error)
          }
        })
        .finally(() => {
          // Usually, this is not needed, because the modal close is handled from App.tsx / onAuthStateChanged
          // But because of this Firebase issue: https://github.com/vercel/next.js/discussions/51135
          // the signInWithPopup will not return the error and because there is an error the onAuthStateChanged will not be triggered
          // thus, nothing will close the modal, braking the website's flow
          dispatch(setModal({ useModal: false }))
        })
    }
  }

  /**
   * TODO: not working yet
   * This function updates the password of the current user.
   */
  const changePassword = (event: FormEvent) => {
    event.preventDefault()
    const auth = getAuth()

    const newPassword = newPasswordInputRef.current?.value
    if (auth && newPassword) {
      const user = auth.currentUser
      if (user) {
        updatePassword(user, newPassword)
          .then(() => {
            // Update successful.
            navigate("/")
          })
          .catch((error) => {
            // An error ocurred
            setNewPasswordError(error)
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

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
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

    const enteredEmail = emailInputRef.current?.value
    const enteredPassword = passwordInputRef.current?.value

    if (enteredEmail && enteredPassword) {
      dispatch(setModal({ modalType: "loader" }))
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
    <Paper
      variant="elevation"
      elevation={10}
      sx={{
        width: "fit-content",
        height: "fit-content",
        padding: 5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "flex-start",
        marginTop: 11,
      }}
    >
      {" "}
      <Grid>
        {authMethod === "options" && (
          <Stack spacing={2}>
            <Typography variant="h6" color="primary">
              {main.options}
            </Typography>

            <Button variant="contained" onClick={() => switchAuthMethodHandler("email")}>
              {main.email}
            </Button>
            <Button variant="contained" onClick={googleSignIn}>
              {main.googleSignIn}
            </Button>
            {/* <button type="button" onClick={anonymousSignIn}>
              {main.anonymousSignIn}
            </button> */}
            {authCtx.isLoggedIn && currentUser && (
              <Button variant="contained" onClick={() => switchAuthMethodHandler("changePassword")}>
                {main.changePassword}
              </Button>
            )}
          </Stack>
        )}
        {authMethod === "email" && (
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ position: "relative" }}>
              <Button variant="contained" type="button" onClick={() => switchAuthMethodHandler("options")}>
                {main.goBack}
              </Button>

              <Typography variant="h6" sx={{ position: "absolute", left: "45%" }}>
                {isLogin ? main.login : main.createAccount}
              </Typography>
            </Stack>

            <Box component="form" onSubmit={submitHandler}>
              <Stack direction="column" justifyContent="space-around" alignItems="center">
                <TextField
                  fullWidth
                  margin="normal"
                  required
                  id="email"
                  label={main.yourEmail}
                  name="email"
                  autoComplete="email"
                  autoFocus
                  error={!!emailError}
                  helperText={emailError}
                  inputRef={emailInputRef}
                />

                <TextField
                  fullWidth
                  margin="normal"
                  required
                  id="password"
                  label={main.yourPassword}
                  name="password"
                  autoComplete="password"
                  autoFocus
                  error={!!passwordError}
                  helperText={passwordError}
                  inputRef={passwordInputRef}
                  type={passwordVisible ? "text" : "password"}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => togglePassword()}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {passwordVisible ? <VisibilityOff /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>

              <Stack direction="row" justifyContent="space-around" alignItems="flex-start" spacing={2} marginTop="10px">
                <Button variant="contained" type="submit">
                  {isLogin ? main.login : main.createAccount}
                </Button>
                <Button variant="contained" type="button" onClick={switchEmailAuthModeHandler}>
                  {isLogin ? main.toCreateAccount : main.goToLogin}
                </Button>
              </Stack>
            </Box>
          </Stack>
        )}
        {authMethod === "changePassword" && (
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Button variant="contained" type="button" onClick={() => switchAuthMethodHandler("options")}>
                {main.goBack}
              </Button>
              <Typography variant="h6">Change password</Typography>
            </Stack>

            <Box component="form" onSubmit={changePassword}>
              <Stack direction="column" justifyContent="space-around" alignItems="center">
                <TextField
                  margin="normal"
                  required
                  id="password"
                  label="Your new password"
                  name="password"
                  autoComplete="password"
                  autoFocus
                  error={!!newPasswordError}
                  helperText={newPasswordError}
                  inputRef={newPasswordInputRef}
                  type={passwordVisible ? "text" : "password"}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => togglePassword()}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {passwordVisible ? <VisibilityOff /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button variant="contained" type="submit">
                  Change
                </Button>
              </Stack>
            </Box>
          </Stack>
        )}
      </Grid>
    </Paper>
  )
}

export default AuthForm
