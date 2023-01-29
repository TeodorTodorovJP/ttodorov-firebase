import { useState } from "react";

import { useAppSelector, useAppDispatch } from "../../app/hooks";
import {
  selectTheme,
  selectUser,
  ALL_THEMES,
  setTheme,
  MainObj,
  Modal,
  defaultTheme,
  setModal,
} from "./navigationSlice";

import NavElement from "../UI/NavElement";
import classes from "./Navigation.module.css";
import { ReactComponent as HamburgerMenu } from "../UI/SVG/hamburger-menu.svg";
import { ReactComponent as AccountSVG } from "./icons/account.svg";
import { ReactComponent as SaveSVG } from "./icons/saveSVG.svg";

import Logo from "../UI/SVG/logo.svg";

import useAuthContext from "../../app/auth-context";
import Card from "../UI/Card";

// import "./Card.css";
// import mySvg from "./mySvg.svg";

const Navigation = () => {
  // Store
  const theme = useAppSelector(selectTheme);
  const { theme: userTheme } = useAppSelector(selectUser);
  const dispatch = useAppDispatch();

  // Context
  const authCtx = useAuthContext();
  const { isLoggedIn, logout } = authCtx;

  // Local state
  const [navLeftVisible, setNavLeftVisible] = useState(false);
  const [navRightVisible, setNavRightVisible] = useState(false);

  const [showThemes, setShowThemes] = useState(false);

  const navLeftItems = [
    { path: "/", text: "Home", icon: <HamburgerMenu /> },
    { path: "auth", text: "Authenticate", icon: <HamburgerMenu /> },
    { path: "counter", text: "Your Counter", icon: <HamburgerMenu /> },
    { path: "meals", text: "Your Meals", icon: <HamburgerMenu /> },
    // { path: "meals/meal", text: "Your Single Meal", icon: <HamburgerMenu /> },
  ].map((link) => (
    <NavElement key={link.path} path={link.path}>
      {link.icon}
    </NavElement>
  ));

  const logoutHandler = () => {
    logout();
  };

  let navLeftShowClass = navLeftVisible ? classes.navLeftItemsShow : classes.navLeftItemsHide;
  const navLeftClickHandle = () => {
    setNavLeftVisible(!navLeftVisible);
  };

  let navRightShowClass = navRightVisible ? classes.navRightItemsShow : classes.navRightItemsHide;
  const navRightClickHandle = () => {
    setNavRightVisible(!navRightVisible);
    setShowThemes(false);
  };

  const changeThemeHandle = (toTheme: string) => {
    if (toTheme === theme.main) return;

    let changeTheme: MainObj = { main: toTheme } as MainObj;

    dispatch(setTheme(changeTheme));
  };

  const saveThemeHandle = () => {
    const message = `Change the default theme to ${theme.main}? Will be save in Local Storage!`;

    const modalObj: Modal = {
      type: "changeDefaultTheme",
      show: true,
      header: "Theme Option",
      message: message,
      agree: "Yes",
      deny: "No",
      response: "deny",
    };

    if (theme.main === userTheme) {
      modalObj.message = "Your theme is already saved!";
      modalObj.agree = "OK";
      modalObj.deny = null;
    }

    dispatch(setModal(modalObj));
  };

  let themesOptionsClass = showThemes ? classes.themesShow : classes.themesHide;
  const handleToggleTheme = () => {
    setShowThemes(!showThemes);
  };

  return (
    <>
      <header className={`${classes[theme.main]}`}>
        <div className={classes.leftSide}>
          <div className={classes.logoAndBtn}>
            <img src={Logo} alt="" className={classes.logo} />
            <button type="button" onClick={navLeftClickHandle} className={`${classes.leftMenuBtn} ${theme.decoration}`}>
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
          <button type="button" onClick={navRightClickHandle} className={classes.rightMenuBtn}>
            <AccountSVG />
          </button>
          <nav className={navRightShowClass}>
            <Card additionalClass="navRightItems">
              <div className={classes.navRightItems}>
                {
                  /*!isLoggedIn &&*/ <NavElement path="auth" customStylingClass={theme.button}>
                    Login
                  </NavElement>
                }
                {
                  /*isLoggedIn &&*/ <NavElement path="/" customStylingClass={theme.button} onClick={logoutHandler}>
                    Logout
                  </NavElement>
                }
                {
                  /*isLoggedIn &&*/ <button type="button" className={theme.button} onClick={handleToggleTheme}>
                    Themes
                  </button>
                }
              </div>
            </Card>
            <div className={themesOptionsClass}>
              <Card additionalClass="themes">
                <div className={classes.themes}>
                  <button
                    type="button"
                    className={`${classes.themeBtn} ${classes.red}`}
                    onClick={() => changeThemeHandle(ALL_THEMES.red)}
                  >
                    R
                  </button>
                  <button
                    type="button"
                    className={`${classes.themeBtn} ${classes.green}`}
                    onClick={() => changeThemeHandle(ALL_THEMES.green)}
                  >
                    G
                  </button>
                  <button
                    type="button"
                    className={`${classes.themeBtn} ${classes.blue}`}
                    onClick={() => changeThemeHandle(ALL_THEMES.blue)}
                  >
                    B
                  </button>
                  <button type="button" className={`${classes.saveSVG}`} onClick={() => saveThemeHandle()}>
                    <SaveSVG />
                  </button>
                </div>
              </Card>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
};

export default Navigation;
