import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import counterReducer from "../components/Counter/counterSlice";
import navigationReducer from "../components/Navigation/navigationSlice";
import chatReducer from "../components/Chat/chatSlice";
import userReducer from "../components/Auth/userSlice";

import { apiSlice } from "./apiSlice";
import { setupListeners } from "@reduxjs/toolkit/dist/query";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    navigation: navigationReducer,
    chat: chatReducer,
    user: userReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
