import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { Langs } from "./notifTexts"

export interface Notif {
  /** For open/close the notification. */
  useNotif?: boolean

  /** The overall design. */
  notifType?: "loader" | "topBar"

  /** The main purpose of the specific notification. */
  contentType?: "online" | "offline"

  /** Text options. */
  header?: null | string
  message?: string

  /** The text of the agree button. */
  agree?: string
}

export interface NotifState {
  notif: Notif;
}

const initialState: NotifState = {
  /** Hide it by default. */
  notif: { useNotif: false },
}

export const NotifSlice = createSlice({
  name: "notif",
  initialState,
  reducers: {
    /** Send the settings to the notification modal. */
    setNotif: (state, action: PayloadAction<Notif>) => {
      const data = action.payload
      state.notif = data
    },
  },
})

export const { setNotif } = NotifSlice.actions;

export const selectNotif = (state: RootState) => state.notif.notif;

export default NotifSlice.reducer;
