import { ReactElement, useEffect, useState, MouseEvent } from "react";
import { createPortal } from "react-dom";
import classes from "./Modal.module.css";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { Modal as ModalType, selectModal, setModal } from "../Navigation/navigationSlice";
import Card from "../UI/Card";
import { langs, Langs } from "./modalTexts"
import { selectTheme } from "../Navigation/themeSlice"
import { selectUserPreferences } from "../Auth/userSlice"

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
  const theme = useAppSelector(selectTheme)
  const { lang: currentLang } = useAppSelector(selectUserPreferences)

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
    modal.header = defaultError.message
    modal.message = defaultError.message
    modal.agree = defaultError.agree
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
  const handleAction = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()

    const button = (event.target as HTMLInputElement).name

    const modifiedModal = { ...modal }
    modifiedModal.useModal = false
    modifiedModal.response = button

    dispatch(setModal(modifiedModal))
  }

  let modalContent: JSX.Element

  if (modal.modalType === "loader") {
    /** If the modal is a type "loader, show only a loader animation. " */
    modalContent = <div className={theme.loader}></div>
  } else {
    /** If the modal is not a "loader" add all necessary texts and buttons. */
    modalContent = (
      <>
        <h2>{modal.header}</h2>
        <div className={classes.message}>{modal.message}</div>
        <div className={classes.actions}>
          <button name="agree" className={theme.button} onClick={handleAction}>
            {modal.agree}
          </button>
          {modal.deny && (
            <button name="deny" className={theme.button} onClick={handleAction}>
              {modal.deny}
            </button>
          )}
        </div>
      </>
    )
  }

  const modalJSX: JSX.Element = (
    <div className={classes.modalWrapper}>
      <div className={classes.backdrop} />
      <Card additionalClass="modal">
        <div className={`${classes.modal}`}>{modalContent}</div>
      </Card>
    </div>
  )

  if (modalRoot !== null && modal.useModal) {
    return createPortal(modalJSX, modalRoot)
  } else {
    return null // Todo Error handle
  }
}

export default Modal;
