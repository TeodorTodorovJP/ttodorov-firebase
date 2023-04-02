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
  setUserRooms,
  UserRoomsArr,
  fetchFriends,
} from "./chatSlice";
import ChatRooms from "./ChatRooms/ChatRooms";
import ChatFriends from "./ChatFriends/ChatFriends";
import { useGetFriendsQuery } from "./chatApi";

const Chat = () => {
  // Store
  const dispatch = useAppDispatch();
  const { id: userId } = useAppSelector(selectUserData);
  const rooms = useAppSelector(selectUserRooms);
  const showRooms = useAppSelector(selectShowRooms);

  // const { data, error, status } = useGetFriendsQuery(name, {
  //   skip: true, // if skip is true, it will skip loading the data, if set to false, it will load the data
  //   refetchOnMountOrArgChange: 30 // refetch the data every 30 seconds
  //   selectFromResult: ({ data, error, isLoading }) => ({ // filter the fetched data, or modify it
  //      data: data?.filter((item: Pokemon) => item.name.endsWith("saur")),
  //      error,
  //      isLoading
  //   }),
  // });

  const {
    data: chatFriendsArr, // The latest returned result regardless of hook arg, if present.
    isSuccess, // When true, indicates that the query has data from a successful request.
    //currentData, // The latest returned result for the current hook arg, if present.
    isLoading, // When true, indicates that the query is currently loading for the first time, and has no data yet. This will be true for the first request fired off, but not for subsequent requests.
    isFetching, // When true, indicates that the query is currently fetching, but might have data from an earlier request. This will be true for both the first request fired off, as well as subsequent requests.
    isUninitialized, // When true, indicates that the query has not started yet.
    isError, // When true, indicates that the query is in an error state.
    error, // The error result if present.
    //refetch, // A function to force refetch the query
    //endpointName, // from useGetFriendsQuery -> getFriends
    //originalArgs, // the hook parameter
    //requestId, // unique id
    //fulfilledTimeStamp,
    //startedTimeStamp,
  } = useGetFriendsQuery();

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
        {chatFriendsArr && chatFriendsArr.length > 0 ? <ChatFriends /> : <p>No friends</p>}
      </Card>
    </div>
  );
};

export default Chat;
