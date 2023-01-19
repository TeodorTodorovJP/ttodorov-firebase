import { useState } from "react";
import NavElement from "../UI/NavElement";
import classes from "./Navigation.module.css";
import { ReactComponent as HamburgerMenu } from "../UI/SVG/hamburger-menu.svg";
import Logo from "../UI/SVG/logo.svg";

import useAuthContext from "../../app/auth-context";
import Card from "../UI/Card";

// import "./Card.css";
// import mySvg from "./mySvg.svg";

const Navigation = () => {
  const navLeftItems = [
    { path: "/", text: "Home", icon: <HamburgerMenu /> },
    { path: "auth", text: "Authenticate", icon: <HamburgerMenu /> },
    { path: "counter", text: "Your Counter", icon: <HamburgerMenu /> },
    { path: "meals", text: "Your Meals", icon: <HamburgerMenu /> },
    { path: "meals/meal", text: "Your Single Meal", icon: <HamburgerMenu /> },
  ].map((link) => (
    <NavElement key={link.path} path={link.path}>
      {link.icon}
    </NavElement>
  ));

  const navRightItems = [
    { path: "/", text: "Home", icon: <HamburgerMenu /> },
    { path: "auth", text: "Authenticate", icon: <HamburgerMenu /> },
    { path: "counter", text: "Your Counter", icon: <HamburgerMenu /> },
    { path: "meals", text: "Your Meals", icon: <HamburgerMenu /> },
    { path: "meals/meal", text: "Your Single Meal", icon: <HamburgerMenu /> },
  ].map((link) => (
    <NavElement key={link.path} path={link.path}>
      {link.icon}
    </NavElement>
  ));

  const authCtx = useAuthContext();
  const isLoggedIn = authCtx.isLoggedIn;

  const logoutHandler = () => {
    authCtx.logout();
    // optional: redirect the user
  };

  const [navLeftVisible, setNavLeftVisible] = useState(false);

  let navLeftShowClass = navLeftVisible ? classes.navLeftItemsShow : classes.navLeftItemsHide;
  const navLeftClickHandle = () => {
    setNavLeftVisible(!navLeftVisible);
  };

  const [navRightVisible, setNavRightVisible] = useState(false);

  let navRightShowClass = navRightVisible ? classes.navRightItemsShow : classes.navRightItemsHide;
  const navRightClickHandle = () => {
    setNavRightVisible(!navRightVisible);
  };

  return (
    <>
      <header className={`${classes.navigation}`}>
        <div className={classes.leftSide}>
          <div className={classes.logoAndBtn}>
            <img src={Logo} alt="" className={classes.logo} />
            <button type="button" onClick={navLeftClickHandle} className={classes.leftMenu}>
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
          <button type="button" onClick={navRightClickHandle} className={classes.rightMenu}>
            <HamburgerMenu />
          </button>
          <nav className={navRightShowClass}>
            <Card additionalClass="navRightItems">
              <div className={classes.navRightItems}>
                {navRightItems}

                {isLoggedIn && <button onClick={logoutHandler}>Logout</button>}
              </div>
            </Card>
          </nav>
        </div>
      </header>
    </>
  );
};

export default Navigation;
