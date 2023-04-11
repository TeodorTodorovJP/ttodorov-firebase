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

export interface FriendsContent {
  id: string;
  names: string;
  timestamp: string;
  email?: string;
  profilePic?: string;
}
type FriendsArr = FriendsContent[] | [];

interface Image {
  imageUrl: string;
  blobUrl: string;
}

export interface ChatRoomsContent {
  creator: string;
  userNames: string;
  roomId: string;
  timestamp: Date | string;
  otherUserNames: string;
  otherUserId: string;
  isOpened: boolean;
  active: boolean;
  tabClass: string;
}
export type UserRoomsArr = ChatRoomsContent[] | [];

interface OpenRoomProps {
  userId: string;
  userNames: string;
  otherUserId: string;
  otherUserNames: string;
}

export interface ChatState {
  userRooms: UserRoomsArr;
  friends: EntityState<FriendsContent>;
  status: string;
  showRooms: boolean;
  images: Image[];
}

type FirebaseTimeStamp = {
  seconds: number;
  nanoseconds: number;
};

export interface MessageData {
  userId: string;
  name: string;
  text: string;
  imageUrl: string;
  profilePicUrl: string;
  timestamp: FirebaseTimeStamp;
}

export type MessageDataArr = MessageData[] | [];

// use createDraftSafeSelector for getting data from other reducers
const friendsAdapter = createEntityAdapter<FriendsContent>({
  //selectId: (friend) => friend.id, // example, not needed
  sortComparer: (a, b) => b.timestamp.localeCompare(a.timestamp),
});

const initialState: ChatState = {
  userRooms: [],
  friends: friendsAdapter.getInitialState(),
  status: "idle",
  showRooms: false,
  images: [],
};

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched. Thunks are
// typically used to make async requests.
// export const fetchUserRooms = createAsyncThunk("chat/fetchRooms", async (userId: string) => {});

export const fetchFriends = (): AppThunk => async (dispatch) => {
  try {
    const friendsCollectionQuery = query(collection(fireStore, "friends"));
    console.log("listenToNotifications");
    const unsubscribe = onSnapshot(friendsCollectionQuery, (querySnapshot) => {
      // This will trigger when a new room is added
      querySnapshot.docChanges().forEach((change) => {
        // types: "added", "modified", "removed"
        console.log("Type: ", change.type);
        const changeData = change.doc.data();
        console.log("changeData: ", changeData);
      });
    });

    return unsubscribe;
  } catch (error) {
    console.error(error);
  }
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    openNewRoom: (state, action: PayloadAction<OpenRoomProps>) => {
      const { userId, userNames, otherUserId, otherUserNames } = action.payload;

      const newRoomId = "room" + [userId, otherUserId].sort().join("");

      const prev = state.userRooms;
      let roomFound = false;
      const updatedRooms = prev.map((currentRoom) => {
        let room = { ...currentRoom };

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
        const timeStamp = new Date().toISOString();
        updatedRooms.push({
          creator: userId,
          userNames: userNames,
          roomId: newRoomId,
          timestamp: timeStamp,
          otherUserNames,
          otherUserId,
          isOpened: true,
          active: true,
          tabClass: "",
        });
      }
      state.userRooms = updatedRooms;
      state.showRooms = true;
    },
    closeRoom: (state, action: PayloadAction<{ roomId: string }>) => {
      const { roomId } = action.payload;

      const prev = state.userRooms;
      let assignedActive = false;

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
      state.userRooms = updatedRooms;

      if (!assignedActive) {
        state.showRooms = false;
      }
    },
    setShowRooms: (state, action: PayloadAction<{ showRooms: boolean }>) => {
      const { showRooms } = action.payload;

      state.showRooms = showRooms;
    },
    addFriends: {
      // Left here only as an example.
      // It's replaced by rtkq - useGetFriendsQuery
      reducer(state, action: PayloadAction<FriendsArr>) {
        friendsAdapter.upsertMany(state.friends, action.payload);

        // const updatedState = { ...state.friends.entities };
        // let newFriend = false;
        // action.payload.forEach((friend) => {
        //   if (!state.friends.entities[friend.id]) {
        //     newFriend = true;
        //     updatedState[friend.id] = friend;
        //     return friend;
        //   }
        // });
        // if (newFriend) state.friends.entities = updatedState;
      },
      // Used this method only to demonstrate it, otherwise it is redundant to iterate the same object twice:
      // once when filling the date from the response and again here
      prepare(payload: FriendsContent[]) {
        const preparedPayload = payload.map((friend) => {
          friend.timestamp = JSON.stringify(friend.timestamp);
          return friend;
        });
        return {
          payload: preparedPayload,
        };
      },
    },
    addImageBlobUrl: (state, action: PayloadAction<{ imageUrl: string; blobUrl: string }>) => {
      state.images.push(action.payload);
    },
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  // extraReducers: (builder) => {
  //   builder
  //     .addCase(fetchFriends.pending, (state) => {
  //       state.status = "loading";
  //     })
  //     .addCase(fetchFriends.fulfilled, (state, action) => {
  //       state.status = "idle";
  //       //state.value += action.payload;
  //     })
  //     .addCase(fetchFriends.rejected, (state) => {
  //       state.status = "failed";
  //     });
  // },
});

export const { addFriends, openNewRoom, closeRoom, setShowRooms, addImageBlobUrl } = chatSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectUserRooms = (state: RootState) => state.chat.userRooms;
export const selectShowRooms = (state: RootState) => state.chat.showRooms;
export const selectImageBlobUrl = (state: RootState) => (imageUrl: string) =>
  state.chat.images.filter((i) => i.imageUrl === imageUrl);

// export const selectFriends = (state: RootState) => Object.values(state.chat.friends.entities);

// Export the customized selectors for this adapter using `getSelectors`
export const {
  selectAll: selectFriends,
  // Pass in a selector that returns the posts slice of state
} = friendsAdapter.getSelectors((state: RootState) => state.chat.friends);

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

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
// export const assignTheme =
//   (): AppThunk =>
//   (dispatch, getState) => {
//     const currentValue = selectTheme(getState());

//     dispatch(setTheme({main: 'red'}));
//   };

export default chatSlice.reducer;
