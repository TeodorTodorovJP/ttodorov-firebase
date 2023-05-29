import { memo, ReactElement, ReactNode, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { getBlobUrl } from "../../../app/utils";
import { addImageBlobUrl, selectImageBlobUrl, UserData } from "../../Auth/userSlice";
import { MessageData } from "../chatSlice";
import classes from "./ChatMessage.module.css";

/**
 * Props for the ChatMessage component.
 */
interface ChatMessageProps {
  /**
   * Indicates if the message is displayed on the top side of the chat window and it overlaps with the chat icon.
   */
  isFront: boolean

  /**
   * The message data to display.
   */
  data: MessageData

  /**
   * The data of the other user in the chat.
   */
  otherUser: UserData
}

/**
 * A component that displays a message in a chat window.
 */
export const ChatMessage = memo(({ isFront, data, otherUser }: ChatMessageProps): ReactElement => {
  /** Access store */
  const dispatch = useAppDispatch()

  /** TODO: find if you can add documentation somewhere, that will show when you hover over "images". */
  const images = useAppSelector(selectImageBlobUrl)

  /** Local state */
  const messageRef = useRef<HTMLDivElement>(null)

  /** The data for the current user. */
  const { name, userId, text, timestamp, profilePicUrl, imageUrl } = data

  /** The data for the other user. */
  const { id: otherUserId, names: otherNames, email: otherEmail, profilePic: otherPic } = otherUser

  /** The image url pointing to the browser's memory. */
  const imageData = images(imageUrl)[0]

  /**
   * Used to scroll the chat window to the bottom when a new message is added.
   * TODO: Check if tt triggers when the message is loaded and if it is the last message.
   * */
  useEffect(() => {
    messageRef.current?.scrollIntoView()
  }, [])

  /**
   * When we have imageUrl and we don't yet have imageData.
   * We download the image, get the browser's memory reference and store it.
   * Then the above useEffect triggers and update's the image.
    */
  useEffect(() => {
    let revoke: Function | null
    if (imageUrl) {
      if (!imageData) {
        const getData = async () => {
          const { blobUrl, revokeUrl } = await getBlobUrl(imageUrl)
          revoke = revokeUrl
          dispatch(addImageBlobUrl({ imageUrl, blobUrl }))
        }
        getData()
      }
    }

    return () => (revoke ? revoke(imageUrl) : null)
  }, [imageUrl])

  /** Check if this message is from the other user. */
  const isOther = userId === otherUserId

  /** If this is the other user, place the text at the left, else on the right. */
  const sideClass = isOther ? classes.leftSide : classes.rightSide

  /** If the message overlaps with the chat icon, we move it to make adjust the view. */
  const moveFront = isFront && !isOther ? classes.moveFront : ""

  return (
    <div className={`${sideClass} ${moveFront}`} ref={messageRef}>
      {text && <p className={classes.text}>{text}</p>}
      {imageData && <img className={classes.image} src={imageData.blobUrl} alt="image can't load" />}
    </div>
  )
})

export default ChatMessage;
