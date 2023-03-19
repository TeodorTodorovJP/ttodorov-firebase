import { ReactElement, useEffect, useState } from "react";
import classes from "./ChatFriends.module.css";
import { ReactComponent as AccountSVG } from "../../UI/SVG/account.svg";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectUserData } from "../../Auth/userSlice";
import { FriendsContent, openNewRoom, selectFriends } from "../chatSlice";

const ChatFriend = (props: { otherUser: FriendsContent }) => {
  const dispatch = useAppDispatch();
  const { id: userId } = useAppSelector(selectUserData);

  const [profileImage, setProfileImage] = useState<ReactElement>();

  const { id: otherUserId, names: otherUserNames, profilePic } = props.otherUser;

  const openRoom = () => {
    dispatch(openNewRoom({ userId, otherUserId, otherUserNames }));
  };

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
    <div className={classes.chatFriend} onClick={() => openRoom()}>
      {profileImage}
    </div>
  );

  // '<div class="spacing"><div class="pic"></div></div>' +
  // '<div class="message"></div>' +
  // '<div class="name"></div>' +
};

export default ChatFriend;
