import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import counterReducer from "../components/Counter/counterSlice";
import navigationReducer from "../components/Navigation/navigationSlice";
import chatReducer from "../components/Chat/chatSlice";
import userReducer from "../components/Auth/userSlice";


export const store = configureStore({
  reducer: {
    counter: counterReducer,
    navigation: navigationReducer,
    chat: chatReducer,
    user: userReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
