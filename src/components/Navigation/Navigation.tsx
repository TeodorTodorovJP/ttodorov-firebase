import { useAppSelector, useAppDispatch } from "../../app/hooks";
import {
  Modal,
  setModal,
  selectIsOpen,
  setIsOpenToTrue,
  clearNavData,
  selectModal,
  selectWaitingActions,
  removeWaitingAction,
} from "./navigationSlice";

import NavElement from "../UI/NavElement";
import classes from "./Navigation.module.css";
import { ReactComponent as HamburgerMenu } from "./icons/hamburger-menu.svg";
import { ReactComponent as AccountSVG } from "../UI/SVG/account.svg";
import { ReactComponent as SaveSVG } from "./icons/save.svg";
import { ReactComponent as HomeSVG } from "./icons/home.svg";
import { ReactComponent as LoginSVG } from "./icons/login.svg";
import { ReactComponent as CounterSVG } from "./icons/counter.svg";
import { ReactComponent as ChatSVG } from "./icons/chat.svg";
import Logo from "../UI/SVG/logo.svg";
import useAuthContext from "../../app/auth-context";
import Card from "../UI/Card";
import { langs, Langs } from "./navigationTexts"
import {
  clearUserData,
  saveLangToLocalStorage,
  selectUserData,
  selectUserPreferences,
  setUserData,
  setUserPreferences,
} from "../Auth/userSlice"
import { getAuth, signOut } from "firebase/auth"
import { useEffect, useState } from "react"
import { addImageBlobUrl, Image, selectImageBlobUrl } from "../Auth/userSlice"
import { getBlobUrl } from "../../app/utils"
import { clearChatData, selectInbox, setInbox } from "../Chat/chatSlice"
import { toggleSVG } from "../UI/Background/backgroundSlice"
import { ALL_THEMES, MainObj, saveThemeToLocalStorage, selectTheme, setTheme } from "./themeSlice"
import { useNavigate } from "react-router-dom"
// import "./Card.css";
// import mySvg from "./mySvg.svg";

/**
 * Navigation Component
 *
 * This component provides navigation functionalities to the application.
 *
 * Props - This component does not have props.
 *
 * State - short description of all state instances within the component
 * - imageData: Local state holding the image data.
 *
 * Custom Hooks - short description of all custom hooks within the component
 * - useAppDispatch: Hook from Redux toolkit to dispatch actions.
 * - useAppSelector: Hook from Redux toolkit to select values from the state.
 * - useNavigate: Hook from react-router to programmatically navigate between routes.
 * - useAuthContext: Custom hook to use authentication context.
 *
 * Functions - short description of all functions within the component
 * - logoutHandler: Logs out the user by clearing context, local storage, state, Firebase authentication, store data, and local image data.
 * - navLeftClickHandle: Toggles visibility of the left menu.
 * - navRightClickHandle: Toggles visibility of the right menu and hides the themes submenu.
 * - changeThemeHandle: Handles the change of theme based on the passed theme name.
 * - saveThemeHandle: Displays a modal with options to confirm or deny the save theme action.
 * - handleToggleTheme: Toggles visibility of the theme menu.
 * - handleToggleLanguage: Toggles the language between Bulgarian (bg) and English (en).
 * - handleNewMessageNotif: Redirects to the chat page and sets the userClickedNotif flag for all inbox messages.
 */
