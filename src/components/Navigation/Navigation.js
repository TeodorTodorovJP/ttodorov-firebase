import { useState } from "react";
import NavElement from "../UI/NavElement";
import classes from "./Navigation.module.css";
import { ReactComponent as HamburgerMenu } from "../UI/SVG/hamburger-menu.svg";
import { NavLink } from "react-router-dom";
import AuthContext from "../../app/auth-context";
import { useContext } from "react";

// import "./Card.css";
// import mySvg from "./mySvg.svg";

const Navigation = (props) => {
  const navItems = [
    { path: "/auth", text: "Authenticate" },
    { path: "/counter", text: "Your Counter" },
  ].map((link) => (
    <NavElement key={link.path} path={link.path}>
      {link.text}
    </NavElement>
  ));

  const authCtx = useContext(AuthContext);
  const isLoggedIn = authCtx.isLoggedIn;

  const logoutHandler = () => {
    authCtx.logout();
    // optional: redirect the user
  };

  const [navVisible, setNavVisible] = useState(false);

  let navClass = navVisible ? classes.navItemsShow : classes.navItemsHide;
  const navClickHandle = () => {
    setNavVisible(!navVisible);
  };

  return (
    <>
      <header className={`${classes.navigation}`}>
        <button type="button" onClick={navClickHandle}>
          <HamburgerMenu />
        </button>

        <nav className={`${classes.navItems} ${navClass}`}>
          {navItems}

          {isLoggedIn && <button onClick={logoutHandler}>Logout</button>}
        </nav>
      </header>
    </>
  );
};

export default Navigation;
