import { createAsyncThunk, createSlice, PayloadAction, ThunkAction } from "@reduxjs/toolkit";
import { RootState, AppThunk, AppDispatch } from "../../app/store";
import { Langs } from "./NavigationTexts";

export const defaultLang: keyof Langs = "en";

type AvailableActions = "changeDefaultTheme" | "test";
export type WaitingActions = AvailableActions[];

export interface Modal {
  useModal?: boolean; // false for closing the modal
  modalType?: "loader" | "error";
  action?: null | string;
  header?: null | string;
  message?: string;
  agree?: string;
  deny?: null | string;
  response?: null | string;
}

interface IsOpen {
  navLeftVisible: boolean;
  navRightVisible: boolean;
  showThemes: boolean;
}

const initialIsOpen: IsOpen = { navLeftVisible: false, navRightVisible: false, showThemes: false };

export interface NavigationState {
  status: "idle" | "loading" | "failed";
  modal: Modal;
  waitingActions: WaitingActions;
  isOpen: IsOpen;
}
const getMainInitialState = () => {
  const newState: NavigationState = {
    status: "idle",
    modal: {
      useModal: false,
      action: null,
      header: null,
      message: "Message",
      agree: "OK",
      deny: null,
      response: null,
    },
    waitingActions: [],
    isOpen: initialIsOpen,
  };
  return newState;
};

const initialState = getMainInitialState();

export const navigationSlice = createSlice({
  name: "navigation",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setModal: (state, action: PayloadAction<Modal>) => {
      const data = action.payload;
      state.modal = data;

      if (data.response === "agree") {
        if (data.action === "changeDefaultTheme") {
          if (state.waitingActions) {
            state.waitingActions = state.waitingActions.concat("changeDefaultTheme");
          }
        }
      }
    },
    removeWaitingAction: (state, action: PayloadAction<{ waitingAction: string }>) => {
      state.waitingActions = state.waitingActions.filter((act) => act !== action.payload.waitingAction);
    },
    setIsOpenToTrue: (state, action: PayloadAction<{ item: string; isOpen: boolean }>) => {
      const newIsOpen: IsOpen = { ...state.isOpen };

      newIsOpen[action.payload.item as keyof IsOpen] = action.payload.isOpen;
      state.isOpen = newIsOpen;
    },
    setAllOpenToFalse: (state) => {
      state.isOpen = initialIsOpen;
    },
    clearNavData: (state) => getMainInitialState(),
  },
});

export const { setModal, setAllOpenToFalse, setIsOpenToTrue, clearNavData, removeWaitingAction } =
  navigationSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectModal = (state: RootState) => state.navigation.modal;
export const selectWaitingActions = (state: RootState) => state.navigation.waitingActions;
export const selectIsOpen = (state: RootState) => state.navigation.isOpen;

export default navigationSlice.reducer;
