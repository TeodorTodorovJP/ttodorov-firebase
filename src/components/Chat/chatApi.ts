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
  where,
  deleteDoc,
  getDocs,
} from "firebase/firestore"
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage"
import { apiSlice } from "../../app/apiSlice"
import { getDateDataInUTC, getError } from "../../app/utils"
import { fileStorageRef, fireStore } from "../../firebase-config"
import { UserData } from "../Auth/userSlice"
import { MessageData, MessageDataArr } from "./chatSlice"

export interface GetMessages {
  data: MessageDataArr
  error: any
}

export interface InboxMessage {
  /** The user that receives the messages. */
  userId: string

  /** The user that send's the messages. */
  messagesFrom: string

  /** The created roomId. */
  roomId: string

  /** Checks if the user receiving the messages, opened the Chat and looked at the rooms that have unread messages. */
  userClickedNotif: boolean

  /** Checks if the user opened the room and read the messages. */
  userOpenedRoom: boolean

  /** Time of sending the inbox messages. */
  timestamp: string

  /**
   * Times stamp from firebase server, don't use and don't delete.
   * In the front-end, it exists only to briefly store the reference from the server, which is then sent to the server again.
   * It is not standard format and it requires additional handling just to make sure it is there.
   * In the Firebase database it can be used to sort.
   * */
  serverTime?: string
}

export interface InboxMessages {
  data: InboxMessage[]
  error: any
}

interface SendImage {
  data: {
    imageUrl: string
    storageUri: string
  } | null
  error: any
}

interface DefaultQueryFnType {
  data: []
  error: any
}

