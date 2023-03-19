import { memo } from "react";
import classes from "./GenerateProfilePic.module.css";

const GenerateProfilePic = (props: { names: string }) => {
  const names = props.names;
  const nameType = +names.indexOf(".") === -1 ? "name" : "email";

  let firstName = "";
  let secondName = "";
  if (nameType === "name") {
    const namesArr = names.split(" ");
    firstName = namesArr[0];
    secondName = namesArr[namesArr.length - 1] && namesArr[namesArr.length - 1];
  }
  if (nameType === "email") {
    [firstName, secondName] = names.split(".");
  }

  const firstLetter = firstName.charAt(0).toUpperCase();
  const secondLetter = secondName.charAt(0).toUpperCase();

  return (
    <div className={classes.profilePic}>
      <p>{firstLetter}</p>
      <p>{secondLetter}</p>
    </div>
  );
};

export default memo(GenerateProfilePic);
