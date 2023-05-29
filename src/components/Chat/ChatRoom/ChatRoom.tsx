import { getAuth } from "firebase/auth";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectUserData, selectUserPreferences, UserData } from "../../Auth/userSlice";
import ChatMessage from "../ChatMessage/ChatMessage";
import { ChatRoomsContent, closeRoom, deleteInboxMessages, selectInbox } from "../chatSlice"
import classes from "./ChatRoom.module.css"
import { langs, Langs } from "../chatTexts"
import { ReactComponent as SendSVG } from "./sendSVG.svg"
import { ReactComponent as ImageSVG } from "../../UI/SVG/imageSVG.svg"
import { ReactComponent as CloseSVG } from "../closeSVG.svg"
import {
  GetMessages,
  useDeleteInboxMessageMutation,
  useGetMessagesQuery,
  useSaveImageMutation,
  useSaveMessageMutation,
  useSendNewRoomDataMutation,
  useSendToInboxMutation,
} from "../chatApi"
import useError from "../../CustomHooks/useError"
import { setModal } from "../../Navigation/navigationSlice"
import { useOnlineStatus } from "../../CustomHooks/useOnlineStatus"
import { getDateDataInUTC, getError } from "../../../app/utils"
import { useGetUserDataQuery } from "../../Auth/userApi"
import { selectTheme } from "../../Navigation/themeSlice"

type ReactArr = React.ReactElement[]
const initReactElArr: ReactArr = []

/**
 * ChatRoom Component
 * This is a `ChatRoom` component that renders a chat room for a web application.
 * It uses various Redux Toolkit Query (RTKQ) hooks and React hooks to handle state, manage side effects, and fetch data from the server.
 *
 * Props
 * - `room`: an object of type `ChatRoomsContent` containing data about the chat room.
 * - `notifyForMessages`: a function that informs the parent "ChatRooms".
 *
 * State
 * - `message`: a string representing the current message being typed by the user.
 * - `otherUser`: an object of type `UserData` representing the data of the other user in the chat room.
 * - `messages`: an array of `React.Element` representing the messages in the chat room.
 * - `usersError`, `messagesError`, `sendRoomDataError`, `saveMsgsError`, `saveImagesError`, `sendInboxError`, `delInboxError`: various error states managed by the `useError` custom hook.
 *
 * Custom Hooks
 * - `useOnlineStatus`: checks whether the user is online.
 * - `useGetUserDataQuery`: fetches user data from Firebase.
 * - `useGetMessagesQuery`: fetches messages for the current room from Firebase.
 * - `useSendNewRoomDataMutation`: sends new room data to Firebase.
 * - `useSaveMessageMutation`: saves a new message to Firebase.
 * - `useSaveImageMutation`: saves a new image to Firebase.
 * - `useDeleteInboxMessageMutation`: deletes an inbox message from Firebase.
 * - `useSendToInboxMutation`: sends a message to the inbox of another user in Firebase.
 *
 * Functions
 * - `sendMessageNotification`: sends a notification for new messages in a chat room.
 * - `saveImgMessage`: saves an image message to a database with the given image URL, room ID, user data, and other user information.
 * - `saveMessage`: saves a message to a database and updates the room data if necessary.
 * - `onMessageFormSubmit`: checks if the user entered a message and is signed in, then saves the message and clears the message text field.
 * - `isUserSignedIn`: checks if a user is signed in by verifying the existence of a current user object.
 * - `handleTouch`: sets a timeout of 500ms and then focuses on a message input reference.
 * - `handleCloseRoom`: dispatches an action to close a room with a specific ID.
 * - `triggerInput`: triggers a click event on an image input element if it exists.
 * - `handleSaveImageBtn`: handles the saving of an image file to a database and displays an error message if the file is not an image.
 *
 * Use
 * The `ChatRoom` component is expected to be used within a context that provides the necessary Redux store and dispatch functions.
 * It handles its own internal state and interactions with the Firebase back-end, so it does not require any specific parent component to function properly.
 * It does, however, require that the `room` prop be supplied an object of type `ChatRoomsContent`, and the `notifyForMessages` prop be supplied a function.
 * When mounted, the `ChatRoom` component will fetch data from Firebase for the specified chat room and its associated messages.
 * It will also handle sending new messages, updating room data, and managing error states associated with these actions.
 * This component is ideally suited to real-time chat applications, and can be used to create a dynamic, interactive chat room experience for users.
 */
