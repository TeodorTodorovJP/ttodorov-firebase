import { createEntityAdapter, createSlice, EntityState, PayloadAction } from "@reduxjs/toolkit"
import { RootState, AppThunk } from "../../app/store"
// import { fetchChat } from "./chatApi";

import { collection, query, onSnapshot, DocumentData, FirestoreError, QuerySnapshot } from "firebase/firestore"
import { fireStore } from "../../firebase-config"
import { UserData } from "../Auth/userSlice"
import { getDateDataInUTC } from "../../app/utils"
import { InboxMessage } from "./chatApi"

type UsersArr = UserData[] | []

export interface ChatRoomsContent {
  /** The userId of the user that opened the room. */
  creator: string

  /** The current user names. */
  userNames: string

  /** The room id. */
  roomId: string

  /** Time of opening. */
  timestamp: Date | string

  /** The userId of the other user in the chat. */
  otherUserId: string

  /** The names of the other user in the chat. */
  otherUserNames: string

  /** The image of the other user. */
  otherUserImage: string

  /** The room is created and the param shows if it is opened, visible or not. */
  isOpened: boolean

  /** The room is created and is opened - the param shows if this room is currently visible. */
  active: boolean

  /** The css class of the room - used for storing the appropriate styling of the room tab. */
  tabClass: string

  /** Stores the messages a room has. */
  messages: []
}
export type UserRoomsArr = ChatRoomsContent[] | []

interface OpenRoomProps {
  /** The userId of the user that opened the room. */
  userId: string

  /** The current user names. */
  userNames: string

  /** The userId of the other user in the chat. */
  otherUserId: string

  /** The image of the other user. */
  otherUserImage: string

  /** The names of the other user in the chat. */
  otherUserNames: string
}

export interface ChatState {
  /** An array of all created chat rooms. */
  userRooms: UserRoomsArr

  /**
   * All users that are registered in the website.
   * An object which is an instance of createEntityAdapter containing all users.
   * */
  users: EntityState<UserData>

  /** Not yet used. TODO: Add state where the chat is still loading. */
  status: string

  /** For showing and hiding the chat rooms. */
  showRooms: boolean

  /**
   * If the user has no unread messages it's null.
   * If we have unread messages, it has a map of all unread messages for the current user.
   * */
  inbox: MessageDataObj | null
}

export interface MessageData {
  /** The userId of the user that sent the message. */
  userId: string

  /** The names of the sender. */
  name: string

  /** The text of the message. */
  text: string

  /** If the message is an image, this will be a blob url. */
  imageUrl: string

  /** The profile image of he sender. */
  profilePicUrl: string

  /** The time of sending the message. */
  timestamp: string

  /**
   * Times stamp from firebase server, don't use and don't delete.
   * In the front-end, it exists only to briefly store the reference from the server, which is then sent to the server again.
   * It is not standard format and it requires additional handling just to make sure it is there.
   * In the Firebase database it can be used to sort.
   * */
  serverTime?: any
}

export type MessageDataArr = MessageData[] | []

/**
 * A map of all unread messages the current user has.
 * @param key - The roomId.
 * The nested key inside Record (the "string") is the timestamp.
 * The InboxMessage holds all data about the unread message.
 */
export interface MessageDataObj {
  [key: string]: Record<string, InboxMessage>
}

// use createDraftSafeSelector for getting data from other reducers
const usersAdapter = createEntityAdapter<UserData>({
  //selectId: (user) => user.id, // example, not needed
  // sortComparer: (a, b) => b.timestamp.localeCompare(a.timestamp),
})

const getMainInitialState = () => {
  const newState: ChatState = {
    userRooms: [],
    users: usersAdapter.getInitialState(),
    status: "idle",
    showRooms: false,
    inbox: null,
  }
  return newState
}
const initialState = getMainInitialState()

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched. Thunks are
// typically used to make async requests.
// export const fetchUserRooms = createAsyncThunk("chat/fetchRooms", async (userId: string) => {});

/**
 * Left as an example.
 * Uses the Thunk approach to handle continuous connections for listening for changes.
 */
