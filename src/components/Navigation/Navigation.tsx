import { useState } from "react";

import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { selectTheme, ALL_THEMES, setTheme, setStyle, GlassObj, MainObj } from "./navigationSlice";

import NavElement from "../UI/NavElement";
import classes from "./Navigation.module.css";
import { ReactComponent as HamburgerMenu } from "../UI/SVG/hamburger-menu.svg";
import { ReactComponent as AccountSVG } from "./icons/account.svg";

import Logo from "../UI/SVG/logo.svg";

import useAuthContext from "../../app/auth-context";
import Card from "../UI/Card";

// import "./Card.css";
// import mySvg from "./mySvg.svg";

const Navigation = () => {
  // Store
  const theme = useAppSelector(selectTheme);
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

  const changeThemeHandle = (theme: string) => {
    let changeTheme: MainObj = { main: theme } as MainObj;

    dispatch(setTheme(changeTheme));
  };

  const changeThemeStyleHandle = (glass: string) => {
    let changeTheme: GlassObj = { glass: glass } as GlassObj;

    dispatch(setStyle(changeTheme));
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
            <button type="button" onClick={navLeftClickHandle} className={classes.leftMenuBtn}>
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
                  /*!isLoggedIn &&*/ <NavElement path="auth" customStylingClass={`${"buttonStyling"} ${theme.button}`}>
                    Login
                  </NavElement>
                }
                {
                  /*isLoggedIn &&*/ <NavElement
                    path="/"
                    customStylingClass={`${"buttonStyling"} ${theme.button}`}
                    onClick={logoutHandler}
                  >
                    Logout
                  </NavElement>
                }
                {
                  /*isLoggedIn &&*/ <button
                    type="button"
                    className={`buttonStyling ${theme.button}`}
                    onClick={handleToggleTheme}
                  >
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
                  <button
                    type="button"
                    className={`${classes.themeBtn} ${classes.glass}`}
                    onClick={() => changeThemeStyleHandle("glassFilter")}
                  >
                    GL
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