export const Navigation = () => {
  /** Access store */
  const dispatch = useAppDispatch()
  const theme = useAppSelector(selectTheme)
  const { lang } = useAppSelector(selectUserPreferences)
  const { navLeftVisible, navRightVisible, showThemes } = useAppSelector(selectIsOpen)
  const { profilePic, profilePicStored } = useAppSelector(selectUserData)
  const waitingActions = useAppSelector(selectWaitingActions)
  const inboxData = useAppSelector(selectInbox)
  const images = useAppSelector(selectImageBlobUrl)

  /** Access Router */
  const navigate = useNavigate()

  /** Local state */
  const [imageData, setImageData] = useState<Image | null>(null)

  /**
   * Prepare component data.
   */
  const { main, themeModal } = langs[lang as keyof Langs]

  /** Access Context */
  const authCtx = useAuthContext()
  const { isLoggedIn, logout } = authCtx

  /**
   * If we have not stored the image, store it.
   */
  if ((profilePicStored && !imageData) || (profilePicStored && imageData && profilePicStored !== imageData.imageUrl)) {
    const foundImage = images(profilePicStored)[0]
    if (foundImage) setImageData(foundImage)
  }

  /**
   * If we have a waiting action "changeDefaultTheme", saveThemeToLocalStorage.
   * The reasons for this setup:
   * 1 - The reducer action should not do side effects. (changing the local storage)
   * 2 - The task is performed by a thunk "saveThemeToLocalStorage", which cannot be called by extraReducers.
   * */
  useEffect(() => {
    if (waitingActions.length > 0) {
      if (waitingActions.includes("changeDefaultTheme")) {
        dispatch(saveThemeToLocalStorage())
        dispatch(removeWaitingAction({ waitingAction: "changeDefaultTheme" }))
      }
    }
  }, [waitingActions])

  /**
   * If the current user has an image but is not yet loaded or
   * use the user's image has changed, add the new image to the list.
   */
  useEffect(() => {
    let revoke: Function | null
    if (
      (profilePicStored && !imageData) ||
      (profilePicStored && imageData && profilePicStored !== imageData.imageUrl)
    ) {
      const getData = async () => {
        const { blobUrl, revokeUrl } = await getBlobUrl(profilePicStored)
        revoke = revokeUrl
        dispatch(addImageBlobUrl({ imageUrl: profilePicStored, blobUrl }))
      }
      getData()
    }
    return () => (revoke ? revoke(profilePicStored) : null)
  }, [profilePicStored, imageData])

  /** Prepare all links for the left menu. */
  const navLeftItems = [
    { path: "/", text: "Home", icon: <HomeSVG /> },
    { path: "auth", text: "Authenticate", icon: <LoginSVG /> },
    { path: "counter", text: "Your Counter", icon: <CounterSVG /> },
    { path: "chat", text: "Chat", icon: <ChatSVG /> },
    // { path: "meals/meal", text: "Your Single Meal", icon: <HamburgerMenu /> },
  ].map((link) => (
    <NavElement key={link.path} path={link.path} customStylingClass={theme.svg}>
      {link.icon}
    </NavElement>
  ))

  /**
   * Logout the user by clearing context, local storage, state, Firebase authentication,
   * store data, and local image data.
   */
  const logoutHandler = () => {
    // Context, local storage, state
    logout()
    // Firebase
    signOut(getAuth())
    // Store
    dispatch(clearUserData())
    dispatch(clearNavData())
    dispatch(clearChatData())
    // Clear local state
    setImageData(null)
  }

  /** Toggling the left menu. */
  let navLeftShowClass = navLeftVisible ? classes.navLeftItemsShow : classes.navLeftItemsHide
  const navLeftClickHandle = () => {
    dispatch(setIsOpenToTrue({ item: "navLeftVisible", isOpen: !navLeftVisible }))
  }

  /** Toggling the right menu. */
  let navRightShowClass = navRightVisible ? classes.navRightItemsShow : classes.navRightItemsHide
  const navRightClickHandle = () => {
    dispatch(setIsOpenToTrue({ item: "navRightVisible", isOpen: !navRightVisible }))
    /** If the right menu is opened or closed, always hide the themes submenu. */
    dispatch(setIsOpenToTrue({ item: "showThemes", isOpen: false }))
  }

  /**
   * @param toTheme - the name of the theme, can be SVG and one of the main themes
   * @typeParam toTheme - string
   */
  const changeThemeHandle = (toTheme: string) => {
    /** @description - If the new theme is the same, return */
    if (toTheme === theme.main) return

    /** @description - If 'toTheme' is 'svg' include to the theme the svg effect */
    if (toTheme === "svg") {
      dispatch(toggleSVG())
    } else {
      /** @description - If 'toTheme' is any of the MainObj themes set the regular theme */
      let changeTheme: MainObj = { main: toTheme } as MainObj
      dispatch(setTheme(changeTheme))
    }
  }

  /**
   * Displays a modal message with options to confirm or deny
   * the save theme action.
   * Depending on the response, the modal will handle the action.
   */
  const saveThemeHandle = () => {
    const message = themeModal.message.replace("${}", theme.main)

    const modalObj: Modal = {
      action: "changeDefaultTheme",
      header: themeModal.header,
      message: message,
      agree: themeModal.agree,
      deny: themeModal.deny,
    }

    const currentTheme = localStorage.getItem("theme")
    if (theme.main === currentTheme) {
      modalObj.message = themeModal.messageDone
      modalObj.agree = themeModal.agreeDone
      modalObj.deny = null
    }

    dispatch(setModal(modalObj))
  }

  /** Hides/shows the theme menu. */
  let themesOptionsClass = showThemes ? classes.themesShow : classes.themesHide
  const handleToggleTheme = () => {
    dispatch(setIsOpenToTrue({ item: "showThemes", isOpen: !showThemes }))
  }

  /** Toggles the languages between bg and en. */
  const handleToggleLanguage = () => {
    const setLang = lang == "bg" ? "en" : "bg"
    dispatch(setUserPreferences({ lang: setLang }))
    dispatch(saveLangToLocalStorage())
  }

  /**
   * If there are unread messages and the user is not in the chat page,
   * there will be a chat icon to notify the user.
   * When clicking it, it will lead to the chat page.
   */
  const handleNewMessageNotif = () => {
    if (inboxData) {
      const updatedInbox = Object.values(inboxData)
        .map((obj) => Object.values(obj))
        .flat()
        .map((message) => {
          return { ...message, userClickedNotif: true }
        })
      dispatch(setInbox({ inboxData: updatedInbox }))
    }
    navigate("/chat")
  }

  const isInChat = window.location.pathname === "/chat"

  return (
    <>
      <header className={`${classes[theme.main]}`}>
        <div className={classes.leftSide}>
          <div className={classes.logoAndBtn}>
            <img src={Logo} alt="" className={classes.logo} />
            <button
              type="button"
              onClick={navLeftClickHandle}
              className={`${classes.leftMenuBtn} ${theme.decoration} ${theme.svg}`}
            >
              <HamburgerMenu />
            </button>
            {inboxData && !isInChat && (
              <button onClick={() => handleNewMessageNotif()} className={classes.newMessages}>
                <ChatSVG />
              </button>
            )}
          </div>

          <nav className={navLeftShowClass}>
            <Card additionalClass="navLeftItems">
              <div className={`${classes.navLeftItems}`}>{navLeftItems}</div>
            </Card>
          </nav>
        </div>

        <div className={classes.rightSide}>
          <button type="button" onClick={navRightClickHandle} className={`${classes.rightMenuBtn} ${theme.svg}`}>
            {imageData ? (
              <img className={classes.profilePic} src={imageData.blobUrl}></img>
            ) : profilePic ? (
              <img className={classes.profilePic} src={profilePic}></img>
            ) : (
              <AccountSVG />
            )}
          </button>
          <div className={navRightShowClass}>
            <Card additionalClass="navRightItems">
              <div className={classes.navRightItems}>
                {isLoggedIn && (
                  <NavElement path="profile" customStylingClass={theme.button}>
                    {main.profile}
                  </NavElement>
                )}
                {!isLoggedIn && (
                  <NavElement path="auth" customStylingClass={theme.button}>
                    {main.login}
                  </NavElement>
                )}
                {isLoggedIn && (
                  <NavElement path="/" customStylingClass={theme.button} onClick={logoutHandler}>
                    {main.logout}
                  </NavElement>
                )}
                {isLoggedIn && (
                  <button type="button" className={theme.button} onClick={handleToggleTheme}>
                    {main.themes}
                  </button>
                )}
                <button type="button" className={theme.button} onClick={handleToggleLanguage}>
                  {lang == "bg" ? "English" : "Български"}
                </button>
              </div>
            </Card>
            <div className={themesOptionsClass}>
              <Card additionalClass="themes">
                <div className={classes.themes}>
                  <button
                    type="button"
                    className={`${classes.themeBtn} hover ${classes.red}`}
                    onClick={() => changeThemeHandle(ALL_THEMES.red)}
                  >
                    R
                  </button>
                  <button
                    type="button"
                    className={`${classes.themeBtn} hover ${classes.green}`}
                    onClick={() => changeThemeHandle(ALL_THEMES.green)}
                  >
                    G
                  </button>
                  <button
                    type="button"
                    className={`${classes.themeBtn} hover ${classes.blue}`}
                    onClick={() => changeThemeHandle(ALL_THEMES.blue)}
                  >
                    B
                  </button>
                  <button
                    type="button"
                    className={`${classes.themeBtn} hover ${classes.blue}`}
                    onClick={() => changeThemeHandle(ALL_THEMES.svg)}
                  >
                    <p style={{ fontSize: "0.8rem" }}>SVG</p>
                  </button>
                  <button type="button" className={`${classes.saveSVG} hover`} onClick={() => saveThemeHandle()}>
                    <SaveSVG />
                  </button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}

export default Navigation;
