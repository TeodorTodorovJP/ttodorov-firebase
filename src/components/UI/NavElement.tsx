import { NavLink } from "react-router-dom";
import { ReactNode } from "react";
import "./NavElement.css";
import { useAppDispatch } from "../../app/hooks";
import { setAllOpenToFalse } from "../Navigation/navigationSlice";
// import mySvg from "./mySvg.svg";

/**
 * NavElement Component
 *
 * A navigation component that represents an individual navigational item on the navigation bar. Can be active, pending, or neither. It supports custom styling and a custom onClick function.
 *
 * Props:
 * - children: The child components to be rendered inside the NavElement.
 * - path: The path to which the NavLink points.
 * - customStylingClass: (Optional) A custom CSS class name for additional styling of the NavElement.
 * - onClick: (Optional) A custom function that is executed when the NavElement is clicked.
 *
 * Functions:
 * - stateAndClass: Returns the CSS class string for the component, determining if it is active or pending and including any custom styling classes.
 * - handleClick: Executes the custom onClick function provided in the props, if it exists.
 */
export const NavElement = (props: { children: ReactNode; path: string; customStylingClass?: string; onClick?: Function }) => {
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
