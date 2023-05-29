import { MouseEvent } from "react";
import { createPortal } from "react-dom";
import classes from "./Notif.module.css";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import Card from "../UI/Card";
import { langs, Langs } from "./notifTexts"
import { selectNotif, Notif as NotifType, setNotif } from "./NotifSlice"
import { selectTheme } from "../Navigation/themeSlice"
import { selectUserPreferences } from "../Auth/userSlice"

/**
 * Notif Component
 *
 * The Notif component is a notification handling component. It retrieves
 *
 * user preferences from the Redux store, prepares data for the component and creates
 * notifications based on various conditions. These notifications can be of different types
 * like a top bar notification or loader. It can also provide different messages based on
 * the online/offline status of the user.
 *
 * Props - The component does not accept any props.
 *
 * State - The component does not have any local state, but accesses state from Redux.
 *
 * Custom Hooks - The following custom hooks are used in this component:
 * - useAppDispatch: Used to dispatch actions to the Redux store.
 * - useAppSelector: Used to select and return specific values from the Redux store.
 *
 * Functions - The following functions are used in this component:
 * - handleAction: Handles the action of clicking the notification's button, dispatches
 *   an action to the Redux store to set 'useNotif' to false.
 *
 * Use - This component can be used wherever a notification needs to be displayed to the user.
 * It uses the portal functionality of React to render notifications into a 'notif' root element.
 */
export const Notif = () => {
  /** Access store */
  const dispatch = useAppDispatch()
  const notifStore = useAppSelector(selectNotif)
  const { lang: currentLang } = useAppSelector(selectUserPreferences)
  const theme = useAppSelector(selectTheme)

  /** Prepare component data. */
  const { defaultNotif } = langs[currentLang as keyof Langs]

  /**
   * Prepare the html element to which the modal will be sent.
   * This is a specific case for the "portal" React functionality.
   */
  const NotifRoot = document.getElementById("notif") as HTMLInputElement | null

  /** Default, show the notification. */
  let notif: NotifType = {
    ...notifStore,
    useNotif: notifStore.useNotif === false ? false : true,
    agree: defaultNotif.agree,
  }

  /** Show the notification as a bar at the top. */
  if (notif.notifType === "topBar") {
    notif.agree = defaultNotif.agree
  }

  /** Notify when the user is online. */
  if (notif.contentType === "online") {
    notif.message = defaultNotif.messageOnline
  }

  /** Notify when the user is offline. */
  if (notif.contentType === "offline") {
    notif.message = defaultNotif.messageOffline
  }

  /** Close the notification when clicking it's button. */
  const handleAction = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()

    dispatch(setNotif({ useNotif: false }))
  }

  /** Assign a style depending on it's purpose. TODO: merge it with the top IFs. */
  const notifStyle = notif.contentType === "online" ? classes.success : classes.error
  let notifContent: JSX.Element

  if (notif.notifType === "loader") {
    /** If you just load something. */
    notifContent = <div className={theme.loader}></div>
  } else if (notif.notifType === "topBar") {
    /** Build the whole notification bar. */
    notifContent = (
      <div className={`${classes.notifTopBar} ${notifStyle}`}>
        <div className={classes.message}>{notif.message}</div>
        <button name="agree" className={`${theme.button} ${classes.button}`} onClick={handleAction}>
          {notif.agree}
        </button>
      </div>
    )
  } else {
    /** Default case. */
    notifContent = <div className={theme.loader}>Notification Default</div>
  }

  /** Toggle the visibility. */
  const notifClass = notif.useNotif ? classes.notifShow : classes.notifHide

  /** Prepare the jsx. */
  const notifJSX: JSX.Element = <div className={`${classes.notif} ${notifClass}`}>{notifContent}</div>

  if (NotifRoot !== null && notif.useNotif) {
    return createPortal(notifJSX, NotifRoot)
  } else {
    return null // Todo Error handle
  }
}

export default Notif;
