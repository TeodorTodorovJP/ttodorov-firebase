import { ReactElement, useEffect, useState, MouseEvent } from "react";
import { createPortal } from "react-dom";
import classes from "./Modal.module.css";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { Modal as ModalType, selectModal, setModal } from "../Navigation/navigationSlice";
import Card from "../UI/Card";
import { langs, Langs } from "./ModalTexts";
import { selectTheme } from "../Navigation/themeSlice";
import { selectUserPreferences } from "../Auth/userSlice";

const Modal = () => {
  // Store
  const modalStore = useAppSelector(selectModal);
  const theme = useAppSelector(selectTheme);
  const { lang: currentLang } = useAppSelector(selectUserPreferences);

  const dispatch = useAppDispatch();

  // Texts
  const { defaultModal, loader, defaultError } = langs[currentLang as keyof Langs];

  const modalRoot = document.getElementById("modal") as HTMLInputElement | null;

  // Default, show the modal
  let modal: ModalType = {
    ...modalStore,
    useModal: modalStore.useModal === false ? false : true,
    agree: defaultModal.agree,
  };

  if (modal.modalType === "error") {
    modal.header = defaultError.message;
    modal.message = defaultError.message;
    modal.agree = defaultError.agree;
  }

  // Clicking the backdrop shouldn't hide the modal
  // It makes it useless
  // const handleBackdropClick = () => {
  //   if (modal.modalType === "loader") return;
  //   dispatch(setModal({ useModal: false }));
  // };

  const handleAction = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const button = (event.target as HTMLInputElement).name;

    const modifiedModal = { ...modal };
    modifiedModal.useModal = false;
    modifiedModal.response = button;

    dispatch(setModal(modifiedModal));
  };

  let modalContent: JSX.Element;

  if (modal.modalType === "loader") {
    modalContent = <div className={theme.loader}></div>;
  } else {
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
    );
  }

  const modalJSX: JSX.Element = (
    <div className={classes.modalWrapper}>
      <div className={classes.backdrop} />
      <Card additionalClass="modal">
        <div className={`${classes.modal}`}>{modalContent}</div>
      </Card>
    </div>
  );

  if (modalRoot !== null && modal.useModal) {
    return createPortal(modalJSX, modalRoot);
  } else {
    return null; // Todo Error handle
  }
};

export default Modal;
