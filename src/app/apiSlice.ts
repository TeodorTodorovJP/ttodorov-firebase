// Import the RTK Query methods from the React-specific entry point
import { createApi, fetchBaseQuery, BaseQueryFn } from "@reduxjs/toolkit/query/react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { fireStore } from "../firebase-config";

// Define our single API slice object
export const apiSlice = createApi({
  // The cache reducer expects to be added at `state.api` (already default - this is optional)
  reducerPath: "api",
  // All of our requests will have URLs starting with '/fakeApi'
  baseQuery: fetchBaseQuery({ baseUrl: "/fakeApi" }),
  //keepUnusedDataFor: 30, // wait for 30 seconds before clearing the cache for all endpoints
  tagTypes: ["Post", "Friends", "Messages"],
  // The "endpoints" represent operations and requests for this server
  endpoints: (builder) => ({
    // The `getPosts` endpoint is a "query" operation that returns data
    getPosts: builder.query({
      // The URL for the request is '/fakeApi/posts'
      query: () => "/posts",
      //keepUnusedDataFor: 5, // wait for 5 seconds before clearing the cache for this endpoint
    }),
    getPost: builder.query({
      query: (postId) => `/posts/${postId}`,
      providesTags: ["Post"],
    }),
    addNewPost: builder.mutation({
      query: (initialPost) => ({
        url: "/posts",
        method: "POST",
        // Include the entire post object as the body of the request
        body: initialPost,
      }),
      invalidatesTags: ["Post"],
    }),
  }),
});

// Export the auto-generated hook for the `getPosts` query endpoint
//export const { useGetPostQuery, useAddNewPostMutation } = apiSlice;
