import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { Langs } from "./NotifTexts";

export interface Notif {
  useNotif?: boolean;
  notifType?: "loader" | "topBar";
  contentType?: "online" | "offline";
  header?: null | string;
  message?: string;
  agree?: string;
}

export interface NotifState {
  notif: Notif;
}

const initialState: NotifState = {
  notif: { useNotif: false },
};

export const NotifSlice = createSlice({
  name: "notif",
  initialState,
  reducers: {
    setNotif: (state, action: PayloadAction<Notif>) => {
      const data = action.payload;
      state.notif = data;
    },
  },
});

export const { setNotif } = NotifSlice.actions;

export const selectNotif = (state: RootState) => state.notif.notif;

export default NotifSlice.reducer;
