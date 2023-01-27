import { useState } from "react";
import NavElement from "../UI/NavElement";
import classes from "./Navigation.module.css";
import { ReactComponent as HamburgerMenu } from "../UI/SVG/hamburger-menu.svg";
import { ReactComponent as AccountSVG } from "./icons/account.svg";

import Logo from "../UI/SVG/logo.svg";

import useAuthContext from "../../app/auth-context";
import Card from "../UI/Card";
import { iteratorSymbol } from "immer/dist/internal";

// import "./Card.css";
// import mySvg from "./mySvg.svg";

const Navigation = (props: {
  theme: { main: string; light: string; medium: string; hard: string };
  changeTheme: Function;
  allThemes: { red: string; green: string; blue: string };
  changeThemeStyle: Function;
}) => {
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

  const authCtx = useAuthContext();
  const { isLoggedIn, logout } = authCtx;

  const logoutHandler = () => {
    logout();
  };

  const [navLeftVisible, setNavLeftVisible] = useState(false);

  let navLeftShowClass = navLeftVisible ? classes.navLeftItemsShow : classes.navLeftItemsHide;
  const navLeftClickHandle = () => {
    setNavLeftVisible(!navLeftVisible);
  };

  const [navRightVisible, setNavRightVisible] = useState(false);
  const [showThemes, setShowThemes] = useState(false);

  let navRightShowClass = navRightVisible ? classes.navRightItemsShow : classes.navRightItemsHide;
  const navRightClickHandle = () => {
    setNavRightVisible(!navRightVisible);
    setShowThemes(false);
  };

  const changeThemeHandle = (theme: string) => {
    props.changeTheme(theme);
  };

  const changeThemeStyleHandle = (theme: string) => {
    props.changeThemeStyle(theme);
  };

  let themesOptionsClass = showThemes ? classes.themesShow : classes.themesHide;
  const handleToggleTheme = () => {
    setShowThemes(!showThemes);
  };

  return (
    <>
      <header className={`${classes[props.theme.main]}`}>
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
                  /*!isLoggedIn &&*/ <NavElement
                    path="auth"
                    customStylingClass={`${"buttonStyling"} ${props.theme.hard}`}
                  >
                    Login
                  </NavElement>
                }
                {
                  /*isLoggedIn &&*/ <NavElement
                    path="/"
                    customStylingClass={`${"buttonStyling"} ${props.theme.hard}`}
                    onClick={logoutHandler}
                  >
                    Logout
                  </NavElement>
                }
                {
                  /*isLoggedIn &&*/ <button
                    type="button"
                    className={`buttonStyling ${props.theme.hard}`}
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
                    onClick={() => changeThemeHandle(props.allThemes.red)}
                  >
                    R
                  </button>
                  <button
                    type="button"
                    className={`${classes.themeBtn} ${classes.green}`}
                    onClick={() => changeThemeHandle(props.allThemes.green)}
                  >
                    G
                  </button>
                  <button
                    type="button"
                    className={`${classes.themeBtn} ${classes.blue}`}
                    onClick={() => changeThemeHandle(props.allThemes.blue)}
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
