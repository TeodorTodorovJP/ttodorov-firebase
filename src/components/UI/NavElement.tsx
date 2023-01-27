import { NavLink } from "react-router-dom";
import { ReactNode } from "react";
import "./NavElement.css";
// import mySvg from "./mySvg.svg";

const NavElement = (props: { children: ReactNode; path: string; customStylingClass?: string; onClick?: Function }) => {
  // @ts-ignor
  const stateAndClass = ({ isActive, isPending }: { isActive: boolean; isPending: boolean }) => {
    const state = isActive ? `${"active"}` : isPending ? `${"pending"}` : "";
    const customStylingClass = props.customStylingClass ? props.customStylingClass : "";
    const allClasses = `${state} ${customStylingClass}`;
    return allClasses;
  };

  const handleClick = () => {
    if (props.onClick) {
      props.onClick();
    }
  };

  return (
    <NavLink to={props.path} className={stateAndClass}>
      <div onClick={handleClick}>{props.children}</div>
    </NavLink>
  );
};

export default NavElement;
