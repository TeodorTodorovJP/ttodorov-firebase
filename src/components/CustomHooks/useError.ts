import { FirebaseError } from "firebase/app";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { Modal, selectLang, setModal } from "../Navigation/navigationSlice";
import ErrorTexts, { ErrorsType } from "./ErrorTexts";

interface Langs {
  bg: string;
  en: string;
}
// The type has to be either a string or a falsy value for easier check for error in the UI
type ErrorMessage = string | null | 0;
type errorObjSet = any | null;

const useError = () => {
  const currentLang = useAppSelector(selectLang);

  const [errorObj, setError] = useState<errorObjSet>(null);

  let errorMessage: ErrorMessage = null;

  if (errorObj !== null) {
    const FireErrors = ErrorTexts[currentLang as keyof Langs];

    const errorSource = errorObj.code ? errorObj.code : errorObj.message;

    const error = errorSource.toLowerCase().replace("auth/", "").replace("_", "-");

    errorMessage = FireErrors[error as keyof ErrorsType];
    if (!errorMessage) {
      errorMessage = 0;
    }
  }

  const returnArr = [errorMessage, setError] as [ErrorMessage, errorObjSet];

  return returnArr;
};

export default useError;
