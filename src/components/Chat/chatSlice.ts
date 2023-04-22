import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
  EntityStateAdapter,
  PayloadAction,
  ThunkAction,
} from "@reduxjs/toolkit";
import { RootState, AppThunk, AppDispatch } from "../../app/store";
// import { fetchChat } from "./chatApi";

import { collection, query, onSnapshot, DocumentData, FirestoreError, QuerySnapshot } from "firebase/firestore";
import { fireStore } from "../../firebase-config";
import { UserData } from "../Auth/userSlice";
import { getDateDataInUTC } from "../../app/utils";
import { InboxMessage } from "./chatApi"

type UsersArr = UserData[] | []

export interface ChatRoomsContent {
  creator: string
  userNames: string
  roomId: string
  timestamp: Date | string
  otherUserNames: string
  otherUserId: string
  otherUserImage: string
  isOpened: boolean
  active: boolean
  tabClass: string
  messages: []
}
export type UserRoomsArr = ChatRoomsContent[] | []

interface OpenRoomProps {
  userId: string
  userNames: string
  otherUserId: string
  otherUserImage: string
  otherUserNames: string
}

export interface ChatState {
  userRooms: UserRoomsArr
  users: EntityState<UserData>
  status: string
  showRooms: boolean
  inbox: MessageDataObj | null
}

export interface MessageData {
  userId: string
  name: string
  text: string
  imageUrl: string
  profilePicUrl: string
  timestamp: string
  serverTime?: any // Times stamp from firebase server, don't use
}

export type MessageDataArr = MessageData[] | []

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

      const newRoomId = "room" + [userId, otherUserId].sort().join("")

      const prev = state.userRooms
      let roomFound = false
      const updatedRooms = prev.map((currentRoom) => {
        let room = { ...currentRoom }

        if (room.roomId === newRoomId) {
          room.otherUserNames = otherUserNames
          room.isOpened = true
          room.active = true
          room.tabClass = ""
          roomFound = true
        } else {
          room.active = false
        }
        return room
      })

      if (!roomFound) {
        // add room to local array
        const { utcDate: timestamp } = getDateDataInUTC()

        updatedRooms.push({
          creator: userId,
          userNames: userNames,
          roomId: newRoomId,
          timestamp,
          otherUserNames,
          otherUserId,
          otherUserImage,
          isOpened: true,
          active: true,
          tabClass: "",
          messages: [],
        })
      }
      state.userRooms = updatedRooms
      state.showRooms = true
    },
    closeRoom: (state, action: PayloadAction<{ roomId: string }>) => {
      const { roomId } = action.payload

      const prev = state.userRooms
      let assignedActive = false

      const updatedRooms = prev
        .filter((room) => {
          return room.roomId !== roomId
        })
        .map((room) => {
          if (room.roomId === roomId) {
            room.isOpened = false
            room.active = false
          } else if (room.isOpened && !assignedActive) {
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

      if (inboxData === null) {
        state.inbox = null
      } else {
        let uniqueMessages: MessageDataObj = {}

        inboxData.forEach((msg) => {
          if (uniqueMessages[msg.roomId]) {
            if (!uniqueMessages[msg.roomId][msg.timestamp]) {
              uniqueMessages[msg.roomId][msg.timestamp] = msg
            }
          } else {
            uniqueMessages[msg.roomId] = {}
            uniqueMessages[msg.roomId][msg.timestamp] = msg
          }
        })

        state.inbox = uniqueMessages
      }
    },
    deleteInboxMessages: (state, action: PayloadAction<{ roomId: string }>) => {
      const { roomId } = action.payload
      if (state.inbox) {
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
} = usersAdapter.getSelectors((state: RootState) => state.chat.users);

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

export default chatSlice.reducer;