export const ChatRoom = (props: { room: ChatRoomsContent; notifyForMessages: Function }) => {
  /** Access store */
  const dispatch = useAppDispatch()
  const { lang: currentLang } = useAppSelector(selectUserPreferences)
  const userData = useAppSelector(selectUserData)
  const theme = useAppSelector(selectTheme)
  const inboxStoreData = useAppSelector(selectInbox)

  /** Local state */
  const [message, setMessage] = useState("")
  const [otherUser, setOtherUser] = useState<UserData | null>(null)
  const [messages, setMessages] = useState(initReactElArr)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const messageInputRef = useRef<HTMLInputElement>(null)

  /** Error hooks */
  const [usersError, setUsersError] = useError()
  const [messagesError, setMessagesError] = useError()
  const [sendRoomDataError, setSendRoomDataError] = useError()
  const [saveMsgsError, setSaveMsgsError] = useError()
  const [saveImagesError, setSaveImagesError] = useError()
  const [sendInboxError, setSendInboxError] = useError()
  const [delInboxError, setDelInboxError] = useError()

  /** Custom hooks */
  const { isOnline } = useOnlineStatus()

  /**
   * Prepare component data.
   */
  const { creator, roomId, otherUserId, otherUserNames, active } = props.room
  const { main } = langs[currentLang as keyof Langs]

  // Query endpoints
  /**
   * Get users from firebase.
   */
  const {
    data: chatUsers, // The latest returned result regardless of hook arg, if present.
    isError: isErrorFr, // When true, indicates that the query is in an error state.
    error: errorFr, // The error result if present.
    //isSuccess, // When true, indicates that the query has data from a successful request.
  } = useGetUserDataQuery()

  /**
   * For useGetUserDataQuery
   * Checks for errors generated from the RTKQ and errors generated from Firebase
   * */
  useEffect(() => {
    if (((isErrorFr && errorFr) || (chatUsers && chatUsers.error)) && !usersError) {
      setUsersError([isErrorFr, errorFr, chatUsers], "ambiguousSource")
    } else if (chatUsers && chatUsers.data) {
      const other = chatUsers.data.filter((user) => user.id == otherUserId)[0]
      if (other) setOtherUser(other)
    }
  }, [isErrorFr, errorFr, chatUsers])

  /**
   * For useGetUserDataQuery
   * When error is caught show the modal
   * */
  useEffect(() => {
    if (usersError) dispatch(setModal({ message: usersError }))
  }, [usersError])

  /** Get messages for the current room from firebase */
  const {
    data: roomMessages,
    isError: isErrorMsgs,
    error: errorMsgs,
    refetch: refetchMessages,
  } = useGetMessagesQuery(roomId, { refetchOnReconnect: true })

  /**
   * For useGetMessagesQuery
   * Checks for errors generated from the RTKQ and errors generated from Firebase
   * */
  useEffect(() => {
    if (((isErrorMsgs && errorMsgs) || (roomMessages && roomMessages.error)) && !messagesError) {
      setMessagesError([isErrorMsgs, errorMsgs, roomMessages], "ambiguousSource")
    }
  }, [isErrorMsgs, errorMsgs, roomMessages])

  /**
   * For useGetMessagesQuery
   * When error is caught show the modal
   * */
  useEffect(() => {
    if (messagesError) dispatch(setModal({ message: messagesError }))
  }, [messagesError])

  /**
   * This function sends a notification for new messages in a chat room.
   * @param {number} oldMessagesLength - `oldMessagesLength` is a number representing the length of the
   * old messages array.
   * @param {GetMessages} newMessages - `newMessages` is an object of type `GetMessages` which contains
   * an array of messages in the `data` property. This parameter is used to compare the length of the new
   * messages array with the old messages array to determine if there are any new messages.
   */
  const sendMessageNotification = (oldMessagesLength: number, newMessages: GetMessages) => {
    if (oldMessagesLength !== newMessages.data.length) {
      const numberOfNewMessages = newMessages.data.length - oldMessagesLength
      props.notifyForMessages(roomId, numberOfNewMessages)
    }
  }

  /**
   * Get's all room messages and passes them to a component.
   * Then based on the messages, "sendMessageNotification" set's the unread messages.
   */
  useEffect(() => {
    if (roomMessages && otherUser) {
      const chatMessagesEl = roomMessages.data.map((messageObj, index) => {
        const { utcMilliseconds } = getDateDataInUTC(messageObj.timestamp)
        const key: React.Key = utcMilliseconds

        return <ChatMessage key={key} isFront={index < 2} data={messageObj} otherUser={otherUser} />
      })
      sendMessageNotification(messages.length, roomMessages)
      setMessages(chatMessagesEl)
    }
  }, [roomMessages, otherUser])

  /**
   * Send room data to firebase.
   */
  const [updateRoomData, { data: dataSRD, isLoading: isUpdating, isError: isErrorSRD, error: errorSRD }] =
    useSendNewRoomDataMutation()

  /**
   * For useSendNewRoomDataMutation
   * Checks for errors generated from the RTKQ and errors generated from Firebase
   * */
  useEffect(() => {
    if (((isErrorSRD && errorSRD) || (dataSRD && dataSRD.error)) && !sendRoomDataError) {
      setSendRoomDataError([isErrorSRD, errorSRD, dataSRD], "ambiguousSource")
    }
  }, [isErrorSRD, errorSRD, dataSRD])

  /**
   * For useSendNewRoomDataMutation
   * When error is caught show the modal
   * */
  useEffect(() => {
    if (sendRoomDataError) dispatch(setModal({ message: sendRoomDataError }))
  }, [sendRoomDataError])

  /**
   * Save message to firebase.
   */
  const [saveMessageToDB, { data: dataSMsgs, isLoading: sendingMessage, isError: isErrorSMsgs, error: errorSMsgs }] =
    useSaveMessageMutation()

  /**
   * For useSaveMessageMutation
   * Checks for errors generated from the RTKQ and errors generated from Firebase
   * */
  useEffect(() => {
    if (((isErrorSMsgs && errorSMsgs) || (dataSMsgs && dataSMsgs.error)) && !saveMsgsError) {
      setSaveMsgsError([isErrorSMsgs, errorSMsgs, dataSMsgs], "ambiguousSource")
    }
  }, [isErrorSMsgs, errorSMsgs, dataSMsgs])

  /**
   * For useSaveMessageMutation
   * When error is caught show the modal
   * */
  useEffect(() => {
    if (saveMsgsError) dispatch(setModal({ message: saveMsgsError }))
  }, [saveMsgsError])

  /**
   * Save image to firebase.
   */
  const [
    saveImageToDB,
    { data: dataSaveImg, isLoading: sendingSaveImg, isError: isErrorSaveImg, error: errorSaveImg },
  ] = useSaveImageMutation()

  /**
   * For useSaveImageMutation
   * Checks for errors generated from the RTKQ and errors generated from Firebase
   * */
  useEffect(() => {
    if (((isErrorSaveImg && errorSaveImg) || (dataSaveImg && dataSaveImg.error)) && !saveImagesError) {
      setSaveImagesError([isErrorSaveImg, errorSaveImg, dataSaveImg], "ambiguousSource")
    }
  }, [isErrorSaveImg, errorSaveImg, dataSaveImg])

  /**
   * For useSaveImageMutation
   * When error is caught show the modal
   * */
  useEffect(() => {
    if (saveImagesError) dispatch(setModal({ message: saveImagesError }))
  }, [saveImagesError])

  /**
   * Delete inbox message from firebase.
   */
  const [delInboxMessage, { data: delInbox, isError: isErrorDelInbox, error: errorDelInbox }] =
    useDeleteInboxMessageMutation()

  /**
   * For useDeleteInboxMessageMutation
   * Checks for errors generated from the RTKQ and errors generated from Firebase
   * */
  useEffect(() => {
    if (((isErrorDelInbox && errorDelInbox) || (delInbox && delInbox.error)) && !delInboxError) {
      setDelInboxError([isErrorDelInbox, errorDelInbox, delInbox], "ambiguousSource")
    }
  }, [isErrorDelInbox, errorDelInbox, delInbox])

  /**
   * For useDeleteInboxMessageMutation
   * When error is caught show the modal
   * */
  useEffect(() => {
    if (delInboxError) dispatch(setModal({ message: delInboxError }))
  }, [delInboxError])

  /**
   * If the current room has unread messages and the current room is active, delete the messages from the store and firebase and cache.
   */
  useEffect(() => {
    if (inboxStoreData) {
      if (inboxStoreData[roomId] && active) {
        dispatch(deleteInboxMessages({ roomId }))
        delInboxMessage({ roomId, userId: creator, otherUserId })
      }
    }
  }, [inboxStoreData])

  /**
   * Send a message to the inbox of the other user to firebase.
   */
  const [sendToInboxDB, { data: inboxData, isError: isErrorInbox, error: errorInbox }] = useSendToInboxMutation()

  /**
   * For useSendToInboxMutation
   * Checks for errors generated from the RTKQ and errors generated from Firebase
   * */
  useEffect(() => {
    if (((isErrorInbox && errorInbox) || (inboxData && inboxData.error)) && !sendInboxError) {
      setSendInboxError([isErrorInbox, errorInbox, inboxData], "ambiguousSource")
    }
  }, [isErrorInbox, errorInbox, inboxData])

  /**
   * For useSendToInboxMutation
   * When error is caught show the modal
   * */
  useEffect(() => {
    if (sendInboxError) dispatch(setModal({ message: sendInboxError }))
  }, [sendInboxError])

  /**
   * This function saves an image message to a database with the given image URL, room ID, user data, and
   * other user information.
   * @param {string} imageUrl - imageUrl is a string parameter that represents the URL of an image that
   * needs to be saved.
   * @param {string} roomId - roomId is a string parameter that represents the unique identifier of a
   * chat room where the image message will be saved.
   * @returns If `otherUser` is `null`, the function will return nothing (i.e., `undefined`).
   */
  const saveImgMessage = (imageUrl: string, roomId: string) => {
    if (otherUser === null) return
    saveMessageToDB({ roomId, userData, otherUser, imageUrl })
  }

  /**
   * This function saves a message to a database and updates the room data if necessary.
   * @param {string} messageText - a string representing the text of the message being saved.
   * @param {string} roomId - A string representing the ID of the chat room where the message will be
   * saved.
   * @returns If `otherUser` is `null`, the function will return without executing the rest of the code.
   * Otherwise, the function will execute the try block and catch any errors that occur. There is no
   * explicit return statement in this function, so it will implicitly return `undefined`.
   */
  const saveMessage = async (messageText: string, roomId: string) => {
    if (otherUser === null) return
    try {
      if (messages.length === 0) {
        // If the room has no messages, it is a new room
        // Create the room in firebase
        await updateRoomData({ roomId, userData, otherUser })
      }
      // Send a message to the inbox of the receiver
      // to notify the user for new messages
      sendToInboxDB({ roomId, userId: userData.id, otherUserId: otherUser.id })
      // After creation, fill the message inside
      await saveMessageToDB({ roomId, userData, otherUser, messageText })
    } catch (error) {
      dispatch(setModal({ message: getError(error) }))
    }
  }

  /**
   * This function checks if the user entered a message and is signed in, and then saves the message and
   * clears the message text field.
   * @param {FormEvent} event - FormEvent - This is the event object that is triggered when the form is
   * submitted. It contains information about the event, such as the target element and any data
   * associated with the event.
   */
  const onMessageFormSubmit = (event: FormEvent) => {
    event.preventDefault()
    // Check that the user entered a message and is signed in.
    if (message.length > 0 && isUserSignedIn() && otherUser !== null) {
      saveMessage(message, roomId)
        .then(() => {
          // Clear message text field and re-enable the SEND button.
          setMessage("")
        })
        .catch((e) => {
          console.log(e)
        })
    }
  }

  /**
   * The function checks if a user is signed in by verifying the existence of a current user object.
   */
  const isUserSignedIn = () => !!getAuth().currentUser

  /**
   * This function sets a timeout of 500ms and then focuses on a message input reference.
   */
  const handleTouch = () => {
    setTimeout(() => {
      messageInputRef.current?.focus()
    }, 500)
  }

  /**
   * The function handleCloseRoom dispatches an action to close a room with a specific ID.
   */
  const handleCloseRoom = () => {
    dispatch(closeRoom({ roomId }))
  }

  /**
   * The function triggers a click event on an image input element if it exists.
   */
  const triggerInput = () => {
    if (imageInputRef) {
      imageInputRef.current?.click()
    }
  }

  /**
   * This function handles the saving of an image file to a database and displays an error message if the
   * file is not an image.
   * @param event - React form event that is triggered when the user selects an image file to upload.
   * @returns The function `handleSaveImageBtn` returns nothing (`undefined`) if the `isUserSignedIn` is
   * false or if there are no files selected in the input element. If the selected file is not an image,
   * it returns early without executing the rest of the code. If the selected file is an image, it calls
   * the `saveImageToDB` function with the `creator` and the
   */
  const handleSaveImageBtn = async (event: React.FormEvent<HTMLInputElement>) => {
    if (!isUserSignedIn || !event.currentTarget.files) {
      return
    }
    const file = event.currentTarget.files[0]

    // Check if the file is an image.
    if (!file.type.match("image.*")) {
      dispatch(setModal({ message: main.onlyImages }))
      return
    }
    //imageName: string; roomId: string; file: File
    saveImageToDB({ userId: creator, file: file })
      .unwrap()
      .then((res) => {
        if (res.data) {
          saveImgMessage(res.data?.imageUrl, roomId)
        } else if (res.error) {
          // todo - after I re-do the error handling
        }
      })
  }

  // if (props.imageUrl) {
  //     content = <img src={props.imageUrl + "&" + new Date().getTime()} alt="Girl in a jacket" width="500" height="600"/>
  // }

  return (
    <div className={classes.ChatRoom}>
      <div className={classes.Header}>
        {otherUserNames && <h2>{otherUserNames}</h2>}
        <button type="button" className={classes.closeBtn} onClick={() => handleCloseRoom()}>
          <CloseSVG />
        </button>
      </div>
      <div className={`${classes.chatMessages} ${classes.scrollbar} ${theme.scrollbar}`}>{messages}</div>
      {!isOnline && <p className={classes.error}>{main.offline}</p>}
      <form onSubmit={onMessageFormSubmit} className={classes.form}>
        <input
          type="text"
          ref={messageInputRef}
          onTouchStart={handleTouch}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value)
          }}
          className={classes.formInput}
        />
        <button id="submit" type="submit" className={classes.formBtn} disabled={!message.length || !isOnline}>
          <SendSVG />
        </button>

        <input type="file" style={{ display: "none" }} ref={imageInputRef} onChange={(e) => handleSaveImageBtn(e)} />
        <button id="submitImage" onClick={() => triggerInput()} className={classes.formBtn} disabled={!isOnline}>
          <ImageSVG />
        </button>
      </form>
    </div>
  )
}

export default ChatRoom;
