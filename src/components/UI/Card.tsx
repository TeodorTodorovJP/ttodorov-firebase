import { ReactNode } from "react";
import classes from "./Card.module.css";
// import "./Card.css";
// import mySvg from "./mySvg.svg";

/**
 * Card Component
 *
 * A simple, reusable Card component for wrapping children components. Additional classes can be provided for customization.
 *
 * Props - description of all props.
 * - children: ReactNode elements that will be wrapped within the card.
 * - additionalClass: Optional additional CSS class string for custom styling.
 *
 */
export const Card = (props: { children: ReactNode; additionalClass?: string }) => {
  const additionalClass = props.additionalClass ? ` ${classes[props.additionalClass]}` : "";

  return <div className={`${classes.card} ${additionalClass}`}>{props.children}</div>;
};

export default Card;
