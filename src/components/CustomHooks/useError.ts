import { useState } from "react";
import { useAppSelector } from "../../app/hooks";
import { stringifyJSON } from "../../app/utils";
import { selectLang } from "../Navigation/navigationSlice";
import ErrorTexts, { ErrorsType } from "./ErrorTexts";

interface Langs {
  bg: string;
  en: string;
}
// The type has to be either a string or a falsy value for easier check for error in the UI
type ErrorMessage = string | null | 0;
type ErrorObjSet = any | null;
interface PrepareFn {
  (error: any, type?: "ambiguousSource"): void;
}

const useError = () => {
  const currentLang = useAppSelector(selectLang);

  const [errorObj, setError] = useState<ErrorObjSet>(null);

  const prepareError: PrepareFn = (error: any, type?: "ambiguousSource") => {
    let currentError = error;
    if (type && type === "ambiguousSource") {
      error.forEach((e: any) => {
        if (e && (e.constructor === Object || e.constructor === Array)) currentError = e;
      });
    }
    setError((prev: ErrorObjSet) => {
      if (currentError === null) return prev;
      if (currentError.constructor.name === "String") {
        return { message: currentError };
      } else {
        return stringifyJSON(currentError);
      }
    });
  };

  let errorMessage: ErrorMessage = null;
  //console.log("errorObj", errorObj);
  if (errorObj !== null) {
    const FireErrors = ErrorTexts[currentLang as keyof Langs];

    const errorSource = typeof errorObj === "string" ? JSON.parse(errorObj) : errorObj;
    const errorData = errorSource.code
      ? errorSource.code
      : errorSource.message
      ? errorSource.message
      : errorSource.error;

    const error = errorData.toLowerCase().replace("auth/", "").replace("_", "-");

    errorMessage = FireErrors[error as keyof ErrorsType];
    if (!errorMessage) {
      // Default error if no error description is found
      errorMessage = errorData ? errorData : "Error";
    }
  }

  const returnArr = [errorMessage, prepareError] as [ErrorMessage, PrepareFn];

  return returnArr;
};

export default useError;
