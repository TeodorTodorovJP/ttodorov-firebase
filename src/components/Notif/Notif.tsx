import { MouseEvent } from "react";
import { createPortal } from "react-dom";
import classes from "./Notif.module.css";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import Card from "../UI/Card";
import { langs, Langs } from "./NotifTexts";
import { selectNotif, Notif as NotifType, setNotif } from "./NotifSlice";
import { selectTheme } from "../Navigation/themeSlice";
import { selectUserPreferences } from "../Auth/userSlice";

const Notif = () => {
  // Store
  const notifStore = useAppSelector(selectNotif);
  const { lang: currentLang } = useAppSelector(selectUserPreferences);
  const theme = useAppSelector(selectTheme);

  const dispatch = useAppDispatch();

  // Texts
  const { defaultNotif } = langs[currentLang as keyof Langs];

  const NotifRoot = document.getElementById("notif") as HTMLInputElement | null;

  // Default, show the notification
  let notif: NotifType = {
    ...notifStore,
    useNotif: notifStore.useNotif === false ? false : true,
    agree: defaultNotif.agree,
  };

  if (notif.notifType === "topBar") {
    notif.agree = defaultNotif.agree;
  }

  if (notif.contentType === "online") {
    notif.message = defaultNotif.messageOnline;
  }

  if (notif.contentType === "offline") {
    notif.message = defaultNotif.messageOffline;
  }

  const handleAction = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    dispatch(setNotif({ useNotif: false }));
  };

  const notifStyle = notif.contentType === "online" ? classes.success : classes.error;
  let notifContent: JSX.Element;

  if (notif.notifType === "loader") {
    notifContent = <div className={theme.loader}></div>;
  } else if (notif.notifType === "topBar") {
    notifContent = (
      <div className={`${classes.notifTopBar} ${notifStyle}`}>
        <div className={classes.message}>{notif.message}</div>
        <button name="agree" className={`${theme.button} ${classes.button}`} onClick={handleAction}>
          {notif.agree}
        </button>
      </div>
    );
  } else {
    notifContent = <div className={theme.loader}>Notification Default</div>;
  }

  const notifClass = notif.useNotif ? classes.notifShow : classes.notifHide;

  const notifJSX: JSX.Element = <div className={`${classes.notif} ${notifClass}`}>{notifContent}</div>;

  if (NotifRoot !== null && notif.useNotif) {
    return createPortal(notifJSX, NotifRoot);
  } else {
    return null; // Todo Error handle
  }
};

export default Notif;
