import { ReactNode } from "react";
import classes from "./Card.module.css";
// import "./Card.css";
// import mySvg from "./mySvg.svg";

const Card = (props: { children: ReactNode; additionalClass?: string; backGround?: string }) => {
  const additionalClass = props.additionalClass ? ` ${classes[props.additionalClass]}` : "";

  // const customBackground = props.backGround
  //   ? { backgroundImage: props.backGround }
  //   : {};
  return (
    <div style={{ backgroundImage: props.backGround }} className={`${classes.card} ${additionalClass}`}>
      {props.children}
    </div>
  );
};

export default Card;
