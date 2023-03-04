import { ReactElement, useEffect, useState } from "react";
import classes from "./ChatFriends.module.css";
import { ReactComponent as AccountSVG } from "../../UI/SVG/account.svg";
import { FriendsContent } from "../Chat";

const ChatFriends = (props: { user: FriendsContent; onClick: Function }) => {
  const [profileImage, setProfileImage] = useState<ReactElement>();

  const { id, names, profilePic } = props.user;
  useEffect(() => {
    let image;
    if (profilePic) {
      image = (
        <img
          className={classes.image}
          onError={({ currentTarget }) => {
            currentTarget.onerror = null; // prevents looping
            setProfileImage(<AccountSVG />);
          }}
          src={profilePic}
        ></img>
      );
    } else {
      image = <AccountSVG />;
    }
    setProfileImage(image);
  }, []);
  // profileImage = <AccountSVG />;
  // if (props.imageUrl) {
  //     content = <img src={props.imageUrl + "&" + new Date().getTime()} alt="Girl in a jacket" width="500" height="600"/>
  // }
  return (
    <div className={classes.chatFriends} onClick={() => props.onClick(id, names)}>
      {profileImage}
    </div>
  );

  // '<div class="spacing"><div class="pic"></div></div>' +
  // '<div class="message"></div>' +
  // '<div class="name"></div>' +
};

export default ChatFriends;
