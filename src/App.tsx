import { useEffect, useState } from "react";
import classes from "./App.module.css";
// import "./App.css";
import Navigation from "./components/Navigation/Navigation";
import { Outlet } from "react-router-dom";
import Background from "./components/UI/Background/Background";
import Modal from "./components/Modal/Modal";
import Notif from "./components/Notif/Notif";

import { useAppDispatch, useAppSelector } from "./app/hooks";
import { defaultLang, setModal, clearNavData } from "./components/Navigation/navigationSlice";
import useAuthContext from "./app/auth-context";
import { Langs } from "./components/Navigation/navigationTexts"
import { getAuth, onAuthStateChanged, signInAnonymously, signOut } from "firebase/auth"
import {
  clearUserData,
  setUserData,
  setUserPreferences,
  UserData,
  userHasData,
  selectUserData,
} from "./components/Auth/userSlice"
import { useNavigate, useLocation } from "react-router-dom"
import { useAddUserDataMutation } from "./components/Auth/userApi"
import useError from "./components/CustomHooks/useError"
import { setNotif } from "./components/Notif/NotifSlice"
import { useOnlineStatus } from "./components/CustomHooks/useOnlineStatus"
import { getError } from "./app/utils"
import { clearChatData, selectUserRooms, setInbox } from "./components/Chat/chatSlice"
import { defaultTheme, MainObj, MainThemes, setTheme } from "./components/Navigation/themeSlice"
import { InboxMessage, useInboxListenerQuery } from "./components/Chat/chatApi"

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

  /** Access Context */
  const authCtx = useAuthContext()

  /** Access Router */
  const navigate = useNavigate()

  /** Local state */
  const [localHost, setLocalHost] = useState(false)

  /** Error hooks */
  const [usersError, setUsersError] = useError()
  const [loginError, setLoginError] = useError()
  const [inboxError, setInboxError] = useError()

  const { isOnline, wasOffline, resetOnlineStatus } = useOnlineStatus()

  /** Add user to firebase */
  const [addUserData, { data: usersData, isLoading: isSendingPost, isError, error }] = useAddUserDataMutation()

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

      // if (!authCtx.isLoggedIn) {
      //   anonymousSignIn();
      // }
    } else {
      /** If we are in PROD and the user is not logged in, signIn the user anonymously */
      document.title = "TTodorov"
      if (!authCtx.isLoggedIn) {
        anonymousSignIn()
      }
    }

    // Local storage section
    // User theme preference
    let userDefaultTheme = localStorage.getItem("theme") as MainThemes | null
    userDefaultTheme = userDefaultTheme ? userDefaultTheme : defaultTheme

    // User language preference
    let userDefaultLang = localStorage.getItem("lang")
    userDefaultLang = userDefaultLang ? userDefaultLang : defaultLang

    // Send preferences to the store
    dispatch(setUserPreferences({ theme: userDefaultTheme, lang: userDefaultLang as keyof Langs }))

    let changeTheme: MainObj = { main: userDefaultTheme } as MainObj
    dispatch(setTheme(changeTheme))
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

              console.log("Signed in")
            } else if (user.isAnonymous && authCtx.isLoggedIn) {
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
      dispatch(setNotif({ notifType: "topBar", contentType: "online" }))
      resetOnlineStatus()
    } else if (!isOnline) {
      dispatch(setNotif({ notifType: "topBar", contentType: "offline" }))
    }
  }, [isOnline])

  return (
    <div className={classes.app}>
      <Modal />
      <Notif />
      <Background />
      <Navigation />
      <div className={classes.outlet}>
        <Outlet />
      </div>
    </div>
  )
}

export default App;
// You can use autocomplete, look how to do it with user permission like popup or alert
// <input id="email" autocomplete="email" name="email" aria-required="true" placeholder="Email" required>
