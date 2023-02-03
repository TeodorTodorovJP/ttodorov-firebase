import { ReactElement, useEffect, useState, MouseEvent } from "react";
import { createPortal } from "react-dom";
import classes from "./Modal.module.css";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { selectModal, selectTheme, setModal } from "../Navigation/navigationSlice";
import Card from "../UI/Card";

const Modal = () => {
  // Store
  const modal = useAppSelector(selectModal);
  const theme = useAppSelector(selectTheme);
  const dispatch = useAppDispatch();

  const modalRoot = document.getElementById("modal") as HTMLInputElement | null;

  const handleBackdropClick = () => {
    const modifiedModal = { ...modal };
    modifiedModal.show = false;

    dispatch(setModal(modifiedModal));
  };

  const handleAction = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const button = (event.target as HTMLInputElement).name;

    const modifiedModal = { ...modal };
    modifiedModal.show = false;
    modifiedModal.response = button;

    dispatch(setModal(modifiedModal));
  };

  const modalJSX = (
    <div className={classes.modalWrapper}>
      <div className={classes.backdrop} onClick={handleBackdropClick} />
      <Card additionalClass="modal">
        <div className={`${classes.modal}`}>
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
        </div>
      </Card>
    </div>
  );

  if (modalRoot !== null && modal.show) {
    return createPortal(modalJSX, modalRoot);
  } else {
    return null; // Todo Error handle
  }
};

export default Modal;
