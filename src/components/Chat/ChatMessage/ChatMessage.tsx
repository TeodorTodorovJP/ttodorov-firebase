import { memo, ReactElement, ReactNode, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { getBlobUrl } from "../../../app/utils";
import { addImageBlobUrl, selectImageBlobUrl, UserData } from "../../Auth/userSlice";
import { MessageData } from "../chatSlice";
import classes from "./ChatMessage.module.css";

const ChatMessage = (props: { isLast: boolean; data: MessageData; otherUser: UserData }) => {
  const { name, userId, text, timestamp, profilePicUrl, imageUrl } = props.data;
  const { id: otherUserId, names: otherNames, email: otherEmail, profilePic: otherPic } = props.otherUser;

  const images = useAppSelector(selectImageBlobUrl);
  const dispatch = useAppDispatch();
  const messageRef = useRef<HTMLDivElement>(null);

  const imageData = images(imageUrl)[0];

  useEffect(() => {
    if (props.isLast) messageRef.current?.focus();
  }, [messageRef]);

  useEffect(() => {
    let revoke: Function | null;
    if (imageUrl) {
      if (!imageData) {
        const getData = async () => {
          const { blobUrl, revokeUrl } = await getBlobUrl(imageUrl);
          revoke = revokeUrl;
          dispatch(addImageBlobUrl({ imageUrl, blobUrl }));
        };
        getData();
      }
    }

    return () => (revoke ? revoke(imageUrl) : null);
  }, [imageUrl]);

  // Adds a size to Google Profile pics URLs.
  const addSizeToGoogleProfilePic = (url: string) => {
    if (url.indexOf("googleusercontent.com") !== -1 && url.indexOf("?") === -1) {
      return url + "?sz=150";
    }
    return url;
  };

  let messageContent = <p></p>;
  const isOther = userId === otherUserId;

  const sideClass = isOther ? classes.leftSide : classes.rightSide;

  if (profilePicUrl) {
    let backgroundImage = "url(" + addSizeToGoogleProfilePic(profilePicUrl) + ")";
    messageContent = <p style={{ backgroundImage: backgroundImage }}>{text}</p>;
  }
  // if (props.imageUrl) {
  //     content = <img src={props.imageUrl + "&" + new Date().getTime()} alt="Girl in a jacket" width="500" height="600"/>
  // }
  return (
    <div className={sideClass} ref={messageRef}>
      {text && <p className={classes.text}>{text}</p>}
      {imageData && <img className={classes.image} src={imageData.blobUrl} alt="image can't load" />}
    </div>
  );

  // '<div class="spacing"><div class="pic"></div></div>' +
  // '<div class="message"></div>' +
  // '<div class="name"></div>' +
};

export default ChatMessage;
