import {
  collection,
  query,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { apiSlice } from "../../app/apiSlice";
import { getDateDataInUTC, getError } from "../../app/utils";
import { fileStorageRef, fireStore } from "../../firebase-config";
import { UserData } from "../Auth/userSlice";
import { MessageData, MessageDataArr } from "./chatSlice";

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

interface DefaultQueryFnType {
  data: [];
  error: any;
}

export const extendedApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
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
            orderBy("serverTime", "desc"),
            limit(12)
          );
          unsubscribe = onSnapshot(recentMessagesQuery, (querySnapshot) => {
            try {
              let prepareMessages: Record<string, MessageData> = {};
              // This will trigger when a new room is added
              querySnapshot.docChanges().forEach((change) => {
                // types: "added", "modified", "removed"
                const changeData = change.doc.data() as MessageData;
                if (changeData.serverTime) {
                  delete changeData.serverTime;
                }
                if (!prepareMessages[changeData.timestamp]) {
                  prepareMessages[changeData.timestamp] = changeData;
                }
              });
              updateCachedData((draft) => {
                // @ts-ignore
                const oldMessagesMap = draft.data.reduce((acc, cv: MessageData) => {
                  acc[cv.timestamp] = cv;
                  return acc;
                }, {});

                const mergedMap = { ...prepareMessages, ...oldMessagesMap };
                // @ts-ignore
                const sortedMessages = Object.values(mergedMap).sort((a, b) => +a.timestamp - +b.timestamp);

                draft.data = sortedMessages as MessageData[];

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
            const { utcDate: timestamp } = getDateDataInUTC();

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
          const { utcMilliseconds: timestamp } = getDateDataInUTC();
          const serverTime = serverTimestamp();

          await addDoc(collection(fireStore, "allChatRooms", args.roomId, "messages"), {
            userId: args.userData.id,
            name: args.userData.names,
            text: args.messageText ? args.messageText : "",
            profilePicUrl: args.userData.profilePic ? args.userData.profilePic : "",
            imageUrl: args.imageUrl ? args.imageUrl : "",
            timestamp: timestamp,
            serverTime: serverTime,
          });
        } catch (err: any) {
          return { data: { data: [], error: getError(err) } };
        }
        return { data: { data: [], error: null } };
      },
    }),
    //
    //
    saveImage: builder.mutation<SendImage, { userId: string; file: File }>({
      queryFn: async (args) => {
        try {
          // 1 - Upload the image to Cloud Storage.
          // forbidden symbols in fileName - #, [, ], *, or ?
          // remove all symbols that are not letters
          const fileName = args.file.name.replace(/[^\w]/gi, "");
          const { utcDate: timestampId } = getDateDataInUTC(); // as message id

          const filePath = `${args.userId}/${timestampId}/${fileName}`;

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
    //
    //
  }),
});

export const { useGetMessagesQuery, useSendNewRoomDataMutation, useSaveMessageMutation, useSaveImageMutation } =
  extendedApi;
