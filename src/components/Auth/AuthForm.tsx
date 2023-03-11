import { useState, useRef, FormEvent, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import useAuthContext from "../../app/auth-context";
import Card from "../UI/Card";
import classes from "./AuthForm.module.css";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { Modal, selectLang, selectTheme, setModal } from "../Navigation/navigationSlice";
import { langs, Langs } from "./AuthTexts";
import useError from "../CustomHooks/useError";
import ErrorTexts, { ErrorsType } from "../CustomHooks/ErrorTexts";

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
  const currentLang = useAppSelector(selectLang);
  const userData = useAppSelector(selectUserData);
  const dispatch = useAppDispatch();

  // context
  const authCtx = useAuthContext();

  // local state
  const [isLogin, setIsLogin] = useState(true);

  type AuthMethod = "options" | "email" | "google" | "anonymous" | "changePassword";
  const [authMethod, setAuthMethod] = useState<AuthMethod>("options");

  const [setEmailError, emailError] = useError();
  const [setPasswordError, passwordError] = useError();
  const [setGeneralError] = useError();

  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const newPasswordInputRef = useRef<HTMLInputElement>(null);

  let provider = useRef<GoogleAuthProvider>();
  useEffect(() => {
    try {
      provider.current = new GoogleAuthProvider();
    } catch (error) {
      setGeneralError(error);
    }
  }, []);

  // Texts
  const { main, loaderModal } = langs[currentLang as keyof Langs];

  const loaderModalData: Modal = {
    useModal: true,
    header: loaderModal.header,
    message: "",
    agree: "Loader", // Should be replaced with loading animation
    deny: null,
    response: "deny",
  };

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

  const anonymousSignIn = () => {
    dispatch(setModal(loaderModalData));
    try {
      signInAnonymously(getAuth());
    } catch (error: any) {}
  };

  const googleSignIn = () => {
    dispatch(setModal(loaderModalData));
    if (provider.current) {
      // Sign in Firebase using popup auth and Google as the identity provider.
      signInWithPopup(getAuth(), provider.current).catch((error) => {
        if (error.message.includes("auth/popup-closed-by-user")) {
          dispatch(setModal({ useModal: false }));
        } else {
          setGeneralError(error);
        }
      });
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
    setEmailError(null);
    setPasswordError(null);
    dispatch(setModal(loaderModalData));
    const enteredEmail = emailInputRef.current?.value;
    const enteredPassword = passwordInputRef.current?.value;

    if (enteredEmail && enteredPassword) {
      const authRequest = isLogin ? signInWithEmailAndPassword : createUserWithEmailAndPassword;

      authRequest(getAuth(), enteredEmail, enteredPassword).catch((error) => {
        dispatch(setModal({ useModal: false }));
        const errorCode = error.code;
        if (errorCode.includes("email")) {
          setEmailError(error);
        } else if (errorCode.includes("password")) {
          setPasswordError(error);
        } else {
          setGeneralError(error);
        }
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
              {/* <button type="button" className={button} onClick={anonymousSignIn}>
                {main.anonymousSignIn}
              </button> */}
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
                <input id="email" required ref={emailInputRef} />
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
