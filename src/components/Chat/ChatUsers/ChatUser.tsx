import { ReactElement, useEffect, useState } from "react";
import classes from "./ChatUsers.module.css";
import { ReactComponent as AccountSVG } from "../../UI/SVG/account.svg";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { addImageBlobUrl, Image, selectImageBlobUrl, selectUserData, UserData } from "../../Auth/userSlice";
import { openNewRoom } from "../chatSlice";
import { getBlobUrl } from "../../../app/utils";
import Card from "../../UI/Card";

const ChatUser = (props: { currentUser: UserData; otherUser: UserData }) => {
  const dispatch = useAppDispatch();
  const images = useAppSelector(selectImageBlobUrl);

  const [profileImage, setProfileImage] = useState<ReactElement>();
  const [imageData, setImageData] = useState<Image | null>(null);
  const [showUserInfo, setShowUserInfo] = useState<boolean>(false);

  const {
    id: userId,
    names: userNames,
    profilePic: profilePic,
    profilePicStored: profilePicStored,
  } = props.currentUser;

  const {
    id: otherUserId,
    names: otherUserNames,
    profilePic: otherProfilePic,
    profilePicStored: otherProfilePicStored,
  } = props.otherUser;

  if (
    (otherProfilePicStored && !imageData) ||
    (otherProfilePicStored && imageData && otherProfilePicStored !== imageData.imageUrl)
  ) {
    const foundImage = images(otherProfilePicStored)[0];
    if (foundImage) setImageData(foundImage);
  }

  useEffect(() => {
    let revoke: Function | null;
    if (
      (otherProfilePicStored && !imageData) ||
      (otherProfilePicStored && imageData && otherProfilePicStored !== imageData.imageUrl)
    ) {
      const getData = async () => {
        const { blobUrl, revokeUrl } = await getBlobUrl(otherProfilePicStored);
        revoke = revokeUrl;
        dispatch(addImageBlobUrl({ imageUrl: otherProfilePicStored, blobUrl }));
      };
      getData();
    }
    return () => (revoke ? revoke(otherProfilePicStored) : null);
  }, [otherProfilePicStored, imageData]);

  const openRoom = () => {
    let imageSource = "";
    if (imageData) {
      imageSource = imageData.blobUrl;
    } else if (otherProfilePic && !otherProfilePicStored) {
      imageSource = otherProfilePic;
    }
    dispatch(openNewRoom({ userId, userNames, otherUserId, otherUserImage: imageSource, otherUserNames }));
  };

  useEffect(() => {
    let image;
    if (imageData) {
      image = <img className={classes.image} src={imageData.blobUrl} alt="image can't load" />;
    } else if (otherProfilePic && !otherProfilePicStored) {
      image = (
        <img
          className={classes.image}
          onError={({ currentTarget }) => {
            currentTarget.onerror = null; // prevents looping
            setProfileImage(<AccountSVG />);
          }}
          src={otherProfilePic}
        ></img>
      );
    } else {
      image = <AccountSVG />;
    }
    setProfileImage(image);
  }, [imageData, otherProfilePic, otherProfilePicStored]);

  return (
    <div
      className={classes.chatUser}
      onMouseOver={() => setShowUserInfo(true)}
      onMouseOut={() => setShowUserInfo(false)}
      onClick={() => openRoom()}
    >
      {profileImage}
      {showUserInfo && (
        <Card additionalClass="userPopUp">
          <div className={classes.popUp}>{otherUserNames}</div>
        </Card>
      )}
    </div>
  );
};

export default ChatUser;
