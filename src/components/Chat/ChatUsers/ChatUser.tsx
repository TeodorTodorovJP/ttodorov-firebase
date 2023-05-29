import { ReactElement, useEffect, useState } from "react";
import classes from "./ChatUsers.module.css";
import { ReactComponent as AccountSVG } from "../../UI/SVG/account.svg";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { addImageBlobUrl, Image, selectImageBlobUrl, selectUserData, UserData } from "../../Auth/userSlice";
import { openNewRoom, selectActiveRoom, selectInbox, selectUserRooms, setInbox } from "../chatSlice"
import { getBlobUrl } from "../../../app/utils"
import Card from "../../UI/Card"
import GenerateProfilePic from "../../UI/generateImages/GenerateProfilePic"
import { InboxMessage } from "../chatApi"

/**
 * ChatUser Component
 * 
 * This component provides a chat user interface for the current user and another user.
 *
 * Props - description of all props in this format.
 * - currentUser: The current logged in user's data, includes id, names, profilePic, profilePicStored.
 * - otherUser: The other user's data that the current user is interacting with, includes id, names, profilePic, profilePicStored.
 *
 * State - short description of all state instances within the component
 * - profileImage: The profile image of the other user in the chat.
 * - imageData: The image data for the profile picture.
 * - showUserInfo: A boolean that determines if user information should be displayed.
 * - showInboxPop: A boolean that determines if an inbox popup should be displayed when new messages arrive.
 *
 * Custom Hooks - short description of all custom hooks within the component
 * - useAppDispatch: A hook that provides the dispatch function from Redux store.
 * - useAppSelector: A hook that provides a memoized selector over the Redux store.
 *
 * Functions - short description of all functions within the component
 * - openRoom: Opens a new chat room and if there are inbox messages, updates the inbox data.
 */
export const ChatUser = (props: { currentUser: UserData; otherUser: UserData }) => {
  /** Access store */
  const dispatch = useAppDispatch()
  const inboxData = useAppSelector(selectInbox)
  const images = useAppSelector(selectImageBlobUrl)
  const activeRoom = useAppSelector(selectActiveRoom)

  /** Local state */
  const [profileImage, setProfileImage] = useState<ReactElement>()
  const [imageData, setImageData] = useState<Image | null>(null)
  const [showUserInfo, setShowUserInfo] = useState<boolean>(false)
  const [showInboxPop, setShowInboxPop] = useState<boolean>(false)

  /** Get the current user data. */
  const { id: userId, names: userNames, profilePic: profilePic, profilePicStored: profilePicStored } = props.currentUser

  /** Get the other user data. */
  const {
    id: otherUserId,
    names: otherUserNames,
    profilePic: otherProfilePic,
    profilePicStored: otherProfilePicStored,
  } = props.otherUser

  /**
   * Checks if we have a stored blob image.
   * If we have one, we set it to the imageData.
   * */
  if (
    (otherProfilePicStored && !imageData) ||
    (otherProfilePicStored && imageData && otherProfilePicStored !== imageData.imageUrl)
  ) {
    const foundImage = images(otherProfilePicStored)[0]
    if (foundImage) setImageData(foundImage)
  }

  /** Checks for inbox messages and if we have, we set the inbox pop message. */
  useEffect(() => {
    let userHasMessages = false
    if (inboxData) {
      Object.values(inboxData)
        .map((obj) => Object.values(obj))
        .flat()
        .forEach((message) => {
          if (message.messagesFrom === otherUserId) {
            // if (activeRoom && activeRoom.roomId) {
            //   if (message.roomId === activeRoom.roomId) {
            //     return
            //   }
            // }
            userHasMessages = true
          }
        })
    }
    setShowInboxPop(userHasMessages)
  }, [inboxData, activeRoom])

  /**
   * If we don't have an image for the other user,
   * use the other user's stored image to get a blob image and add it to the blob images.
   */
  useEffect(() => {
    let revoke: Function | null
    if (
      (otherProfilePicStored && !imageData) ||
      (otherProfilePicStored && imageData && otherProfilePicStored !== imageData.imageUrl)
    ) {
      const getData = async () => {
        const { blobUrl, revokeUrl } = await getBlobUrl(otherProfilePicStored)
        revoke = revokeUrl
        dispatch(addImageBlobUrl({ imageUrl: otherProfilePicStored, blobUrl }))
      }
      getData()
    }
    return () => (revoke ? revoke(otherProfilePicStored) : null)
  }, [otherProfilePicStored, imageData])

  /**
   * Opens a new chat room and if there are inbox messages
   * updates the inbox data.
   * TODO: if the user has read the messages, why not delete them?
   */
  const openRoom = () => {
    let imageSource = ""
    if (imageData) {
      imageSource = imageData.blobUrl
    } else if (otherProfilePic && !otherProfilePicStored) {
      imageSource = otherProfilePic
    }

    if (inboxData) {
      const updatedInbox = Object.values(inboxData)
        .map((obj) => Object.values(obj))
        .flat()
        .map((message) => {
          if (message.messagesFrom === otherUserId) {
            return { ...message, userOpenedRoom: true }
          }
          return message
        })
      dispatch(setInbox({ inboxData: updatedInbox }))
    }

    dispatch(openNewRoom({ userId, userNames, otherUserId, otherUserImage: imageSource, otherUserNames }))
  }

  /** Sets the profile image of the other user in the chat. */
  useEffect(() => {
    let image
    if (imageData) {
      image = <img className={classes.image} src={imageData.blobUrl} alt="image can't load" />
    } else if (otherProfilePic && !otherProfilePicStored) {
      image = (
        <img
          className={classes.image}
          onError={({ currentTarget }) => {
            currentTarget.onerror = null // prevents looping
            setProfileImage(<AccountSVG />)
          }}
          src={otherProfilePic}
        ></img>
      )
    } else {
      image = <GenerateProfilePic names={otherUserNames} className={classes.generatedImage} />
    }
    setProfileImage(image)
  }, [imageData, otherProfilePic, otherProfilePicStored])

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
      {!showUserInfo && showInboxPop && <div className={classes.inboxPopUp}>New messages</div>}
    </div>
  )
}

export default ChatUser;
