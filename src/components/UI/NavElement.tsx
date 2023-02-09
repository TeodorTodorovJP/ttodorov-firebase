import { NavLink } from "react-router-dom";
import { ReactNode } from "react";
import "./NavElement.css";
import { useAppDispatch } from "../../app/hooks";
import { setAllOpenToFalse } from "../Navigation/navigationSlice";
// import mySvg from "./mySvg.svg";

const NavElement = (props: { children: ReactNode; path: string; customStylingClass?: string; onClick?: Function }) => {
  const dispatch = useAppDispatch();

  // @ts-ignor
  const stateAndClass = ({ isActive, isPending }: { isActive: boolean; isPending: boolean }) => {
    const state = isActive ? `${"active"}` : isPending ? `${"pending"}` : "";
    const customStylingClass = props.customStylingClass ? props.customStylingClass : "";
    const allClasses = `${state} ${customStylingClass} hover`;
    return allClasses;
  };

  const handleClick = () => {
    if (props.onClick) {
      props.onClick();
    }
  };

  return (
    <NavLink to={props.path} className={stateAndClass} onClick={() => dispatch(setAllOpenToFalse())}>
      <div onClick={handleClick}>{props.children}</div>
    </NavLink>
  );
};

export default NavElement;
