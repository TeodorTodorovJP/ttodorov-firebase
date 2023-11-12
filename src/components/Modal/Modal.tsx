import { createPortal } from "react-dom"
import { useAppSelector, useAppDispatch } from "../../app/hooks"
import { langs, Langs } from "./modalTexts"
import { selectUserPreferences } from "../Auth/userSlice"
import { Modal as ModalType, selectModal, setModal } from "./modalSlice"
import {
  Backdrop,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material"
import { useAddLogMutation } from "../../logsApi"

/**
 * Modal is a React component that displays a modal dialog with varying content based on the current state.
 *
 * This component retrieves modal and theme data from the application store, and based on the modal type,
 * it prepares and displays appropriate content. It uses React portal to render the modal into a specific
 * DOM node called "modal" outside of the normal React component tree.
 */
const Modal = () => {
  /** Access store */
  const dispatch = useAppDispatch()
  const modalStore = useAppSelector(selectModal)
  const { lang: currentLang } = useAppSelector(selectUserPreferences)
  /** Add log to firebase */
  const [addLog] = useAddLogMutation()
  /**
   * Prepare component data.
   */
  const { defaultModal, loader, defaultError } = langs[currentLang as keyof Langs]

  /**
   * Prepare the html element to which the modal will be sent.
   * This is a specific case for the "portal" React functionality.
   */
  const modalRoot = document.getElementById("modal") as HTMLInputElement | null

  /**
   * Default, show the modal.
   * Allows for easier dispatch for the modal.
   * When "useModal" is false, it is the only param that you need to close the modal.
   */
  let modal: ModalType = {
    ...modalStore,
    useModal: modalStore.useModal === false ? false : true,
    agree: defaultModal.agree,
  }

  /**
   * Default Error modal.
   */
  if (modal.modalType === "error") {
    //modal.header = defaultError.message
    //modal.message = defaultError.message
    //modal.agree = defaultError.agree
    if (document.location.hostname !== "localhost") {
      addLog({ type: "Error", env: document.location.hostname, text: modal.message })
    }
  }

  // Clicking the backdrop shouldn't hide the modal
  // It makes it useless
  // const handleBackdropClick = () => {
  //   if (modal.modalType === "loader") return;
  //   dispatch(setModal({ useModal: false }));
  // };

  /**
   * Regardless of the button clicked on the modal it closes it, then the action is handled by the reducer based on the button.
   */
  const handleAction = (fromPlace: string) => {
    const modifiedModal = { ...modal }
    modifiedModal.useModal = false
    modifiedModal.response = fromPlace

    dispatch(setModal(modifiedModal))
  }

  let modalContent: JSX.Element

  if (modal.modalType === "loader") {
    /** If the modal is a type "loader, show only a loader animation. " */
    modalContent = (
      <Backdrop open={true} onClick={() => handleAction("deny")}>
        <CircularProgress variant="indeterminate" thickness={5} size={150} disableShrink />
      </Backdrop>
    )
  } else {
    /** If the modal is not a "loader" add all necessary texts and buttons. */
    modalContent = (
      <Dialog onClose={() => handleAction("deny")} open={true}>
        <DialogTitle>{modal.header}</DialogTitle>
        <DialogContent>
          <DialogContentText>{modal.message}</DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => handleAction("agree")} autoFocus>
            {modal.agree}
          </Button>
          {modal.deny && <Button onClick={() => handleAction("deny")}>{modal.deny}</Button>}
        </DialogActions>
      </Dialog>
    )
  }

  const modalJSX: JSX.Element = modalContent

  if (modalRoot !== null && modal.useModal) {
    return createPortal(modalJSX, modalRoot)
  } else {
    return null // Todo Error handle
  }
}

export default Modal
