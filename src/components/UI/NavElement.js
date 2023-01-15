import classes from "./NavElement.module.css";
import { NavLink } from "react-router-dom";
// import "./Card.css";
// import mySvg from "./mySvg.svg";

const NavElement = (props) => {
  return (
    <NavLink
      to={props.path}
      alt="nav"
      className={({ isActive, isPending }) =>
        isActive
          ? `${classes.nav} ${classes.active}`
          : isPending
          ? `${classes.nav} ${classes.pending}`
          : ""
      }
    >
      {props.children}
    </NavLink>
  );
};

export default NavElement;
