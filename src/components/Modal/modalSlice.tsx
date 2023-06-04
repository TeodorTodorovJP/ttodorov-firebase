import { createAsyncThunk, createSlice, PayloadAction, ThunkAction } from "@reduxjs/toolkit"
import { RootState, AppThunk, AppDispatch } from "../../app/store"

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
   * */
  action?: null | string

  /**
   * The title of the modal.
   * Can be null if the modal is of type 'loader'
   * */
  header?: null | string

  /** The message that will be displayed. */
  message?: string

  /** The text of the agree button. */
  agree?: string

  /**
   * The text of the deny button.
   * Can be null for the modals that are intended to only notify the user.
   * */
  deny?: null | string

  /**
   * For attaching a custom response that will be handled.
   * Can be used in combination with agree and deny.
   */
  response?: null | string
}

export interface ModalState {
  modal: Modal
  waitingActions: WaitingActions
}
const getMainInitialState = () => {
  const newState: ModalState = {
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
  }
  return newState
}

const initialState = getMainInitialState()

export const modalSlice = createSlice({
  name: "modal",
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

    /** Reset's the modal state to the initial values. */
    clearModalData: (state) => getMainInitialState(),
  },
})

export const { setModal, clearModalData, removeWaitingAction } = modalSlice.actions

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectModal = (state: RootState) => state.modal.modal
export const selectWaitingActions = (state: RootState) => state.modal.waitingActions

export default modalSlice.reducer
