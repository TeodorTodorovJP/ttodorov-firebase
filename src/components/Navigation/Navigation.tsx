import { useAppSelector, useAppDispatch } from "../../app/hooks";
import {
  selectTheme,
  selectUser,
  ALL_THEMES,
  setTheme,
  MainObj,
  Modal,
  setModal,
  selectIsOpen,
  setIsOpenToTrue,
  setLang,
  selectLang,
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
import { langs, Langs } from "./NavigationTexts";
import { clearUserData, selectUserData, setUserData } from "../Auth/userSlice";
import { getAuth, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { addImageBlobUrl, Image, selectImageBlobUrl } from "../Auth/userSlice";
import { getBlobUrl } from "../../app/utils";

// import "./Card.css";
// import mySvg from "./mySvg.svg";

const Navigation = () => {
  // Store
  const theme = useAppSelector(selectTheme);
  const lang = useAppSelector(selectLang);
  const { theme: userTheme } = useAppSelector(selectUser);
  const { navLeftVisible, navRightVisible, showThemes } = useAppSelector(selectIsOpen);
  const { profilePic, profilePicStored } = useAppSelector(selectUserData);
  const images = useAppSelector(selectImageBlobUrl);

  const dispatch = useAppDispatch();
  const [imageData, setImageData] = useState<Image | null>(null);

  if ((profilePicStored && !imageData) || (profilePicStored && imageData && profilePicStored !== imageData.imageUrl)) {
    const foundImage = images(profilePicStored)[0];
    if (foundImage) setImageData(foundImage);
  }

  useEffect(() => {
    let revoke: Function | null;
    if (
      (profilePicStored && !imageData) ||
      (profilePicStored && imageData && profilePicStored !== imageData.imageUrl)
    ) {
      const getData = async () => {
        const { blobUrl, revokeUrl } = await getBlobUrl(profilePicStored);
        revoke = revokeUrl;
        dispatch(addImageBlobUrl({ imageUrl: profilePicStored, blobUrl }));
      };
      getData();
    }
    return () => (revoke ? revoke(profilePicStored) : null);
  }, [profilePicStored, imageData]);

  // Texts
  const { main, themeModal } = langs[lang as keyof Langs];

  // Context
  const authCtx = useAuthContext();
  const { isLoggedIn, logout } = authCtx;

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
  ));

  const logoutHandler = () => {
    // Context, local storage, state
    logout();
    // Firebase
    signOut(getAuth());
    // Store
    dispatch(clearUserData());
    // Clear local state
    setImageData(null);
  };

  let navLeftShowClass = navLeftVisible ? classes.navLeftItemsShow : classes.navLeftItemsHide;
  const navLeftClickHandle = () => {
    dispatch(setIsOpenToTrue({ item: "navLeftVisible", isOpen: !navLeftVisible }));
  };

  let navRightShowClass = navRightVisible ? classes.navRightItemsShow : classes.navRightItemsHide;
  const navRightClickHandle = () => {
    dispatch(setIsOpenToTrue({ item: "navRightVisible", isOpen: !navRightVisible }));
    dispatch(setIsOpenToTrue({ item: "showThemes", isOpen: false }));
  };

  const changeThemeHandle = (toTheme: string) => {
    if (toTheme === theme.main) return;

    let changeTheme: MainObj = { main: toTheme } as MainObj;

    dispatch(setTheme(changeTheme));
  };

  const saveThemeHandle = () => {
    const message = themeModal.message.replace("${}", theme.main);

    const modalObj: Modal = {
      action: "changeDefaultTheme",
      header: themeModal.header,
      message: message,
      agree: themeModal.agree,
      deny: themeModal.deny,
    };

    if (theme.main === userTheme) {
      modalObj.message = themeModal.messageDone;
      modalObj.agree = themeModal.agreeDone;
      modalObj.deny = null;
    }

    dispatch(setModal(modalObj));
  };

  let themesOptionsClass = showThemes ? classes.themesShow : classes.themesHide;
  const handleToggleTheme = () => {
    dispatch(setIsOpenToTrue({ item: "showThemes", isOpen: !showThemes }));
  };

  const handleToggleLanguage = () => {
    dispatch(setLang({ lang: lang == "bg" ? "en" : "bg" }));
  };

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
  );
};

export default Navigation;