export const fetchUsers = (): AppThunk => async (dispatch) => {
  try {
    const usersCollectionQuery = query(collection(fireStore, "users"))
    console.log("listenToNotifications")
    const unsubscribe = onSnapshot(usersCollectionQuery, (querySnapshot) => {
      // This will trigger when a new room is added
      querySnapshot.docChanges().forEach((change) => {
        // types: "added", "modified", "removed"
        console.log("Type: ", change.type)
        const changeData = change.doc.data()
        console.log("changeData: ", changeData)
      })
    })

    return unsubscribe
  } catch (error) {
    console.error(error)
  }
}

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    openNewRoom: (state, action: PayloadAction<OpenRoomProps>) => {
      const { userId, userNames, otherUserId, otherUserImage, otherUserNames } = action.payload

      /**
       * This is the place where the roomId is generated.
       * "room" + the sorted userIds.
       * */
      const newRoomId = "room" + [userId, otherUserId].sort().join("")

      const prev = state.userRooms
      let roomFound = false
      const updatedRooms = prev.map((currentRoom) => {
        let room = { ...currentRoom }

        /** If the room was already created. */
        if (room.roomId === newRoomId) {
          room.otherUserNames = otherUserNames

          /** Since we are opening a room, by default it's opened and active. */
          room.isOpened = true
          room.active = true

          room.tabClass = ""

          /** Detect if the room was already created by the unread messages. */
          roomFound = true
        } else {
          /** Set all other rooms to not active. */
          room.active = false
        }
        return room
      })

      /**
       * If we have not found an existing room, the room is new.
       * Add room to local array.
       * */
      if (!roomFound) {
        const { utcDate: timestamp } = getDateDataInUTC()

        updatedRooms.push({
          creator: userId,
          userNames: userNames,
          roomId: newRoomId,
          timestamp,
          otherUserNames,
          otherUserId,
          otherUserImage,

          /** Since we are opening a new room, by default it's opened and active. */
          isOpened: true,
          active: true,

          tabClass: "",
          messages: [],
        })
      }
      state.userRooms = updatedRooms

      /** Since the user has opened a room, we have to show the rooms by default. */
      state.showRooms = true
    },
    closeRoom: (state, action: PayloadAction<{ roomId: string }>) => {
      const { roomId } = action.payload

      const prev = state.userRooms
      let assignedActive = false // not clear what it does

      const updatedRooms = prev
        .filter((room) => {
          return room.roomId !== roomId
        })
        .map((room) => {
          if (room.isOpened && !assignedActive) {
            assignedActive = true
            room.active = true
          }
          return room
        })
      state.userRooms = updatedRooms

      if (!assignedActive) {
        state.showRooms = false
      }
    },
    setShowRooms: (state, action: PayloadAction<{ showRooms: boolean }>) => {
      const { showRooms } = action.payload

      state.showRooms = showRooms

      /** If we are setting showRooms to false, we make all rooms not active, so that when we set it to true there will not be a default active room. */
      state.userRooms = state.userRooms.map((room) => {
        room.active = false
        return room
      })
    },
    addUsers: {
      // Left here only as an example.
      // It's replaced by rtkq - useGetUsersQuery
      reducer(state, action: PayloadAction<UsersArr>) {
        usersAdapter.upsertMany(state.users, action.payload)

        // const updatedState = { ...state.users.entities };
        // let newUser = false;
        // action.payload.forEach((user) => {
        //   if (!state.users.entities[user.id]) {
        //     newUser = true;
        //     updatedState[user.id] = user;
        //     return user;
        //   }
        // });
        // if (newUser) state.users.entities = updatedState;
      },
      // Used this method only to demonstrate it, otherwise it is redundant to iterate the same object twice:
      // once when filling the date from the response and again here
      prepare(payload: UserData[]) {
        const preparedPayload = payload.map((user) => {
          // user.timestamp = JSON.stringify(user.timestamp);
          return user
        })
        return {
          payload: preparedPayload,
        }
      },
    },
    clearChatData: (state) => getMainInitialState(),
    setInbox: (state, action: PayloadAction<{ inboxData: InboxMessage[] | null }>) => {
      const { inboxData } = action.payload

      /** To enable easy clear of the Inbox */
      if (inboxData === null) {
        state.inbox = null
      } else {
        let uniqueMessages: MessageDataObj = {}

        inboxData.forEach((msg) => {
          if (uniqueMessages[msg.roomId]) {
            /** If we have unread messages in that roomId, test if that message is already stored. */
            if (!uniqueMessages[msg.roomId][msg.timestamp]) {
              /** If the message was not stored, store it with timestamp as it's key. */
              uniqueMessages[msg.roomId][msg.timestamp] = msg
            }
          } else {
            /** If the don't yet have messages from that roomId, create an object for it. */
            uniqueMessages[msg.roomId] = {}
            /** Store the message with timestamp as it's key. */
            uniqueMessages[msg.roomId][msg.timestamp] = msg
          }
        })

        state.inbox = uniqueMessages
      }
    },
    deleteInboxMessages: (state, action: PayloadAction<{ roomId: string }>) => {
      const { roomId } = action.payload
      if (state.inbox) {
        /** If the room is opened, all unread messages inside are read. */
        delete state.inbox[roomId]
        if (Object.values(state.inbox).length === 0) {
          state.inbox = null
        }
      }
    },
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  // extraReducers: (builder) => {
  //   builder
  //     .addCase(fetchUsers.pending, (state) => {
  //       state.status = "loading";
  //     })
  //     .addCase(fetchUsers.fulfilled, (state, action) => {
  //       state.status = "idle";
  //       //state.value += action.payload;
  //     })
  //     .addCase(fetchUsers.rejected, (state) => {
  //       state.status = "failed";
  //     });
  // },
})

export const { addUsers, openNewRoom, closeRoom, setShowRooms, clearChatData, setInbox, deleteInboxMessages } =
  chatSlice.actions

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectUserRooms = (state: RootState) => state.chat.userRooms
export const selectActiveRoom = (state: RootState) => state.chat.userRooms.filter((room) => room.active)[0]
export const selectShowRooms = (state: RootState) => state.chat.showRooms
export const selectInbox = (state: RootState) => state.chat.inbox

// export const selectUsers = (state: RootState) => Object.values(state.chat.users.entities);

// Export the customized selectors for this adapter using `getSelectors`
export const {
  selectAll: selectUsers,
  // Pass in a selector that returns the posts slice of state
} = usersAdapter.getSelectors((state: RootState) => state.chat.users)

// https://redux.js.org/tutorials/essentials/part-6-performance-normalization#memoizing-selector-functions
// https://redux.js.org/usage/deriving-data-selectors
// use for memoization of store requests

// Memoized selectors are a valuable tool for improving performance in a React+Redux application,
// because they can help us avoid unnecessary re-renders, and also avoid doing potentially complex
// or expensive calculations if the input data hasn't changed.

// potentially use when chat messages is lifted in the store
// export const selectPostsByUser = createSelector(
//   [selectUserRooms, (state, userId) => userId],
//   (posts, userId) => posts.filter(post => post.user === userId)
// )

export default chatSlice.reducer
