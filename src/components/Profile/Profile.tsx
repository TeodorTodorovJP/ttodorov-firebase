import classes from "./Profile.module.css";

import Card from "../UI/Card";
import { selectUserData } from "../Auth/userSlice";
import { useAppSelector } from "../../app/hooks";
import { ReactElement } from "react";
import { ReactComponent as AccountSVG } from "../UI/SVG/account.svg";
import { selectTheme } from "../Navigation/navigationSlice";

const Profile = () => {
  const { id, names, email, profilePic } = useAppSelector(selectUserData);
  const theme = useAppSelector(selectTheme);

  let idRow = `User id: ${id}`;
  let namesRow = `User names: ${names}`;
  let emailRow = `User email: ${email ? email : "No email"}`;

  let profileImage: ReactElement = <p>No image</p>;

  function addSizeToGoogleProfilePic(url: string) {
    if (url.indexOf("googleusercontent.com") !== -1 && url.indexOf("?") === -1) {
      return url + "?sz=200";
    }
    return url;
  }

  if (profilePic) {
    profileImage = <img src={profilePic}></img>;
  } else {
    profileImage = <AccountSVG />;
  }

  return (
    <Card additionalClass="profile">
      <div className={classes.profile}>
        <h1>Profile page</h1>
        <div className={classes.data}>
          <div className={classes.leftSide}>
            <p>{idRow}</p>
            <p>{namesRow}</p>
            <p>{emailRow}</p>
          </div>
          <div className={`${classes.rightSide} ${theme.svg}`}>{profileImage}</div>
        </div>
      </div>
    </Card>
  );
};

export default Profile;
