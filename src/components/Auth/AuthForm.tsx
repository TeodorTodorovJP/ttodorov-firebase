import { useState, useRef, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import useAuthContext from "../../app/auth-context";
import Card from "../UI/Card";
import classes from "./AuthForm.module.css";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { Modal, selectLang, selectTheme, setModal } from "../Navigation/navigationSlice";
import { langs, Langs } from "./AuthTexts";

import { setUserData, UserData } from "./userSlice";

import { getAuth, GoogleAuthProvider, signInWithPopup, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, getFirestore } from "firebase/firestore";
import { getFirebaseConfig } from "../../firebase-config";
import { initializeApp } from "firebase/app";

const AuthForm = () => {
  // store
  const { button } = useAppSelector(selectTheme);
  const lang = useAppSelector(selectLang);
  const dispatch = useAppDispatch();

  // context
  const authCtx = useAuthContext();

  // local state
  const [isLogin, setIsLogin] = useState(true);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [browserError, setBrowserError] = useState<string | null>(null);
  const [successFulLogin, setSuccessFulLogin] = useState<string | null>(null);

  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  let provider = useRef<GoogleAuthProvider>();
  useEffect(() => {
    provider.current = new GoogleAuthProvider();
  });

  // Texts
  const { main, errorModal, successModal, browserErrorModal } = langs[lang as keyof Langs];

  // redux
  const navigate = useNavigate();

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

  const capitalizeFirstLetter = (word: string) => {
    return word.charAt(0) + word.slice(1).toLowerCase();
  };

  // Saves error message to Cloud Firestore.
  // Try to use anonymous way of credentials to avoid required auth errors
  const saveError = async (error: object) => {
    // Add a new message entry to the Firebase database.
    try {
      await addDoc(collection(getFirestore(), "errors"), {
        error: JSON.stringify(error),
      });
    } catch (error) {
      console.error("Error writing new message to Firebase Database", error);
    }
  };

  // Initialize Firebase
  initializeApp(getFirebaseConfig());

  const anonymousSignIn = () => {
    try {
      signInAnonymously(getAuth());
      setSuccessFulLogin(successModal.anonymous);
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      setGeneralError(`Error: ${errorCode} - ${errorMessage}`);
    }
  };

  const googleSignIn = async () => {
    if (provider.current) {
      // Sign in Firebase using popup auth and Google as the identity provider.
      signInWithPopup(getAuth(), provider.current)
        .then(() => {
          setSuccessFulLogin(successModal.google);
        })
        .catch((error) => {
          if (error.message.includes("auth/popup-closed-by-user")) {
            // User has closed the window
          } else if (error.message.toLowerCase().includes("disallowed_useragent")) {
            setBrowserError("disallowed_useragent");
          } else {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;

            // The email of the user's account used.
            // const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);

            let userObj = {
              errorCode,
              errorMessage,
              // email,
              credential,
            };

            // saveError(userObj);

            setGeneralError(`Error: ${errorCode} - ${errorMessage}`);
          }
        });
    } else {
      setGeneralError(`Error: could not create new Google Provider`);
    }
  };

  useEffect(() => {
    return onAuthStateChanged(
      getAuth(),
      async (user: any) => {
        if (user) {
          // The signed-in user info.
          const getIdTokenResult = await user.getIdTokenResult();
          if (getIdTokenResult) {
            let id: string = user.uid;
            let names = "Anonymous";

            let userObj: UserData = { id, names };

            if (!user.isAnonymous) {
              userObj.names = user.displayName;
              userObj.email = user.email;
              userObj.profilePic = user.photoURL || "/images/profile_placeholder.png";
            }
            dispatch(setUserData(userObj));
            authCtx.login(getIdTokenResult.token, getIdTokenResult.expirationTime);
          }
        } else {
          authCtx.logout();
          console.log("onAuthStateChanged signed out");
        }
      },
      (error: Error) => {
        const errorName = error.name;
        const errorMessage = error.message;

        setGeneralError(`Error: ${errorName} - ${errorMessage}`);
      }
    );
  }, [onAuthStateChanged]);

  const submitHandler = (event: FormEvent) => {
    event.preventDefault();
    setPasswordError(null);
    setEmailError(null);
    const enteredEmail = emailInputRef.current;
    const enteredPassword = passwordInputRef.current;

    let url;
    if (isLogin) {
      url =
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyB-oRc7j1XHEkdr4ZkEM3crAIU7Yrx-EBo";
    } else {
      url = "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyB-oRc7j1XHEkdr4ZkEM3crAIU7Yrx-EBo";
    }
    fetch(url, {
      method: "POST",
      body: JSON.stringify({
        email: enteredEmail && enteredEmail.value,
        password: enteredPassword && enteredPassword.value,
        returnSecureToken: true,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          return res.json().then((data) => {
            if (data && data.error && data.error.message) {
              let type = "OTHER";

              const error = data.error.message
                .split("_")
                .map((word: string) => capitalizeFirstLetter(word))
                .join(" ");

              if (error.includes("Email")) type = "EMAIL";

              if (error.includes("Password")) type = "PASSWORD";

              setGeneralError(type == "OTHER" ? error : null);
              setEmailError(type == "EMAIL" ? error : null);
              setPasswordError(type == "PASSWORD" ? error : null);
              // throw new Error(data.error.message);
            }
          });
        }
      })
      .then((data) => {
        if (!data) return;

        const expirationTime = new Date(new Date().getTime() + +data.expiresIn * 1000);
        authCtx.login(data.idToken, expirationTime.toISOString());
        navigate("/");
      })
      .catch((err) => {
        // Store all errors
        // alert(err.message);
      });
  };

  return (
    <Card additionalClass="authForm">
      <section className={classes.auth}>
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
            <div className={classes.googleAuth}>
              <button type="button" className={button} onClick={googleSignIn}>
                {main.googleSignIn}
              </button>
              <button type="button" className={button} onClick={anonymousSignIn}>
                {main.anonymousSignIn}
              </button>
            </div>
          </div>
        </form>
      </section>
    </Card>
  );
};

export default AuthForm;
