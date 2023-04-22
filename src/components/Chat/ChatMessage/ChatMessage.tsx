import { memo, ReactElement, ReactNode, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { getBlobUrl } from "../../../app/utils";
import { addImageBlobUrl, selectImageBlobUrl, UserData } from "../../Auth/userSlice";
import { MessageData } from "../chatSlice";
import classes from "./ChatMessage.module.css";

const ChatMessage = (props: { isFront: boolean; data: MessageData; otherUser: UserData }) => {
  const { name, userId, text, timestamp, profilePicUrl, imageUrl } = props.data;
  const { id: otherUserId, names: otherNames, email: otherEmail, profilePic: otherPic } = props.otherUser;

  const images = useAppSelector(selectImageBlobUrl);
  const dispatch = useAppDispatch();
  const messageRef = useRef<HTMLDivElement>(null);

  const imageData = images(imageUrl)[0];

  useEffect(() => {
    messageRef.current?.scrollIntoView();
  }, []);

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

  const isOther = userId === otherUserId;

  const sideClass = isOther ? classes.leftSide : classes.rightSide;

  const moveFront = props.isFront && !isOther ? classes.moveFront : "";

  return (
    <div className={`${sideClass} ${moveFront}`} ref={messageRef}>
      {text && <p className={classes.text}>{text}</p>}
      {imageData && <img className={classes.image} src={imageData.blobUrl} alt="image can't load" />}
    </div>
  );
};

export default ChatMessage;
