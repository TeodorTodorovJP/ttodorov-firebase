import { getAuth } from "firebase/auth";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectUserData, UserData } from "../../Auth/userSlice";
import ChatMessage from "../ChatMessage/ChatMessage";
import { ChatRoomsContent, closeRoom } from "../chatSlice";
import classes from "./ChatRoom.module.css";
import { langs, Langs } from "../ChatTexts";
import { ReactComponent as SendSVG } from "./sendSVG.svg";
import { ReactComponent as ImageSVG } from "../../UI/SVG/imageSVG.svg";
import { ReactComponent as CloseSVG } from "../closeSVG.svg";
import {
  useGetMessagesQuery,
  useSaveImageMutation,
  useSaveMessageMutation,
  useSendNewRoomDataMutation,
} from "../chatApi";
import useError from "../../CustomHooks/useError";
import { selectLang, setModal } from "../../Navigation/navigationSlice";
import { useOnlineStatus } from "../../CustomHooks/useOnlineStatus";
import { getDateDataInUTC, getError } from "../../../app/utils";
import { useGetUserDataQuery } from "../../Auth/userApi";

type ReactArr = React.ReactElement[];
const initReactElArr: ReactArr = [];

const ChatRoom = (props: { room: ChatRoomsContent }) => {
  const dispatch = useAppDispatch();
  const currentLang = useAppSelector(selectLang);
  const userData = useAppSelector(selectUserData);

  // Local state
  const [message, setMessage] = useState("");
  const [otherUser, setOtherUser] = useState<UserData | null>(null);
  const [messages, setMessages] = useState(initReactElArr);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [usersError, setUsersError] = useError();
  const [messagesError, setMessagesError] = useError();
  const [sendRoomDataError, setSendRoomDataError] = useError();
  const [saveMsgsError, setSaveMsgsError] = useError();
  const [saveImagesError, setSaveImagesError] = useError();

  const { isOnline } = useOnlineStatus();

  const { creator, roomId, otherUserId } = props.room;
  const { main } = langs[currentLang as keyof Langs];

  // Returns true if a user is signed-in.
  const isUserSignedIn = () => !!getAuth().currentUser;

  // Get users from firebase hook
  const {
    data: chatUsers, // The latest returned result regardless of hook arg, if present.
    isError: isErrorFr, // When true, indicates that the query is in an error state.
    error: errorFr, // The error result if present.
    //isSuccess, // When true, indicates that the query has data from a successful request.
  } = useGetUserDataQuery();

  // Handle useGetUserDataQuery errors
  useEffect(() => {
    if (((isErrorFr && errorFr) || (chatUsers && chatUsers.error)) && !usersError) {
      setUsersError([isErrorFr, errorFr, chatUsers], "ambiguousSource");
    } else if (chatUsers && chatUsers.data) {
      const other = chatUsers.data.filter((user) => user.id == otherUserId)[0];
      if (other) setOtherUser(other);
    }
  }, [isErrorFr, errorFr, chatUsers]);

  useEffect(() => {
    if (usersError) dispatch(setModal({ message: usersError }));
  }, [usersError]);

  // Get messages from firebase hook
  const {
    data: roomMessages,
    isError: isErrorMsgs,
    error: errorMsgs,
    refetch: refetchMessages,
  } = useGetMessagesQuery(roomId, { refetchOnReconnect: true });

  // Handle useGetMessagesQuery errors
  useEffect(() => {
    if (((isErrorMsgs && errorMsgs) || (roomMessages && roomMessages.error)) && !messagesError) {
      setMessagesError([isErrorMsgs, errorMsgs, roomMessages], "ambiguousSource");
    }
  }, [isErrorMsgs, errorMsgs, roomMessages]);

  useEffect(() => {
    if (messagesError) dispatch(setModal({ message: messagesError }));
  }, [messagesError]);

  // Prepare data ass react components
  useEffect(() => {
    if (roomMessages && otherUser) {
      const lastIndex = roomMessages.data.length - 1;
      const chatMessagesEl = roomMessages.data.map((messageObj, index) => {
        const { utcMilliseconds } = getDateDataInUTC(messageObj.timestamp);
        const key: React.Key = utcMilliseconds;

        return <ChatMessage key={key} isLast={+lastIndex === +index} data={messageObj} otherUser={otherUser} />;
      });
      setMessages(chatMessagesEl);
    }
  }, [roomMessages, otherUser]);

  // Send room data to firebase hook
  const [updateRoomData, { data: dataSRD, isLoading: isUpdating, isError: isErrorSRD, error: errorSRD }] =
    useSendNewRoomDataMutation();

  // Handle useSendNewRoomDataMutation errors
  useEffect(() => {
    if (((isErrorSRD && errorSRD) || (dataSRD && dataSRD.error)) && !sendRoomDataError) {
      setSendRoomDataError([isErrorSRD, errorSRD, dataSRD], "ambiguousSource");
    }
  }, [isErrorSRD, errorSRD, dataSRD]);

  useEffect(() => {
    if (sendRoomDataError) dispatch(setModal({ message: sendRoomDataError }));
  }, [sendRoomDataError]);

  // Save message to firebase hook
  const [saveMessageToDB, { data: dataSMsgs, isLoading: sendingMessage, isError: isErrorSMsgs, error: errorSMsgs }] =
    useSaveMessageMutation();

  // Handle useSaveMessageMutation errors
  useEffect(() => {
    if (((isErrorSMsgs && errorSMsgs) || (dataSMsgs && dataSMsgs.error)) && !saveMsgsError) {
      setSaveMsgsError([isErrorSMsgs, errorSMsgs, dataSMsgs], "ambiguousSource");
    }
  }, [isErrorSMsgs, errorSMsgs, dataSMsgs]);

  useEffect(() => {
    if (saveMsgsError) dispatch(setModal({ message: saveMsgsError }));
  }, [saveMsgsError]);

  // Save image to firebase hook
  const [
    saveImageToDB,
    { data: dataSaveImg, isLoading: sendingSaveImg, isError: isErrorSaveImg, error: errorSaveImg },
  ] = useSaveImageMutation();

  // Handle useSaveImageMutation errors
  useEffect(() => {
    if (((isErrorSaveImg && errorSaveImg) || (dataSaveImg && dataSaveImg.error)) && !saveImagesError) {
      setSaveImagesError([isErrorSaveImg, errorSaveImg, dataSaveImg], "ambiguousSource");
    }
  }, [isErrorSaveImg, errorSaveImg, dataSaveImg]);

  useEffect(() => {
    if (saveImagesError) dispatch(setModal({ message: saveImagesError }));
  }, [saveImagesError]);

  // Saves a new image message to Cloud Firestore.
  const saveImgMessage = (imageUrl: string, roomId: string) => {
    if (otherUser === null) return;
    saveMessageToDB({ roomId, userData, otherUser, imageUrl });
  };

  // Saves a new message to Cloud Firestore.
  const saveMessage = async (messageText: string, roomId: string) => {
    if (otherUser === null) return;
    try {
      if (messages.length === 0) {
        // If the room has no messages, it is a new room
        // Create the room in firebase
        await updateRoomData({ roomId, userData, otherUser });
      }
      // After creation, fill the message inside
      await saveMessageToDB({ roomId, userData, otherUser, messageText });
    } catch (error) {
      dispatch(setModal({ message: getError(error) }));
    }
  };

  // Triggered when the send new message form is submitted.
  const onMessageFormSubmit = (event: FormEvent) => {
    event.preventDefault();
    // Check that the user entered a message and is signed in.
    if (message.length > 0 && isUserSignedIn() && otherUser !== null) {
      saveMessage(message, roomId)
        .then(() => {
          // Clear message text field and re-enable the SEND button.
          setMessage("");
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };

  const handleCloseRoom = () => {
    dispatch(closeRoom({ roomId }));
  };

  const triggerInput = () => {
    if (imageInputRef) {
      imageInputRef.current?.click();
    }
  };

  const handleSaveImageBtn = async (event: React.FormEvent<HTMLInputElement>) => {
    if (!isUserSignedIn || !event.currentTarget.files) {
      return;
    }
    const file = event.currentTarget.files[0];

    // Check if the file is an image.
    if (!file.type.match("image.*")) {
      dispatch(setModal({ message: main.onlyImages }));
      return;
    }
    //imageName: string; roomId: string; file: File
    saveImageToDB({ userId: creator, file: file })
      .unwrap()
      .then((res) => {
        if (res.data) {
          saveImgMessage(res.data?.imageUrl, roomId);
        } else if (res.error) {
          // todo - after I re-do the error handling
        }
      });
  };

  // if (props.imageUrl) {
  //     content = <img src={props.imageUrl + "&" + new Date().getTime()} alt="Girl in a jacket" width="500" height="600"/>
  // }

  return (
    <div className={classes.ChatRoom}>
      <div className={classes.Header}>
        {otherUser && <h2>{otherUser.names}</h2>}
        <button type="button" className={classes.closeBtn} onClick={() => handleCloseRoom()}>
          <CloseSVG />
        </button>
      </div>
      <div className={classes.chatMessages}>{messages}</div>
      {!isOnline && <p className={classes.error}>{main.offline}</p>}
      <form onSubmit={onMessageFormSubmit} className={classes.form}>
        <input
          type="text"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
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
  );
};

export default ChatRoom;
