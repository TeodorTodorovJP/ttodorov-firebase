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
import { FormEvent, memo, useEffect, useMemo, useRef, useState } from "react";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectUserData } from "../Auth/userSlice";
import {
  ChatRoomsContent,
  closeRoom,
  FriendsContent,
  selectFriends,
  selectShowRooms,
  selectUserRooms,
  addFriends,
  setUserRooms,
  UserRoomsArr,
  selectFriendsSnap,
  setFriendsSnap,
} from "./chatSlice";
import ChatRooms from "./ChatRooms/ChatRooms";
import ChatFriends from "./ChatFriends/ChatFriends";

const Chat = () => {
  // Store
  const dispatch = useAppDispatch();
  const { id: userId } = useAppSelector(selectUserData);
  const rooms = useAppSelector(selectUserRooms);
  const showRooms = useAppSelector(selectShowRooms);
  const chatFriendsArr = useAppSelector(selectFriends);
  const friendsSnap = useAppSelector(selectFriendsSnap);

  useEffect(() => {
    console.log("useEffect");
    if (friendsSnap) return;
    const friendsCollectionQuery = query(collection(fireStore, "friends"));
    console.log("snapshot set");
    onSnapshot(friendsCollectionQuery, (querySnapshot) => {
      let prepareFriends: FriendsContent[] = [];
      console.log("snapshot");

      // This will trigger when a new room is added
      querySnapshot.docChanges().forEach((change) => {
        // types: "added", "modified", "removed"
        const changeData = change.doc.data();
        if (!changeData.timestamp) return;

        const prepareFriendsData: FriendsContent = {
          id: changeData.id,
          names: changeData.email,
          timestamp: JSON.stringify(changeData.timestamp),
          email: changeData.email,
          profilePic: changeData.profilePic,
        };
        prepareFriends.push(prepareFriendsData);
        // console.log("added friend: ", change.doc.data());
      });

      dispatch(addFriends(prepareFriends));
    });
    dispatch(setFriendsSnap(true));
  }, [chatFriendsArr]);

  // Returns true if a user is signed-in.
  function isUserSignedIn() {
    return !!getAuth().currentUser;
  }

  // Delete a Message from the UI.
  function deleteMessage() {}

  return (
    <div className={classes.chat}>
      {rooms && showRooms && (
        <Card additionalClass="chatRooms">{rooms.length > 0 ? <ChatRooms /> : <p>No rooms</p>}</Card>
      )}
      <Card additionalClass={`${showRooms ? "chatFriendsHide" : "chatFriends"}`}>
        {chatFriendsArr.length > 0 ? <ChatFriends /> : <p>No friends</p>}
      </Card>
    </div>
  );
};

export default Chat;