export const extendedApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    //
    //
    getMessages: builder.query<GetMessages, string>({
      queryFn: (roomId: string) => ({ data: { data: [], error: null } }),
      keepUnusedDataFor: 60 * 60 * 24, // one day
      async onCacheEntryAdded(roomId, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        await cacheDataLoaded
        let unsubscribe
        try {
          const recentMessagesQuery = query(
            collection(fireStore, "allChatRooms", roomId, "messages"),
            orderBy("serverTime", "desc"),
            limit(12)
          )
          unsubscribe = onSnapshot(recentMessagesQuery, (querySnapshot) => {
            try {
              let prepareMessages: Record<string, MessageData> = {}
              // This will trigger when a new room is added
              querySnapshot.docChanges().forEach((change) => {
                // types: "added", "modified", "removed"
                const changeData = change.doc.data() as MessageData
                if (changeData.serverTime) {
                  delete changeData.serverTime
                }
                /** Fill the unique messages in a map. */
                if (!prepareMessages[changeData.timestamp]) {
                  prepareMessages[changeData.timestamp] = changeData
                }
              })
              updateCachedData((draft) => {
                /** Make a map of the old messages array. */
                // @ts-ignore
                const oldMessagesMap = draft.data.reduce((acc, cv: MessageData) => {
                  acc[cv.timestamp] = cv
                  return acc
                }, {})

                const mergedMap = { ...prepareMessages, ...oldMessagesMap }
                // @ts-ignore
                const sortedMessages = Object.values(mergedMap).sort((a, b) => +a.timestamp - +b.timestamp)

                draft.data = sortedMessages as MessageData[]

                draft.error = null
                return draft
              })
            } catch (err: any) {
              updateCachedData((draft) => {
                draft.error = getError(err)
                return draft
              })
            }
          })
        } catch (err: any) {
          updateCachedData((draft) => {
            draft.error = getError(err)
            return draft
          })
        }
        await cacheEntryRemoved
        if (unsubscribe) {
          unsubscribe()
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
          console.log("Check for room in db")
          const roomRef = doc(fireStore, "allChatRooms", args.roomId)
          const roomSnap = await getDoc(roomRef)

          if (!roomSnap.exists()) {
            const { utcDate: timestamp } = getDateDataInUTC()

            await setDoc(roomRef, {
              timestamp,
              userNames: args.userData.names,
              creator: args.userData.id,
              otherUserId: args.otherUser.id,
              otherUserNames: args.otherUser.names,
              roomId: args.roomId,
            })
            console.log("room added to db")
          }
        } catch (err: any) {
          return { data: { data: [], error: getError(err) } }
        }
        return { data: { data: [], error: null } }
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
          const { utcMilliseconds: timestamp } = getDateDataInUTC()
          const serverTime = serverTimestamp()

          await addDoc(collection(fireStore, "allChatRooms", args.roomId, "messages"), {
            userId: args.userData.id,
            name: args.userData.names,
            text: args.messageText ? args.messageText : "",
            profilePicUrl: args.userData.profilePic ? args.userData.profilePic : "",
            imageUrl: args.imageUrl ? args.imageUrl : "",
            timestamp: timestamp,
            serverTime: serverTime,
          })
        } catch (err: any) {
          return { data: { data: [], error: getError(err) } }
        }
        return { data: { data: [], error: null } }
      },
    }),
    //
    //
    saveImage: builder.mutation<SendImage, { userId: string; file: File }>({
      queryFn: async (args) => {
        try {
          /**
           * Upload the image to Cloud Storage.
           * Requirements - forbidden symbols in fileName - #, [, ], *, or ?
           * Remove all symbols that are not letters.
           */
          const fileName = args.file.name.replace(/[^\w]/gi, "")

          /** Here, the messageId is created. */
          const { utcDate: timestampId } = getDateDataInUTC()

          const filePath = `${args.userId}/${timestampId}/${fileName}`

          const newImageRef = ref(fileStorageRef, filePath)
          const fileSnapshot = await uploadBytesResumable(newImageRef, args.file)

          /** Generate a public URL for the file. */
          const publicImageUrl = await getDownloadURL(newImageRef)

          /** Response, that will be send to messages. */
          const data = {
            imageUrl: publicImageUrl,
            storageUri: fileSnapshot.metadata.fullPath,
          }

          return { data: { data: data, error: null } }
        } catch (err) {
          return { data: { data: null, error: getError(err) } }
        }
      },
    }),
    //
    //
    // The current user sends a message to another user
    // That other user, will receive that message to it's "inbox"
    /**
     * When the current user sends a message to another user,
     * this listener will receive the message.
     */
    inboxListener: builder.query<InboxMessages, string>({
      queryFn: (userId: string) => ({ data: { data: [], error: null } }),
      keepUnusedDataFor: 60 * 60 * 24, // one day
      async onCacheEntryAdded(userId, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        await cacheDataLoaded
        let unsubscribe
        try {
          /** Listen for messages in the current user's inbox. */
          const inboxMessagesQuery = query(
            collection(fireStore, "inboxes", userId, "messages"),
            orderBy("serverTime", "desc")
          )
          unsubscribe = onSnapshot(inboxMessagesQuery, (querySnapshot) => {
            try {
              let prepareMessages: Record<string, InboxMessage> = {}
              let removeMessages: string[] = []

              querySnapshot.docChanges().forEach((change) => {
                // types: "added", "modified", "removed"
                const changeData = change.doc.data() as InboxMessage

                if (change.type === "added" || change.type === "modified") {
                  delete changeData.serverTime

                  if (!prepareMessages[changeData.timestamp]) {
                    prepareMessages[changeData.timestamp] = changeData
                  }
                } else {
                  removeMessages.push(changeData.timestamp)
                }
              })
              updateCachedData((draft) => {
                const inboxMessages = Object.values(prepareMessages)
                if (inboxMessages.length > 0 || removeMessages.length > 0) {
                  // @ts-ignore
                  const sortedMessages = inboxMessages.sort((a, b) => +a.timestamp - +b.timestamp)

                  /** Remove any deleted unread messages. */
                  const withoutRemoved = draft.data.filter((msg) => !removeMessages.includes(msg.timestamp))

                  /** TODO: Check if that shows only unique messages. */
                  draft.data = [...withoutRemoved, ...sortedMessages] as InboxMessage[]
                } else {
                  draft.data = []
                }

                draft.error = null
                return draft
              })
            } catch (err: any) {
              updateCachedData((draft) => {
                draft.error = getError(err)
                return draft
              })
            }
          })
        } catch (err: any) {
          updateCachedData((draft) => {
            draft.error = getError(err)
            return draft
          })
        }
        await cacheEntryRemoved
        if (unsubscribe) {
          unsubscribe()
        }
      },
    }),
    //
    //
    /**
     * When the current user sends a message to another user,
     * that other user, will receive that message to it's "inbox".
     */
    sendToInbox: builder.mutation<DefaultQueryFnType, { roomId: string; userId: string; otherUserId: string }>({
      queryFn: async (args) => {
        try {
          const { utcMilliseconds: timestamp } = getDateDataInUTC()
          const serverTime = serverTimestamp()
          /** The argument is the user we are sending messages to.
           * TODO: Move the payload object to a separate object and type it, so that it receives it's documentation.
           * */
          await addDoc(collection(fireStore, "inboxes", args.otherUserId, "messages"), {
            userId: args.otherUserId, // owner of the "inbox"
            messagesFrom: args.userId, // The message sender
            roomId: args.roomId, // The created room
            userClickedNotif: false,
            userOpenedRoom: false,
            timestamp: timestamp,
            serverTime: serverTime,
          })
        } catch (err: any) {
          return { data: { data: [], error: getError(err) } }
        }
        return { data: { data: [], error: null } }
      },
    }),
    //
    //
    /**
     * When the current user has read the messages from the room with another user,
     * delete that room from the inbox.
     */
    deleteInboxMessage: builder.mutation<DefaultQueryFnType, { roomId: string; userId: string; otherUserId: string }>({
      queryFn: async (args) => {
        try {
          const recentMessagesQuery = query(
            collection(fireStore, "inboxes", args.userId, "messages"),
            where("roomId", "==", args.roomId)
          )
          const querySnapshot = await getDocs(recentMessagesQuery)

          querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            deleteDoc(doc.ref)
          })
        } catch (err: any) {
          return { data: { data: [], error: getError(err) } }
        }
        return { data: { data: [], error: null } }
      },
    }),
    //
    //
  }),
})

export const {
  useGetMessagesQuery,
  useSendNewRoomDataMutation,
  useSaveMessageMutation,
  useSaveImageMutation,
  useInboxListenerQuery,
  useSendToInboxMutation,
  useDeleteInboxMessageMutation,
} = extendedApi
