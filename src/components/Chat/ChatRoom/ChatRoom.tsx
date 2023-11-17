import { getAuth } from "firebase/auth";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectUserData, selectUserPreferences, UserData } from "../../Auth/userSlice";
import ChatMessage from "../ChatMessage/ChatMessage";
import { ChatRoomsContent, closeRoom, deleteInboxMessages, selectInbox } from "../chatSlice"
import { langs, Langs } from "../chatTexts"

import {
  GetMessages,
  useDeleteInboxMessageMutation,
  useGetMessagesQuery,
  useSaveImageMutation,
  useSaveMessageMutation,
  useSendNewRoomDataMutation,
  useSendToInboxMutation,
} from "../chatApi"
import { useOnlineStatus } from "../../CustomHooks/useOnlineStatus"
import { getDateDataInUTC, getError } from "../../../app/utils"
import { useGetUserDataQuery } from "../../Auth/userApi"
import { setModal } from "../../Modal/modalSlice"
import {
  Box,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import HighlightOffIcon from "@mui/icons-material/HighlightOff"
import SendIcon from "@mui/icons-material/Send"
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto"

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
  const inboxStoreData = useAppSelector(selectInbox)

  /** Local state */
  const [message, setMessage] = useState("")
  const [otherUser, setOtherUser] = useState<UserData | null>(null)
  const [messages, setMessages] = useState(initReactElArr)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const messageInputRef = useRef<HTMLInputElement>(null)

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
   * TODO: the query should accept userId so that the useEffect is not needed to filter the users
   * or maybe the get them from the store by Id
   */
  const { data: chatUsers } = useGetUserDataQuery()

  /**
   * For useGetUserDataQuery
   * Checks for errors generated from the RTKQ and errors generated from Firebase
   * */
  useEffect(() => {
    if (chatUsers && chatUsers.data) {
      const other = chatUsers.data.filter((user) => user.id == otherUserId)[0]
      if (other) setOtherUser(other)
    }
  }, [chatUsers])

  /** Get messages for the current room from firebase */
  const { data: roomMessages } = useGetMessagesQuery(roomId, { refetchOnReconnect: true })

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

  /** Send room data to firebase. */
  const [updateRoomData] = useSendNewRoomDataMutation()

  /** Save message to firebase. */
  const [saveMessageToDB] = useSaveMessageMutation()

  /** Save image to firebase. */
  const [saveImageToDB] = useSaveImageMutation()

  /** Delete inbox message from firebase. */
  const [delInboxMessage] = useDeleteInboxMessageMutation()

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
  const [sendToInboxDB] = useSendToInboxMutation()

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
      dispatch(setModal({ text: getError(error) }))
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
      dispatch(setModal({ text: main.onlyImages }))
      return
    }
    //imageName: string; roomId: string; file: File
    saveImageToDB({ userId: creator, file: file })
      .unwrap()
      .then((res) => {
        if (res.data) {
          saveImgMessage(res.data?.imageUrl, roomId)
        } else if (res.error) {
          dispatch(setModal({ text: res.error }))
        }
      })
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        heigh: { xs: "85vh", md: "67vh" },
        maxHeight: { xs: "85vh", md: "67vh" },
        minHeight: { xs: "85vh", md: "67vh" },
        padding: "15px",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", padding: "10px", alignItems: "center" }}>
        {otherUserNames && <Typography sx={{ fontWeight: "bold" }}>{otherUserNames}</Typography>}
        <IconButton type="button" onClick={() => handleCloseRoom()}>
          <HighlightOffIcon />
        </IconButton>
      </Box>

      <Stack
        spacing={2}
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: "1",
          marginTop: "7%",
          overflow: "overlay",

          // To move the scrollbar to the right
          minWidth: { xs: "103%", sm: "101%" },
          paddingRight: { xs: "3%", sm: "2%" },

          "&::-webkit-scrollbar": {
            width: "0.4em",
          },
          "&::-webkit-scrollbar-track": {
            webkitBoxShadow: "inset 0 0 6px rgba(0,0,0,0.00)",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "primary",
            outline: "1px solid slategrey",
            borderRadius: "8px",
          },
        }}
      >
        {messages}
      </Stack>

      <Box
        component="form"
        onSubmit={onMessageFormSubmit}
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: "30px",
          // Hardcoded 50px, can't detect bottom navigation on mobile devices
          marginBottom: { xs: "6vh", md: "0px" },
        }}
      >
        <TextField
          type="text"
          margin="normal"
          required
          label="Enter message"
          name="message"
          autoComplete="message"
          autoFocus
          error={!isOnline}
          helperText={!isOnline && main.offline}
          ref={messageInputRef}
          onTouchStart={handleTouch}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value)
          }}
          sx={{ minWidth: "80%" }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="send message"
                  edge="end"
                  id="submit"
                  type="submit"
                  disabled={!message.length || !isOnline}
                >
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <input type="file" style={{ display: "none" }} ref={imageInputRef} onChange={(e) => handleSaveImageBtn(e)} />
        <IconButton
          id="submitImage"
          onClick={() => triggerInput()}
          disabled={!isOnline}
          type="button"
          edge="start"
          color="inherit"
          aria-label="send image"
          sx={{
            transform: "scale(3)",
            fontSize: "large",
            padding: "0",
            marginTop: "7px",
          }}
        >
          <InsertPhotoIcon color="primary" />
        </IconButton>
      </Box>
    </Box>
  )
}

export default ChatRoom;
