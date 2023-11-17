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
  Typography,
} from "@mui/material"
import { useAddLogMutation } from "../../logsApi"
import Modal, { ModalProps, ModalTexts } from "./Modal"

/**
 * Modal is a React component that displays a modal dialog with varying content based on the current state.
 *
 * This component retrieves modal and theme data from the application store, and based on the modal type,
 * it prepares and displays appropriate content. It uses React portal to render the modal into a specific
 * DOM node called "modal" outside of the normal React component tree.
 */
const GlobalModal = () => {
  /** Access store */
  const dispatch = useAppDispatch()
  const modalStore = useAppSelector(selectModal)
  const { lang: currentLang } = useAppSelector(selectUserPreferences)
  /** Add log to firebase */
  const [addLog] = useAddLogMutation()
  /**
   * Prepare component data.
   */
  const { defaultModal } = langs[currentLang as keyof Langs]

  /**
   * Prepare the html element to which the modal will be sent.
   * This is a specific case for the "portal" React functionality.
   */
  const modalRoot = document.getElementById("modal") as HTMLInputElement | null

  /**
   * Default, show the modal.
   * Allows for easier dispatch for the modal.
   * When "open" is false, it is the only param that you need to close the modal.
   */
  let modal: ModalType = {
    ...modalStore,
    open: modalStore.open === false ? false : true,
    ok: defaultModal.ok,
  }

  const modalTexts: ModalTexts = {
    title: typeof modal.title === "string" ? modal.title : defaultModal.title,
    text: typeof modal.text === "string" ? modal.text : defaultModal.text,
    ok: typeof modal.ok === "string" ? modal.ok : defaultModal.ok,
    cancel: typeof modal.cancel === "string" ? modal.cancel : defaultModal.cancel,
  }

  /**
   * Log errors to Firebase.
   */
  if (modal.type === "error" && document.location.hostname !== "localhost") {
    addLog({ type: "Error", env: document.location.hostname, text: modal.text })
  }

  /**
   * Regardless of the button clicked on the modal it closes it, then the action is handled by the reducer based on the button.
   */
  const handleAction = (response: string) => {
    const modifiedModal = { ...modal }
    modifiedModal.open = false
    dispatch(setModal(modifiedModal))
  }

  let modalContent: JSX.Element

  if (modal.type === "loader") {
    /** If the modal is a type "loader, show only a loader animation. " */
    modalContent = (
      <Backdrop open={true} onClick={() => handleAction("cancel")}>
        <CircularProgress variant="indeterminate" thickness={5} size={150} disableShrink />
      </Backdrop>
    )
  } else {
    /** If the modal is not a "loader" add all necessary texts and buttons. */
    modalContent = (
      <Modal
        open={true}
        texts={{ title: modalTexts.title, text: modalTexts.text, ok: modalTexts.ok, cancel: modalTexts.cancel }}
        onUserResponse={handleAction}
      />
    )
  }

  const modalJSX: JSX.Element = modalContent

  if (modalRoot !== null && modal.open) {
    return createPortal(modalJSX, modalRoot)
  } else {
    return null // Todo Error handle
  }
}

export default GlobalModal
