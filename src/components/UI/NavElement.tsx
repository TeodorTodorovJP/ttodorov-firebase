import classes from "./NavElement.module.css";
import { NavLink } from "react-router-dom";
import { ReactNode } from "react";
// import "./Card.css";
// import mySvg from "./mySvg.svg";

const NavElement = (props: { children: ReactNode; path: string; customStylingClass?: string }) => {
  // @ts-ignor
  const stateAndClass = ({ isActive, isPending }: { isActive: boolean; isPending: boolean }) => {
    const state = isActive ? `${classes.active}` : isPending ? `${classes.pending}` : "";
    const customStylingClass = props.customStylingClass ? props.customStylingClass : "";
    const allClasses = `${state} ${classes[customStylingClass]}`;
    return allClasses;
  };

  return (
    <NavLink to={props.path} className={stateAndClass}>
      {props.children}
    </NavLink>
  );
};

export default NavElement;
