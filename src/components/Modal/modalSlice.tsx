import { createAsyncThunk, createSlice, PayloadAction, ThunkAction } from "@reduxjs/toolkit"
import { RootState, AppThunk, AppDispatch } from "../../app/store"

export interface Modal {
  /** For open/close the modal. */
  open?: boolean

  /** For predefined modals. */
  type?: "normal" | "error" | "loader"

  /**
   * The title of the modal.
   * Can be null if the modal is of type 'loader'
   * */
  title?: null | string

  /** The message that will be displayed. */
  text?: string

  /** The text of the agree button. */
  ok?: string

  /**
   * The text of the cancel button.
   * Can be null for the modals that are intended to only notify the user.
   * */
  cancel?: null | string
}

export interface ModalState {
  modal: Modal
}
const getMainInitialState = () => {
  const newState: ModalState = {
    modal: {
      open: false, // False for closing the modal
      title: null,
      text: "Message",
      ok: "OK",
      cancel: null,
    },
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
     */
    setModal: (state, action: PayloadAction<Modal>) => {
      state.modal = action.payload
    },

    /** Reset's the modal state to the initial values. */
    clearModalData: (state) => getMainInitialState(),
  },
})

export const { setModal, clearModalData } = modalSlice.actions

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectModal = (state: RootState) => state.modal.modal

export default modalSlice.reducer
