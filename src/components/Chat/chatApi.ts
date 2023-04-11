import {
  collection,
  query,
  onSnapshot,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  orderBy,
  limit,
  addDoc,
} from "firebase/firestore";
import { getBlob, getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { apiSlice } from "../../app/apiSlice";
import { RootState } from "../../app/store";
import { getError } from "../../app/utils";
import { fileStorage, fileStorageRef, fireStore } from "../../firebase-config";
import { selectUserData, UserData } from "../Auth/userSlice";
import { FriendsContent, MessageData, MessageDataArr } from "./chatSlice";

interface GetFriends {
  data: FriendsContent[];
  error: any;
}

interface GetMessages {
  data: MessageDataArr;
  error: any;
}

interface SendImage {
  data: {
    imageUrl: string;
    storageUri: string;
  } | null;
  error: any;
}

interface FetchImage {
  data: Blob | null;
  error: any;
}

interface DefaultQueryFnType {
  data: [];
  error: any;
}

export const extendedApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    //
    //
    addUserAsFriend: builder.mutation<DefaultQueryFnType, UserData>({
      // The query is not relevant here as the data will be provided via streaming updates.
      // A queryFn returning an empty array is used, with contents being populated via
      // streaming updates below as they are received.
      queryFn: async (userData: UserData) => {
        try {
          const friendRef = doc(fireStore, "friends", userData.id);
          const friendSnap = await getDoc(friendRef);

          if (!friendSnap.exists()) {
            const timestamp = serverTimestamp();
            await setDoc(friendRef, { timestamp, ...userData });
          }
        } catch (err: any) {
          return { data: { data: [], error: getError(err) } };
        }
        return { data: { data: [], error: null } };
      },
    }),
    //
    //
    getFriends: builder.query<GetFriends, void>({
      // The query is not relevant here as the data will be provided via streaming updates.
      // A queryFn returning an empty array is used, with contents being populated via
      // streaming updates below as they are received.
      queryFn: (uselessParam: void) => ({ data: { data: [], error: null } }),
      keepUnusedDataFor: 60 * 60 * 24, // one day
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        // create a websocket connection when the cache subscription starts

        // no-op in case `cacheEntryRemoved` resolves before `cacheDataLoaded`,
        // in which case `cacheDataLoaded` will throw
        await cacheDataLoaded;
        // when data is received from the socket connection to the server,
        // if it is a message and for the appropriate channel,
        // update our query result with the received message
        let unsubscribe;
        try {
          const friendsCollectionQuery = query(collection(fireStore, "friends"));
          unsubscribe = onSnapshot(friendsCollectionQuery, (querySnapshot) => {
            try {
              let prepareFriends: FriendsContent[] = [];
              // This will trigger when a new room is added
              querySnapshot.docChanges().forEach((change) => {
                // types: "added", "modified", "removed"
                const changeData = change.doc.data() as FriendsContent;
                if (!changeData.timestamp) return;
                changeData.timestamp = JSON.stringify(changeData.timestamp);
                prepareFriends.push(changeData);
              });
              updateCachedData((draft) => {
                draft.data = [...draft.data, ...prepareFriends];
                draft.error = null;
                return draft;
              });
            } catch (err: any) {
              updateCachedData((draft) => {
                draft.error = getError(err);
                return draft;
              });
            }
          });
        } catch (err: any) {
          updateCachedData((draft) => {
            draft.error = getError(err);
            return draft;
          });
        }
        // cacheEntryRemoved will resolve when the cache subscription is no longer active
        await cacheEntryRemoved;
        // perform cleanup steps once the `cacheEntryRemoved` promise resolves
        if (unsubscribe) {
          unsubscribe();
        }
      },
      // providesTags: (result, error, arg) =>
      //   result ? [...result.map(({ id }) => ({ type: "Friends" as const, id })), "Friends"] : ["Friends"],
    }),
    //
    //
    getMessages: builder.query<GetMessages, string>({
      queryFn: (roomId: string) => ({ data: { data: [], error: null } }),
      keepUnusedDataFor: 60 * 60 * 24, // one day
      async onCacheEntryAdded(roomId, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        await cacheDataLoaded;
        let unsubscribe;
        try {
          const recentMessagesQuery = query(
            collection(fireStore, "allChatRooms", roomId, "messages"),
            orderBy("timestamp"),
            limit(12)
          );
          unsubscribe = onSnapshot(recentMessagesQuery, (querySnapshot) => {
            try {
              let prepareMessages: MessageData[] = [];
              // This will trigger when a new room is added
              querySnapshot.docChanges().forEach((change) => {
                // types: "added", "modified", "removed"
                const changeData = change.doc.data() as MessageData;
                if (!changeData.timestamp) return;

                // converts the firebase response's timestamp type from deserialized(date) to serialized(object with properties)
                changeData.timestamp = { ...changeData.timestamp };
                prepareMessages.push(changeData);
              });
              updateCachedData((draft) => {
                draft.data = [...draft.data, ...prepareMessages];
                draft.error = null;
                return draft;
              });
            } catch (err: any) {
              updateCachedData((draft) => {
                draft.error = getError(err);
                return draft;
              });
            }
          });
        } catch (err: any) {
          updateCachedData((draft) => {
            draft.error = getError(err);
            return draft;
          });
        }
        await cacheEntryRemoved;
        if (unsubscribe) {
          unsubscribe();
        }
      },
    }),
    //                            ResultType            QueryArg
    //                                  v                 v
    sendNewRoomData: builder.mutation<DefaultQueryFnType, { roomId: string; userData: UserData; otherUser: UserData }>({
      // inferred as the type from the `QueryArg` type
      //                 v
      queryFn: async (args, { signal, dispatch, getState }, extraOptions, baseQuery) => {
        try {
          console.log("Check for room in db");
          const roomRef = doc(fireStore, "allChatRooms", args.roomId);
          const roomSnap = await getDoc(roomRef);

          if (!roomSnap.exists()) {
            const timestamp = serverTimestamp();

            await setDoc(roomRef, {
              timestamp,
              userNames: args.userData.names,
              creator: args.userData.id,
              otherUserId: args.otherUser.id,
              otherUserNames: args.otherUser.names,
              roomId: args.roomId,
            });
            console.log("room added to db");
          }
        } catch (err: any) {
          return { data: { data: [], error: getError(err) } };
        }
        return { data: { data: [], error: null } };
      },
    }),
    //
    //
    saveMessage: builder.mutation<
      DefaultQueryFnType,
      { roomId: string; userData: UserData; otherUser: UserData; messageText?: string; imageUrl?: string }
    >({
      queryFn: async (args) => {
        try {
          await addDoc(collection(fireStore, "allChatRooms", args.roomId, "messages"), {
            userId: args.userData.id,
            name: args.userData.names,
            text: args.messageText ? args.messageText : "",
            profilePicUrl: args.userData.profilePic ? args.userData.profilePic : "",
            imageUrl: args.imageUrl ? args.imageUrl : "",
            timestamp: serverTimestamp(),
          });
        } catch (err: any) {
          return { data: { data: [], error: getError(err) } };
        }
        return { data: { data: [], error: null } };
      },
    }),
    //
    //
    saveImage: builder.mutation<SendImage, { roomId: string; userId: string; file: File }>({
      queryFn: async (args) => {
        try {
          // 1 - Upload the image to Cloud Storage.
          // forbidden symbols in fileName - #, [, ], *, or ?
          // remove all symbols that are not letters
          const fileName = args.file.name.replace(/[^\w]/gi, "");
          const timestampId = serverTimestamp(); // as message id

          const filePath = `${args.roomId}/${args.userId}/${fileName}/${timestampId}`;

          const newImageRef = ref(fileStorageRef, filePath);
          const fileSnapshot = await uploadBytesResumable(newImageRef, args.file);

          // 3 - Generate a public URL for the file.
          const publicImageUrl = await getDownloadURL(newImageRef);

          // response, that will be send to messages
          const data = {
            imageUrl: publicImageUrl,
            storageUri: fileSnapshot.metadata.fullPath,
          };

          return { data: { data: data, error: null } };
        } catch (err) {
          return { data: { data: null, error: getError(err) } };
        }
      },
    }),
  }),
});

export const {
  useAddUserAsFriendMutation,
  useGetFriendsQuery,
  useGetMessagesQuery,
  useSendNewRoomDataMutation,
  useSaveMessageMutation,
  useSaveImageMutation,
} = extendedApi;
