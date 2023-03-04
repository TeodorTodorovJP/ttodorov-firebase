import { useState, useRef, FormEvent, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import useAuthContext from "../../app/auth-context";
import Card from "../UI/Card";
import classes from "./AuthForm.module.css";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { Modal, selectLang, selectTheme, setModal } from "../Navigation/navigationSlice";
import { langs, Langs } from "./AuthTexts";

import { selectUserData, setUserData, UserData, clearUserData } from "./userSlice";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updatePassword,
} from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";
import { fireStore } from "../../firebase-config";
import { FirebaseError } from "firebase/app";

const AuthForm = () => {
  // store
  const { button } = useAppSelector(selectTheme);
  const lang = useAppSelector(selectLang);
  const userData = useAppSelector(selectUserData);
  const dispatch = useAppDispatch();

  // context
  const authCtx = useAuthContext();

  // local state
  const [isLogin, setIsLogin] = useState(true);

  type AuthMethod = "options" | "email" | "google" | "anonymous" | "changePassword";
  const [authMethod, setAuthMethod] = useState<AuthMethod>("options");

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [browserError, setBrowserError] = useState<string | null>(null);
  const [successFulLogin, setSuccessFulLogin] = useState<string | null>(null);

  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const newPasswordInputRef = useRef<HTMLInputElement>(null);

  let provider = useRef<GoogleAuthProvider>();
  useEffect(() => {
    console.log("provider");
    provider.current = new GoogleAuthProvider();
  }, []);

  // Texts
  const { main, errorModal, successModal, browserErrorModal, loaderModal } = langs[lang as keyof Langs];

  const loaderModalData: Modal = {
    type: "notification",
    show: true,
    header: loaderModal.header,
    message: "",
    agree: "Loader",
    deny: null,
    response: "deny",
  };

  useEffect(() => {
    if (generalError) {
      const modalObj: Modal = {
        type: "notification",
        show: true,
        header: errorModal.header,
        message: generalError,
        agree: errorModal.agree,
        deny: null,
        response: "deny",
      };

      dispatch(setModal(modalObj));
      setGeneralError(null);
    }

    if (browserError) {
      const modalObj: Modal = {
        type: "notification",
        show: true,
        header: browserErrorModal.header,
        message: browserErrorModal.message,
        agree: browserErrorModal.agree,
        deny: null,
        response: "deny",
      };

      dispatch(setModal(modalObj));
      setGeneralError(null);
    }

    if (successFulLogin) {
      const modalObj: Modal = {
        type: "notification",
        show: true,
        header: successModal.header,
        message: successFulLogin,
        agree: successModal.agree,
        deny: null,
        response: "deny",
      };

      dispatch(setModal(modalObj));
      setSuccessFulLogin(null);
    }
  }, [generalError, browserError, successFulLogin]);

  // const errorDelay = 1000;
  // let waitUserEmail: ReturnType<typeof setTimeout>;
  // const handleEmailChange = () => {
  //   clearTimeout(waitUserEmail);

  //   waitUserEmail = setTimeout(() => {
  //     let ifError = false;
  //     if (emailInputRef.current?.value) {
  //       if (emailInputRef.current.value.length < 3) {
  //         ifError = true;
  //       }
  //       setIsEmailError(ifError);
  //     }
  //   }, errorDelay);
  // };

  const switchAuthModeHandler = () => {
    setIsLogin((prevState) => !prevState);
  };

  const switchAuthMethodHandler = (method: AuthMethod) => {
    setAuthMethod(method);
  };

  // Saves error message to Cloud Firestore.
  // Try to use anonymous way of credentials to avoid required auth errors
  const saveError = async (error: object) => {
    // Add a new message entry to the Firebase database.
    try {
      await addDoc(collection(fireStore, "errors"), {
        error: JSON.stringify(error),
      });
    } catch (error) {
      console.error("Error writing new message to Firebase Database", error);
    }
  };

  const handleError = (errorObj: FirebaseError) => {
    let type = "OTHER";
    const error = errorObj.code.toLowerCase();

    if (error.includes("email")) type = "EMAIL";
    if (error.includes("password")) type = "PASSWORD";

    setGeneralError(type == "OTHER" ? errorObj.message : null);
    setEmailError(type == "EMAIL" ? errorModal.email : null);
    setPasswordError(type == "PASSWORD" ? errorModal.password : null);
  };

  const anonymousSignIn = () => {
    dispatch(setModal(loaderModalData));
    try {
      signInAnonymously(getAuth());
      //setSuccessFulLogin(successModal.anonymous);
    } catch (error: any) {
      handleError(error);
    }
  };

  const googleSignIn = () => {
    dispatch(setModal(loaderModalData));
    if (provider.current) {
      // Sign in Firebase using popup auth and Google as the identity provider.
      signInWithPopup(getAuth(), provider.current).catch((error) => {
        if (error.message.includes("auth/popup-closed-by-user")) {
          dispatch(setModal({ ...loaderModalData, show: false }));
        } else if (error.message.toLowerCase().includes("disallowed_useragent")) {
          setBrowserError("disallowed_useragent");
        } else {
          handleError(error);
        }
      });
    } else {
      setGeneralError(`Error: could not create new Google Provider`);
    }
  };

  const updateProfilePassword = () => {
    const auth = getAuth();

    const newPassword = newPasswordInputRef.current?.value;
    if (auth && newPassword) {
      const user = auth.currentUser;
      if (user) {
        updatePassword(user, newPassword)
          .then(() => {
            // Update successful.
          })
          .catch((error) => {
            // An error ocurred
            // ...
          });
      }
    }
  };

  const submitHandler = (event: FormEvent) => {
    event.preventDefault();
    dispatch(setModal(loaderModalData));
    setPasswordError(null);
    setEmailError(null);
    const enteredEmail = emailInputRef.current?.value;
    const enteredPassword = passwordInputRef.current?.value;

    if (enteredEmail && enteredPassword) {
      const authRequest = isLogin ? signInWithEmailAndPassword : createUserWithEmailAndPassword;

      authRequest(getAuth(), enteredEmail, enteredPassword).catch((error) => {
        handleError(error);
      });
    }
  };

  return (
    <Card additionalClass="authForm">
      <section className={classes.auth}>
        {authMethod === "options" && (
          <div className={classes.options}>
            <h1>{main.options}</h1>

            <div className={classes.optionsBtns}>
              <button type="button" className={button} onClick={() => switchAuthMethodHandler("email")}>
                {main.email}
              </button>
              <button type="button" className={button} onClick={googleSignIn}>
                {main.googleSignIn}
              </button>
              <button type="button" className={button} onClick={anonymousSignIn}>
                {main.anonymousSignIn}
              </button>
            </div>
          </div>
        )}
        {authMethod === "email" && (
          <div className={classes.emailForm}>
            <div className={classes.backBtn}>
              <button type="button" className={button} onClick={() => switchAuthMethodHandler("options")}>
                {main.goBack}
              </button>
            </div>
            <h1>{isLogin ? main.login : main.createAccount}</h1>

            <form onSubmit={submitHandler}>
              <div className={`${classes.control} ${emailError && classes.error}`}>
                <label htmlFor="email">{main.yourEmail}</label>
                <input id="email" type="email" required ref={emailInputRef} />
              </div>

              {emailError && <p className={classes.errorText}>{emailError}</p>}

              <div className={`${classes.control} ${passwordError && classes.error}`}>
                <label htmlFor="password">{main.yourPassword}</label>
                <input id="password" type="password" required ref={passwordInputRef} />
              </div>

              {passwordError && <p className={classes.errorText}>{passwordError}</p>}

              <div className={classes.actions}>
                <div className={classes.emailAuth}>
                  <button className={button}>{isLogin ? main.login : main.createAccount}</button>
                  <button type="button" className={button} onClick={switchAuthModeHandler}>
                    {isLogin ? main.createAccount : main.goToLogin}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </section>
    </Card>
  );
};

export default AuthForm;
