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

const ChatUser = (props: { currentUser: UserData; otherUser: UserData }) => {
  const dispatch = useAppDispatch()
  const inboxData = useAppSelector(selectInbox)
  const images = useAppSelector(selectImageBlobUrl)
  const activeRoom = useAppSelector(selectActiveRoom)

  const [profileImage, setProfileImage] = useState<ReactElement>()
  const [imageData, setImageData] = useState<Image | null>(null)
  const [showUserInfo, setShowUserInfo] = useState<boolean>(false)
  const [showInboxPop, setShowInboxPop] = useState<boolean>(false)

  const { id: userId, names: userNames, profilePic: profilePic, profilePicStored: profilePicStored } = props.currentUser

  const {
    id: otherUserId,
    names: otherUserNames,
    profilePic: otherProfilePic,
    profilePicStored: otherProfilePicStored,
  } = props.otherUser

  if (
    (otherProfilePicStored && !imageData) ||
    (otherProfilePicStored && imageData && otherProfilePicStored !== imageData.imageUrl)
  ) {
    const foundImage = images(otherProfilePicStored)[0]
    if (foundImage) setImageData(foundImage)
  }

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
