import { useEffect, useState } from "react"
// import "./App.css";
import Navigation from "./components/Navigation/Navigation"
import { Outlet } from "react-router-dom"
import Modal from "./components/Modal/Modal"
import { useAppDispatch, useAppSelector } from "./app/hooks"
import { defaultLang, clearNavData } from "./components/Navigation/navigationSlice"
import useAuthContext from "./app/auth-context"
import { Langs } from "./components/Navigation/navigationTexts"
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword, signOut } from "firebase/auth"
import {
  clearUserData,
  setUserData,
  setUserPreferences,
  UserData,
  userHasData,
  selectUserData,
} from "./components/Auth/userSlice"
import { useNavigate } from "react-router-dom"
import { useAddUserDataMutation } from "./components/Auth/userApi"
import useError from "./components/CustomHooks/useError"
import { useOnlineStatus } from "./components/CustomHooks/useOnlineStatus"
import { getError, getSizes, checkBrowser } from "./app/utils"
import { clearChatData, selectUserRooms, setInbox } from "./components/Chat/chatSlice"
import { selectTheme, setTheme, Themes } from "./components/Navigation/themeSlice"
import { useInboxListenerQuery } from "./components/Chat/chatApi"
import { setModal } from "./components/Modal/modalSlice"
import { useAddLogMutation } from "./logsApi"
import { Box, CssBaseline, Grid, Snackbar, Theme } from "@mui/material"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"

/**
 * App Component
 *
 * This is the main application component that sets up the initial state, handles authentication state changes, manages local storage settings, and updates the title based on the number of inbox messages.
 *
 * Props - This component does not receive any props.
 *
 * State - Description of the state instance within the component
 * - localHost: Indicates if the application is running on localhost.
 *
 * Custom Hooks - Description of custom hooks used within the component
 * - useAppDispatch: Allows access to the Redux dispatch function.
 * - useAppSelector: Allows selection of specific slices of state from the Redux store.
 * - useAuthContext: Provides access to the authentication context.
 * - useNavigate: Provides the ability to navigate to different routes.
 * - useError: Tracks errors that occur within the application.
 * - useOnlineStatus: Tracks the online status of the user.
 * - useAddUserDataMutation: Sends a mutation to add user data to Firebase.
 * - useInboxListenerQuery: Listens for changes to the user's inbox and triggers refetches as needed.
 *
 * Functions - Short description of functions within the component
 * - anonymousSignIn: Signs in the user anonymously.
 */

