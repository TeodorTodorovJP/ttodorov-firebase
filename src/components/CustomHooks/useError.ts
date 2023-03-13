import { FirebaseError } from "firebase/app";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { Modal, selectLang, setModal } from "../Navigation/navigationSlice";
import ErrorTexts, { ErrorsType } from "./ErrorTexts";

interface Langs {
  bg: string;
  en: string;
}
type ErrorMessage = string | null;
type errorObjSet = any | null;

const useError = (modalObj?: Modal) => {
  const currentLang = useAppSelector(selectLang);
  const dispatch = useAppDispatch();

  const [errorObj, setError] = useState<errorObjSet>(null);

  let errorMessage: ErrorMessage = null;

  if (errorObj !== null) {
    // save error to DB
    const FireErrors = ErrorTexts[currentLang as keyof Langs];

    const errorSource = errorObj.code ? errorObj.code : errorObj.message;

    const error = errorSource.toLowerCase().replace("auth/", "").replace("_", "-");

    let unexpectedError = false;
    errorMessage = FireErrors[error as keyof ErrorsType];
    if (!errorMessage) {
      unexpectedError = true;
      errorMessage = FireErrors["error-not-found" as keyof ErrorsType];
    }

    if (modalObj || unexpectedError) {
      const sendModal: Modal = { header: "Error", agree: "OK", message: errorMessage };
      if (modalObj) {
        if (modalObj.header) sendModal.header = modalObj.header;
        if (modalObj.agree) sendModal.agree = modalObj.agree;
        if (modalObj.action) sendModal.action = modalObj.action;
        if (modalObj.deny) sendModal.deny = modalObj.deny;
        if (modalObj.response) sendModal.response = modalObj.response;
      }

      errorMessage = null;
      dispatch(setModal(sendModal));
    }
  }

  const returnArr = [setError, errorMessage] as [errorObjSet, ErrorMessage];

  return returnArr;
};

export default useError;
