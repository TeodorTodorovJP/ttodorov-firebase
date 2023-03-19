import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  DocumentData,
  serverTimestamp,
  query,
  orderBy,
  limit,
  doc,
  getDoc,
  setDoc,
  FieldValue,
  FirestoreError,
  QuerySnapshot,
} from "firebase/firestore";
import { FormEvent, ReactElement, ReactNode, useEffect, useRef, useState } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fireStore } from "../../../firebase-config";
import { selectUserData } from "../../Auth/userSlice";
import ChatMessage from "../ChatMessage/ChatMessage";
import { ChatRoomsContent, closeRoom, selectFriends } from "../chatSlice";
import classes from "./ChatRoom.module.css";
import { ReactComponent as SendSVG } from "./sendSVG.svg";
import { ReactComponent as CloseSVG } from "../closeSVG.svg";

type ReactArr = React.ReactElement[];
const initReactElArr: ReactArr = [];

export interface MessageData {
  userId: string;
  name: string;
  text: string;
  profilePicUrl: string;
  timestamp: {
    nanoseconds: number;
    seconds: number;
  };
}

type MessageDataArr = MessageData[] | [];

type Error = FirestoreError | undefined;
type Snapshot = QuerySnapshot<DocumentData> | undefined;

const ChatRoom = (props: { room: ChatRoomsContent }) => {
  const dispatch = useAppDispatch();
  const userData = useAppSelector(selectUserData);
  const chatFriends = useAppSelector(selectFriends);

  // Local state
  const [message, setMessage] = useState("");

  const { creator, roomId, otherUserId } = props.room;

  // console.log("ChatRoom");

  const otherUser = chatFriends.filter((user) => user.id == otherUserId)[0];

  // Returns true if a user is signed-in.
  function isUserSignedIn() {
    return !!getAuth().currentUser;
  }

  const recentMessagesQuery = query(
    collection(fireStore, "allChatRooms", roomId, "messages"),
    orderBy("timestamp"),
    limit(12)
  );

  const [roomMessages, loading, error] = useCollectionData(recentMessagesQuery) as [
    MessageDataArr,
    boolean,
    Error,
    Snapshot
  ];
  const [messages, setMessages] = useState(initReactElArr);

  useEffect(() => {
    if (roomMessages) {
      const chatMessagesEl = roomMessages.map((messageObj) => {
        const key: React.Key = messageObj.timestamp ? messageObj.timestamp.seconds : "new";
        return <ChatMessage key={key} data={messageObj} otherUser={otherUser} />;
      });
      setMessages(chatMessagesEl);
    }
  }, [roomMessages]);

  // called with saveMessage
  const sendNewRoomData = async (roomId: string) => {
    try {
      console.log("Check for room in db");
      const roomRef = doc(fireStore, "allChatRooms", roomId);
      const roomSnap = await getDoc(roomRef);

      if (!roomSnap.exists()) {
        const timestamp = serverTimestamp();
        await setDoc(roomRef, {
          timestamp,
          creator: userData.id,
          otherUserId: otherUserId,
          otherUserNames: otherUser.names,
          roomId,
        });
        console.log("room added to db");
      }
    } catch (error) {
      console.error("Error adding data room in Firebase Database", error);
    }
  };

  // Saves a new message to Cloud Firestore.
  const saveMessage = async (messageText: string, usersRoom: string) => {
    // Add a new message entry to the Firebase database.
    try {
      if (messages.length === 0) {
        await sendNewRoomData(usersRoom);
      }
      await addDoc(collection(fireStore, "allChatRooms", usersRoom, "messages"), {
        userId: userData.id,
        name: userData.names,
        text: messageText,
        profilePicUrl: userData.profilePic ? userData.profilePic : "",
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error writing new message to Firebase Database", error);
    }
  };

  // Triggered when the send new message form is submitted.
  function onMessageFormSubmit(event: FormEvent) {
    event.preventDefault();
    // Check that the user entered a message and is signed in.
    if (message.length > 0 && isUserSignedIn()) {
      saveMessage(message, roomId)
        .then(function () {
          // Clear message text field and re-enable the SEND button.
          setMessage("");
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }

  const handleCloseRoom = () => {
    dispatch(closeRoom({ roomId }));
  };

  // if (props.imageUrl) {
  //     content = <img src={props.imageUrl + "&" + new Date().getTime()} alt="Girl in a jacket" width="500" height="600"/>
  // }

  return (
    <div className={classes.ChatRoom}>
      <div className={classes.Header}>
        <h2>{otherUser.names}</h2>
        <button type="button" className={classes.closeBtn} onClick={() => handleCloseRoom()}>
          <CloseSVG />
        </button>
      </div>
      <div className={classes.chatMessages}>{messages}</div>
      <form onSubmit={onMessageFormSubmit} className={classes.form}>
        <input
          type="text"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
          }}
          className={classes.formInput}
        />
        <button id="submit" type="submit" className={classes.formBtn} disabled={!message.length}>
          <SendSVG />
        </button>
      </form>
    </div>
  );
};

export default ChatRoom;
