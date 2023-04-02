import { collection, query, onSnapshot, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { apiSlice } from "../../app/apiSlice";
import { fireStore } from "../../firebase-config";
import { UserData } from "../Auth/userSlice";
import { FriendsContent } from "./chatSlice";

export const extendedApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addUserAsFriend: builder.mutation<FriendsContent[], UserData>({
      // The query is not relevant here as the data will be provided via streaming updates.
      // A queryFn returning an empty array is used, with contents being populated via
      // streaming updates below as they are received.
      queryFn: (userData: UserData) => ({ data: [] }),
      async onCacheEntryAdded(userData, { cacheDataLoaded, cacheEntryRemoved }) {
        const friendRef = doc(fireStore, "friends", userData.id);
        const friendSnap = await getDoc(friendRef);

        if (!friendSnap.exists()) {
          const timestamp = serverTimestamp();
          await setDoc(friendRef, { timestamp, ...userData });
        }
      },
    }),

    getFriends: builder.query<FriendsContent[], void>({
      // The query is not relevant here as the data will be provided via streaming updates.
      // A queryFn returning an empty array is used, with contents being populated via
      // streaming updates below as they are received.
      queryFn: () => ({ data: [] }),
      keepUnusedDataFor: 60 * 60 * 24, // one day
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        // create a websocket connection when the cache subscription starts

        // no-op in case `cacheEntryRemoved` resolves before `cacheDataLoaded`,
        // in which case `cacheDataLoaded` will throw
        await cacheDataLoaded;
        // when data is received from the socket connection to the server,
        // if it is a message and for the appropriate channel,
        // update our query result with the received message
        const friendsCollectionQuery = query(collection(fireStore, "friends"));
        const unsubscribe = onSnapshot(friendsCollectionQuery, (querySnapshot) => {
          let prepareFriends: FriendsContent[] = [];
          // This will trigger when a new room is added
          querySnapshot.docChanges().forEach((change) => {
            // types: "added", "modified", "removed"
            const changeData = change.doc.data();
            if (!changeData.timestamp) return;

            const prepareFriendsData: FriendsContent = {
              id: changeData.id,
              names: changeData.email,
              //timestamp: changeData.timestamp,
              timestamp: JSON.stringify(changeData.timestamp),
              email: changeData.email,
              profilePic: changeData.profilePic,
            };
            prepareFriends.push(prepareFriendsData);
          });
          updateCachedData(() => prepareFriends);
        });
        // cacheEntryRemoved will resolve when the cache subscription is no longer active
        await cacheEntryRemoved;
        // perform cleanup steps once the `cacheEntryRemoved` promise resolves
        unsubscribe();
      },
      providesTags: (result, error, arg) =>
        result ? [...result.map(({ id }) => ({ type: "Friends" as const, id })), "Friends"] : ["Friends"],
    }),
  }),
});

export const { useAddUserAsFriendMutation, useGetFriendsQuery } = extendedApi;
