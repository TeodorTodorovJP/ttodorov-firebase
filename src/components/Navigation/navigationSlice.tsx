import { createAsyncThunk, createSlice, PayloadAction, ThunkAction } from "@reduxjs/toolkit";
import { RootState, AppThunk, AppDispatch } from "../../app/store";
import { Langs } from "./navigationTexts"

/** Set's the default language of the app. */
export const defaultLang: keyof Langs = "en"

/** Pending actions that will be executed when present. */
type AvailableActions = "changeDefaultTheme" | "test"
export type WaitingActions = AvailableActions[]

export interface Modal {
  /** For open/close the modal. */
  useModal?: boolean

  /** For predefined modals. */
  modalType?: "loader" | "error"

  /**
   * The predefined action that will happen if the user clicks agree.
   * Can be null if the modal will not perform any actions after user interaction.
   * TODO: remove the null.
   * */
  action?: null | string

  /**
   * The title of the modal.
   * Can be null if the modal is of type 'loader'
   * TODO: remove the null.
   * */
  header?: null | string

  /** The message that will be displayed. */
  message?: string

  /** The text of the agree button. */
  agree?: string

  /**
   * The text of the deny button.
   * Can be null for the modals that are intended to only notify the user.
   * TODO: remove the null.
   * */
  deny?: null | string

  /**
   * For attaching a custom response that will be handled.
   * Can be used in combination with agree and deny.
   * TODO: remove the null.
   */
  response?: null | string
}

/**
 * For handling all menu states.
 */
interface IsOpen {
  navLeftVisible: boolean
  navRightVisible: boolean
  showThemes: boolean
}

/** Initially all menu's a closed. */
const initialIsOpen: IsOpen = { navLeftVisible: false, navRightVisible: false, showThemes: false }

export interface NavigationState {
  status: "idle" | "loading" | "failed"
  modal: Modal
  waitingActions: WaitingActions
  isOpen: IsOpen
}
const getMainInitialState = () => {
  const newState: NavigationState = {
    status: "idle",
    modal: {
      useModal: false, // False for closing the modal
      action: null,
      header: null,
      message: "Message",
      agree: "OK",
      deny: null,
      response: null,
    },
    waitingActions: [],
    isOpen: initialIsOpen,
  }
  return newState
}

const initialState = getMainInitialState()

export const navigationSlice = createSlice({
  name: "navigation",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    /**
     * Set's the modal to whatever settings.
     * TODO: move this logic to a separate slice for the modal.
     */
    setModal: (state, action: PayloadAction<Modal>) => {
      const data = action.payload
      state.modal = data

      /** If the user has clicked agree. */
      if (data.response === "agree") {
        /** If it comes from the modal asking for change theme. */
        if (data.action === "changeDefaultTheme") {
          /** Attach a waiting action to do it safely outside the pure function slice. */
          if (state.waitingActions) {
            state.waitingActions = state.waitingActions.concat("changeDefaultTheme")
          }
        }
      }
    },
    /**
     * Removes a "waitingAction".
     */
    removeWaitingAction: (state, action: PayloadAction<{ waitingAction: string }>) => {
      state.waitingActions = state.waitingActions.filter((act) => act !== action.payload.waitingAction)
    },

    /** Opens a menu, passed to the item param. */
    setIsOpenToTrue: (state, action: PayloadAction<{ item: string; isOpen: boolean }>) => {
      const newIsOpen: IsOpen = { ...state.isOpen }

      newIsOpen[action.payload.item as keyof IsOpen] = action.payload.isOpen
      state.isOpen = newIsOpen
    },

    /** Closes all menus. */
    setAllOpenToFalse: (state) => {
      state.isOpen = initialIsOpen
    },

    /** Reset's the navigation state to the initial values. */
    clearNavData: (state) => getMainInitialState(),
  },
})

export const { setModal, setAllOpenToFalse, setIsOpenToTrue, clearNavData, removeWaitingAction } =
  navigationSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectModal = (state: RootState) => state.navigation.modal;
export const selectWaitingActions = (state: RootState) => state.navigation.waitingActions;
export const selectIsOpen = (state: RootState) => state.navigation.isOpen;

export default navigationSlice.reducer;