export const App = () => {
  /** Access store */
  const dispatch = useAppDispatch()
  const userHasDataInStore = useAppSelector(userHasData)
  const currentUser = useAppSelector(selectUserData)
  const userRooms = useAppSelector(selectUserRooms)
  const { value: storeTheme } = useAppSelector(selectTheme)

  /** Access Context */
  const authCtx = useAuthContext()

  /** Access Router */
  const navigate = useNavigate()

  /** Local state */
  const [localHost, setLocalHost] = useState(false)
  const [notif, setNotif] = useState(false)
  const [notifMsg, setNotifMsg] = useState("")
  const [stateTheme, setStateTheme] = useState<Theme>(
    createTheme({
      palette: {
        mode: storeTheme,
      },
    })
  )
  const [previousTheme, setPreviousTheme] = useState<Themes>(storeTheme)
  const [initLoad, setInitLoad] = useState<boolean>(true)

  /** Error hooks */
  const [usersError, setUsersError] = useError()
  const [loginError, setLoginError] = useError()
  const [inboxError, setInboxError] = useError()

  const { isOnline, wasOffline, resetOnlineStatus } = useOnlineStatus()

  const [addUserData, { data: usersData, isLoading: isSendingPost, isError, error }] = useAddUserDataMutation()

  /** Add log to firebase */
  const [addLog] = useAddLogMutation()

  /**
   * For useAddUserDataMutation
   * Checks for errors generated from the RTKQ and errors generated from Firebase
   * */
  useEffect(() => {
    if (((isError && error) || (usersData && usersData.error)) && !usersError) {
      setUsersError([isError, error, usersData], "ambiguousSource")
    }
  }, [isError, error, usersData])

  /**
   * For useAddUserDataMutation
   * When error is caught show the modal
   * */
  useEffect(() => {
    if (usersError) {
      dispatch(setModal({ message: usersError }))
    }
  }, [usersError])

  /**
   * For finding if the user has chosen dark mode through browser or OS settings
   * */
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)")

  /**
   * The initial value has to be the one from the store, so that
   * on init, we we assign it, and then reassign it with the user's choice.
   * On init, set the theme to the default theme.
   * Then listen for changes from the store.
   * */
  useEffect(() => {
    setStateTheme(
      createTheme({
        palette: {
          mode: storeTheme,
        },
      })
    )
  }, [storeTheme])
  /**
   * This reassignment has to be second, so that, on init this will be
   * the default choice.
   * On init, set the theme to dark if the user prefer's it.
   * Then listen for changes from the user.
   * */
  useEffect(() => {
    setStateTheme(
      createTheme({
        palette: {
          mode: prefersDarkMode ? "dark" : "light",
        },
      })
    )
    // If the change is done from the browser, notify the store.
    // Otherwise, some times the first click on the toggle theme will do nothing.
    dispatch(setTheme({ theme: prefersDarkMode ? "dark" : "light" }))
  }, [prefersDarkMode])

  /**
   * Get inbox messages based on userId
   * @param currentUser.id
   * */
  const {
    data: inboxMessages,
    isError: isErrorInbox,
    error: errorInbox,
    refetch: refetchInbox,
  } = useInboxListenerQuery(currentUser.id, { refetchOnReconnect: true, skip: !currentUser.id })

  /**
   * For useInboxListenerQuery
   * Checks for errors generated from the RTKQ and errors generated from Firebase
   * */
  useEffect(() => {
    if (((isErrorInbox && errorInbox) || (inboxMessages && inboxMessages.error)) && !inboxError) {
      setInboxError([isErrorInbox, errorInbox, inboxMessages], "ambiguousSource")
    }
  }, [isErrorInbox, errorInbox, inboxMessages])

  /**
   * For useInboxListenerQuery
   * When error is caught show the modal
   * */
  useEffect(() => {
    if (inboxError) dispatch(setModal({ message: inboxError }))
  }, [inboxError])

  /**
   * Updates the document title based on the number of inbox messages.
   * It checks if there are any inbox messages and if so, it sets the inbox data in the store and updates
   * the document title to include the number of messages in parentheses.
   * If there are no inbox messages, it sets the inbox data in the store to null
   * and removes the parentheses and message count from the document title.
   * The hook is triggered whenever there is a change in the `inboxMessages` or`userRooms` variables.
   * */
  useEffect(() => {
    if (inboxMessages && inboxMessages.data.length > 0) {
      dispatch(setInbox({ inboxData: inboxMessages.data }))

      // add to title
      const indexOfBracket = document.title.indexOf("(")
      if (indexOfBracket > -1) {
        document.title = document.title.slice(0, indexOfBracket)
      }
      document.title = document.title + `(${inboxMessages.data.length})`
    } else {
      dispatch(setInbox({ inboxData: null }))
      // remove from title
      const indexOfBracket = document.title.indexOf("(")
      if (indexOfBracket > -1) {
        document.title = document.title.slice(0, indexOfBracket)
      }
    }
  }, [inboxMessages, userRooms])

  /**
   * For onAuthStateChanged
   * When error is caught show the modal
   * */
  useEffect(() => {
    if (loginError) {
      dispatch(setModal({ message: loginError }))
    }
  }, [loginError])

  useEffect(() => {
    /** If in DEV */
    if (document.location.hostname === "localhost") {
      document.title = "TTodorov DEV"
      setLocalHost(true)
    } else {
      /** If we are in PROD and the user is not logged in, signIn the user anonymously */
      document.title = "TTodorov"
      let type = "Logged"
      if (!authCtx.isLoggedIn) {
        type = "GuestUser"
        // anonymousSignIn()
        signInWithEmailAndPassword(getAuth(), "guestuser@abvg.bg", "1234as")
      }
      addLog({ type, env: "Prod" })
    }

    // User language preference
    let userDefaultLang = localStorage.getItem("lang")
    userDefaultLang = userDefaultLang ? userDefaultLang : defaultLang

    // Send preferences to the store
    dispatch(setUserPreferences({ lang: userDefaultLang as keyof Langs }))
  }, [])

  /**
   * Uses Firebase to sign in without any credentials
   * The main reason is to log errors in Firebase in case login with other methods fails
   */
  const anonymousSignIn = () => {
    try {
      signInAnonymously(getAuth())
      //setSuccessFulLogin(successModal.anonymous);
    } catch (error: any) {}
  }

  /** The hook that attaches the onAuthStateChanged firebase listener */
  useEffect(() => {
    return onAuthStateChanged(getAuth(), async (user: any) => {
      // From firebase - if we have user, we are guaranteed that the user is signed in
      if (user) {
        try {
          // The signed-in user info.
          const getIdTokenResult = await user.getIdTokenResult()
          if (getIdTokenResult) {
            if (!user.isAnonymous && !userHasDataInStore) {
              let userObj: UserData = {
                id: user.uid,
                names: user.displayName ? user.displayName : user.email,
                email: user.email,
                profilePic: user.photoURL && !localHost ? user.photoURL : null, // Got 403 for too many requests of the image
              }

              // Add user to firebase
              const checkUser = await addUserData(userObj).unwrap()
              // If we have userData, the user may have saved data in db
              if (checkUser.userData) {
                userObj = { ...userObj, ...checkUser.userData }
              } else if (checkUser.error) {
                dispatch(setModal({ message: getError(checkUser.error) }))
              }

              // Add user to context
              authCtx.login(getIdTokenResult.token, getIdTokenResult.expirationTime)
              // Add user to store
              dispatch(setUserData(userObj))

              // If we were send to the auth screen automatically because we were logged out
              // we will be send back to the previous screen
              const navigateTo = window.location.pathname === "/auth" ? "/" : window.location.pathname
              navigate(navigateTo)
              addLog({ type: "User signed in", data: userObj })
              console.log("Signed in")
            } else if (user.isAnonymous && authCtx.isLoggedIn) {
              addLog({ type: "User logout", currentUser })

              // If the user didn't login, but there is data in local storage
              // Context, local storage, state
              authCtx.logout()
              // Store
              dispatch(clearUserData())
              dispatch(clearNavData())
              dispatch(clearChatData())
            }
            dispatch(setModal({ useModal: false }))
          }
        } catch (err) {
          setLoginError([err], "ambiguousSource")
        }
      } else if (authCtx.isLoggedIn) {
        /** If the user has logged out by request or automatically, clear the login data */
        // Context
        authCtx.logout()
        // Store
        dispatch(clearUserData())
        dispatch(clearNavData())
        dispatch(clearChatData())

        console.log("Signed out")
      }
    })
  }, [onAuthStateChanged])

  /** Displays a notification if the user is offline and if the user was offline and is now, online */
  useEffect(() => {
    if (isOnline && wasOffline) {
      setNotif(true)
      setNotifMsg("online")
      resetOnlineStatus()
    } else if (!isOnline) {
      setNotif(true)
      setNotifMsg("offline")
    }
  }, [isOnline])

  return (
    <ThemeProvider theme={stateTheme}>
      <CssBaseline enableColorScheme />
      <Grid
        container
        spacing={0}
        direction="row"
        alignItems="flex-start"
        justifyContent="center"
        sx={{
          minHeight: "100vh",
          minWidth: "100vw",
          maxHeight: "100vh",
          maxWidth: "100vw",
        }}
      >
        <Modal />
        <Navigation />
        <Outlet />

        <Snackbar
          open={notif}
          onClose={() => setNotif(false)}
          autoHideDuration={20000}
          message={`You are currently ${notifMsg}!`}
          key={"top" + "center"}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          sx={{ display: "block", textAlign: "center" }}
        />
      </Grid>
    </ThemeProvider>
  )
}

export default App
