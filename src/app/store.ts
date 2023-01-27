import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import counterReducer from "../components/Counter/counterSlice";
import navigationReducer from "../components/Navigation/navigationSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    navigation: navigationReducer,
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
