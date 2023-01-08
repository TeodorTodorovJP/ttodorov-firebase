import { useState } from "react";
import NavElement from "../UI/NavElement";
import classes from "./Navigation.module.css";
import { ReactComponent as HamburgerMenu } from "../UI/SVG/hamburger-menu.svg";

// import "./Card.css";
// import mySvg from "./mySvg.svg";

const Navigation = (props) => {
  const navItems = ["home", "meals", "order", "drinks"].map((n, i) => (
    <NavElement key={i}>{n}</NavElement>
  ));

  const [navVisible, setNavVisible] = useState(false);

  let navClass = navVisible ? classes.navItemsShow : classes.navItemsHide;
  const navClickHandle = () => {
    setNavVisible(!navVisible);
  };

  return (
    <nav className={classes.navigation}>
      <button type="button" onClick={navClickHandle}>
        <HamburgerMenu />
      </button>
      <div className={`${classes.navItems} ${navClass}`}>{navItems}</div>
    </nav>
  );
};

export default Navigation;
