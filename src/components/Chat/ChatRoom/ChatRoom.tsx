import { getAuth } from "firebase/auth";
import { FormEvent, ChangeEvent, ReactElement, ReactNode, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectUserData, UserData } from "../../Auth/userSlice";
import ChatMessage from "../ChatMessage/ChatMessage";
import { ChatRoomsContent, closeRoom, FriendsContent } from "../chatSlice";
import classes from "./ChatRoom.module.css";
import { langs, Langs } from "../ChatTexts";
import { ReactComponent as SendSVG } from "./sendSVG.svg";
import { ReactComponent as ImageSVG } from "./imageSVG.svg";
import { ReactComponent as CloseSVG } from "../closeSVG.svg";
import {
  useGetFriendsQuery,
  useGetMessagesQuery,
  useSaveImageMutation,
  useSaveMessageMutation,
  useSendNewRoomDataMutation,
} from "../chatApi";
import useError from "../../CustomHooks/useError";
import { selectLang, setModal } from "../../Navigation/navigationSlice";
import { useOnlineStatus } from "../../CustomHooks/useOnlineStatus";

type ReactArr = React.ReactElement[];
const initReactElArr: ReactArr = [];

const ChatRoom = (props: { room: ChatRoomsContent }) => {
  const dispatch = useAppDispatch();
  const currentLang = useAppSelector(selectLang);
  const userData = useAppSelector(selectUserData);

  // Local state
  const [message, setMessage] = useState("");
  const [otherUser, setOtherUser] = useState<FriendsContent | null>(null);
  const [messages, setMessages] = useState(initReactElArr);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [friendsError, setFriendsError] = useError();
  const [messagesError, setMessagesError] = useError();
  const [sendRoomDataError, setSendRoomDataError] = useError();
  const [saveMsgsError, setSaveMsgsError] = useError();
  const [saveImagesError, setSaveImagesError] = useError();

  const { isOnline, wasOffline, resetOnlineStatus } = useOnlineStatus();

  const { creator, roomId, otherUserId } = props.room;
  const { main } = langs[currentLang as keyof Langs];

  const {
    data: chatFriends, // The latest returned result regardless of hook arg, if present.
    isError: isErrorFr, // When true, indicates that the query is in an error state.
    error: errorFr, // The error result if present.
    //isSuccess, // When true, indicates that the query has data from a successful request.
  } = useGetFriendsQuery();

  useEffect(() => {
    if (((isErrorFr && errorFr) || (chatFriends && chatFriends.error)) && !friendsError) {
      setFriendsError([isErrorFr, errorFr, chatFriends], "ambiguousSource");
    } else if (chatFriends && chatFriends.data) {
      const other = chatFriends.data.filter((user) => user.id == otherUserId)[0];
      if (other) setOtherUser(other);
    }
  }, [isErrorFr, errorFr, chatFriends]);

  useEffect(() => {
    if (friendsError) {
      dispatch(setModal({ message: friendsError }));
    }
  }, [friendsError]);

  // Returns true if a user is signed-in.
  const isUserSignedIn = () => !!getAuth().currentUser;

  const {
    data: roomMessages,
    isError: isErrorMsgs,
    error: errorMsgs,
    refetch: refetchMessages,
  } = useGetMessagesQuery(roomId, { refetchOnReconnect: true });

  useEffect(() => {
    if (((isErrorMsgs && errorMsgs) || (roomMessages && roomMessages.error)) && !messagesError) {
      setMessagesError([isErrorMsgs, errorMsgs, roomMessages], "ambiguousSource");
    }
  }, [isErrorMsgs, errorMsgs, roomMessages]);

  useEffect(() => {
    if (messagesError) {
      dispatch(setModal({ message: messagesError }));
    }
  }, [messagesError]);

  useEffect(() => {
    if (isOnline && wasOffline) {
      refetchMessages();
      resetOnlineStatus();
    }
  }, [isOnline]);

  useEffect(() => {
    if (roomMessages && otherUser) {
      const chatMessagesEl = roomMessages.data.map((messageObj) => {
        const timeStamp = JSON.parse(JSON.stringify(messageObj.timestamp));
        const key: React.Key = timeStamp.seconds;
        return <ChatMessage key={key} data={messageObj} otherUser={otherUser} />;
      });
      setMessages(chatMessagesEl);
    }
  }, [roomMessages, otherUser]);

  const [
    updateRoomData, // This is the mutation trigger
    { data: dataSRD, isLoading: isUpdating, isError: isErrorSRD, error: errorSRD }, // This is the destructured mutation result
  ] = useSendNewRoomDataMutation();

  useEffect(() => {
    if (((isErrorSRD && errorSRD) || (dataSRD && dataSRD.error)) && !sendRoomDataError) {
      setSendRoomDataError([isErrorSRD, errorSRD, dataSRD], "ambiguousSource");
    }
  }, [isErrorSRD, errorSRD, dataSRD]);

  useEffect(() => {
    if (sendRoomDataError) {
      dispatch(setModal({ message: sendRoomDataError }));
    }
  }, [sendRoomDataError]);

  const [saveMessageToDB, { data: dataSMsgs, isLoading: sendingMessage, isError: isErrorSMsgs, error: errorSMsgs }] =
    useSaveMessageMutation();

  useEffect(() => {
    if (((isErrorSMsgs && errorSMsgs) || (dataSMsgs && dataSMsgs.error)) && !saveMsgsError) {
      setSaveMsgsError([isErrorSMsgs, errorSMsgs, dataSMsgs], "ambiguousSource");
    }
  }, [isErrorSMsgs, errorSMsgs, dataSMsgs]);

  useEffect(() => {
    if (saveMsgsError) {
      dispatch(setModal({ message: saveMsgsError }));
    }
  }, [saveMsgsError]);

  const [
    saveImageToDB,
    { data: dataSaveImg, isLoading: sendingSaveImg, isError: isErrorSaveImg, error: errorSaveImg },
  ] = useSaveImageMutation();

  useEffect(() => {
    if (((isErrorSaveImg && errorSaveImg) || (dataSaveImg && dataSaveImg.error)) && !saveImagesError) {
      setSaveImagesError([isErrorSaveImg, errorSaveImg, dataSaveImg], "ambiguousSource");
    }
  }, [isErrorSaveImg, errorSaveImg, dataSaveImg]);

  useEffect(() => {
    if (saveImagesError) {
      dispatch(setModal({ message: saveImagesError }));
    }
  }, [saveImagesError]);

  ///////////////////////////
  // Saves a new image message to Cloud Firestore.
  const saveImgMessage = (imageUrl: string, roomId: string) => {
    if (otherUser === null) return;
    saveMessageToDB({ roomId, userData, otherUser, imageUrl });
  };

  // Saves a new message to Cloud Firestore.
  const saveMessage = async (messageText: string, roomId: string) => {
    // Add a new message entry to the Firebase database.
    if (otherUser === null) return;
    try {
      if (messages.length === 0) {
        await updateRoomData({ roomId, userData, otherUser });
      }
      await saveMessageToDB({ roomId, userData, otherUser, messageText });
    } catch (error) {
      console.error("Error writing new message to Firebase Database", error);
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

  const handleImageBtn = async (event: React.FormEvent<HTMLInputElement>) => {
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
    saveImageToDB({ roomId, userId: creator, file: file })
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

        <input
          id="myFile"
          type="file"
          style={{display: "none"}}
          ref={imageInputRef}
          className={classes.formBtn}
          disabled={!isOnline}
          onChange={(e) => handleImageBtn(e)}
        />
        <button id="submitImage" onClick={() => triggerInput()} className={classes.formBtn} disabled={!isOnline}>
          <ImageSVG />
        </button>
      </form>
    </div>
  );
};

export default ChatRoom;
