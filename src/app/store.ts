import { configureStore, ThunkAction, Action, createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import counterReducer from "../components/Counter/counterSlice";
import navigationReducer from "../components/Navigation/navigationSlice";
import modalReducer from "../components/Modal/modalSlice"
import themeReducer from "../components/Navigation/themeSlice";
import notifReducer from "../components/Notif/NotifSlice";

import chatReducer from "../components/Chat/chatSlice";
import userReducer from "../components/Auth/userSlice";
import backgroundReducer from "../components/UI/Background/backgroundSlice";

import { apiSlice } from "./apiSlice";
import { setupListeners } from "@reduxjs/toolkit/query/react";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    navigation: navigationReducer,
    modal: modalReducer,
    theme: themeReducer,
    notif: notifReducer,
    chat: chatReducer,
    user: userReducer,
    background: backgroundReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  // Attach the apiSlice as middleware, should be only one
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
})

// A utility used to enable refetchOnFocus and refetchOnReconnect behaviors.
setupListeners(store.dispatch);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
