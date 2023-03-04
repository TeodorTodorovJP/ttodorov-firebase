import Card from "../UI/Card";
import classes from "./Chat.module.css";
import { Langs, langs } from "./ChatTexts";

import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  setDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDoc,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  FieldValue,
  where,
} from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { VAPID_KEY, fireStore, app } from "../../firebase-config";

import { getPerformance } from "firebase/performance";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectUserData } from "../Auth/userSlice";
import { selectFriends, setFriends } from "./chatSlice";
import ChatRooms from "./ChatRooms/ChatRooms";
import ChatFriend from "./ChatFriends/ChatFriends";

import { useCollectionData } from "react-firebase-hooks/firestore";

type ReactArr = React.ReactElement[];
const initReactElArr: ReactArr = [];

export interface ChatRoomsContent {
  creator: string;
  roomId: string;
  timestamp: Date;
  otherUserNames: string;
  isOpened: boolean;
  active: boolean;
  tabClass: string;
}
type UserRoomsArr = ChatRoomsContent[] | [];

export interface FriendsContent {
  id: string;
  names: string;
  timestamp: Date | string;
  email?: string;
  profilePic?: string;
}
export type FriendsArr = FriendsContent[] | [];

type Error = FirestoreError | undefined;
type Snapshot = QuerySnapshot<DocumentData> | undefined;

const Chat = () => {
  // Store
  const dispatch = useAppDispatch();
  const [chatFriendsArr, setChatFriendsArr] = useState(initReactElArr);
  const { id: userId } = useAppSelector(selectUserData);

  // const [usersRooms, setUsersRooms] = useState<UserRoomsArr>(null);
  const [showRooms, setShowRooms] = useState(false);

  const [rooms, setRooms] = useState<UserRoomsArr>([]);

  const roomsCollectionQuery = query(collection(fireStore, "allRooms"), where("creator", "==", userId));

  const [usersRooms, loadingRooms, errorRooms, snapshot] = useCollectionData(roomsCollectionQuery) as [
    UserRoomsArr,
    boolean,
    Error,
    Snapshot
  ];

  if (errorRooms) {
    console.log(errorRooms);
  }

  // Optimize to update only new rooms and not set a new array every time
  useEffect(() => {
    if (snapshot) {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          console.log("Added room: ", change.doc.data());
        }
        if (change.type === "modified") {
          console.log("Modified room: ", change.doc.data());
        }
        if (change.type === "removed") {
          console.log("Removed room: ", change.doc.data());
        }
      });
    }
    if (usersRooms) {
      // Fill the initial arrays of values for all rooms
      const roomsWithIsOpened = usersRooms.map((room) => {
        const updatedRoom = { ...room };
        updatedRoom.isOpened = false;
        updatedRoom.active = false;
        updatedRoom.tabClass = "";
        return updatedRoom;
      });
      setRooms(roomsWithIsOpened);
    }
  }, [usersRooms, snapshot]);

  ////////////////////////////
  // Use for instant message show, for the message sender
  // const unsub = onSnapshot(doc(fireStore, "cities", "SF"), (doc) => {
  //   const source = doc.metadata.hasPendingWrites ? "Local" : "Server";
  //   console.log(source, " data: ", doc.data());
  // });
  ////////////////////////////

  const friendsCollectionQuery = query(collection(fireStore, "friends"));
  const [friends, loadingFriends, errorFriends] = useCollectionData(friendsCollectionQuery) as [
    FriendsArr,
    boolean,
    Error,
    Snapshot
  ];

  useEffect(() => {
    if (friends) {
      let serializedFriends: FriendsContent[] = [];
      const chatFriendsEl = friends.map((friend) => {
        let serializedFriend = { ...friend };
        serializedFriend.timestamp = JSON.stringify(serializedFriend.timestamp);
        serializedFriends.push(serializedFriend);
        return <ChatFriend key={friend.id} user={friend} onClick={openRoom} />;
      });
      dispatch(setFriends(serializedFriends));
      setChatFriendsArr(chatFriendsEl);
    }
  }, [friends]);

  const openRoom = (otherUserId: string, otherUserNames: string) => {
    console.log("Open Room");
    const newRoomId = "room" + [userId, otherUserId].sort().join("");
    setRooms((prev) => {
      let roomFound = false;
      const updatedRooms = prev.map((room) => {
        if (room.roomId === newRoomId) {
          room.otherUserNames = otherUserNames;
          room.isOpened = true;
          room.active = true;
          room.tabClass = "";
          roomFound = true;
        } else {
          room.active = false;
        }
        return room;
      });

      if (!roomFound) {
        // add room to local array
        updatedRooms.push({
          creator: userId,
          roomId: newRoomId,
          timestamp: new Date(),
          otherUserNames,
          isOpened: true,
          active: true,
          tabClass: "",
        });
      }
      // updatedRooms.map((r) => console.log(r.active));
      return updatedRooms;
    });
    setShowRooms(true);
  };

  const closeRoom = (roomId: string) => {
    console.log("Close Room");
    let assignedActive = false;
    setRooms((prev) => {
      const updatedRooms = prev.map((room) => {
        if (room.roomId === roomId) {
          room.isOpened = false;
          room.active = false;
        } else if (room.isOpened && !assignedActive) {
          assignedActive = true;
          room.active = true;
        }
        return room;
      });
      return updatedRooms;
    });
    //
    if (!assignedActive) {
      setShowRooms(false);
    }
  };

  const hideRooms = () => {
    setShowRooms(false);
  };

  // Returns true if a user is signed-in.
  function isUserSignedIn() {
    return !!getAuth().currentUser;
  }

  // Delete a Message from the UI.
  function deleteMessage() {}

  return (
    <div className={classes.chat}>
      {rooms && showRooms && (
        <Card additionalClass="chatRooms">
          {rooms.length > 0 ? <ChatRooms rooms={rooms} closeRoom={closeRoom} hideRooms={hideRooms} /> : <p>No rooms</p>}
        </Card>
      )}
      {!showRooms && (
        <Card additionalClass="chatFriends">
          <div className={classes.chatFriends}>{chatFriendsArr}</div>
        </Card>
      )}
    </div>
  );
};

export default Chat;
