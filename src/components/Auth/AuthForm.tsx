import { useState, useRef, FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import useAuthContext from "../../app/auth-context";
import Card from "../UI/Card";
import classes from "./AuthForm.module.css";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { Modal, selectTheme, setModal } from "../Navigation/navigationSlice";

const AuthForm = () => {
  // store
  const { button } = useAppSelector(selectTheme);
  const dispatch = useAppDispatch();

  // context
  const authCtx = useAuthContext();

  // local state
  const [isLogin, setIsLogin] = useState(true);
  const [createAccount, setCreateAccount] = useState(true);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // redux
  const navigate = useNavigate();

  if (generalError) {
    const modalObj: Modal = {
      type: "do nothing",
      show: true,
      header: "Error",
      message: generalError,
      agree: "OK",
      deny: null,
      response: "deny",
    };

    dispatch(setModal(modalObj));
  }

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

  // let waitUserPassword: ReturnType<typeof setTimeout>;
  // const handlePasswordChange = () => {
  //   clearTimeout(waitUserPassword);

  //   waitUserPassword = setTimeout(() => {
  //     let ifError = false;
  //     if (passwordInputRef.current?.value) {
  //       if (passwordInputRef.current.value.length < 3) {
  //         ifError = true;
  //       }
  //       setIsPasswordError(ifError);
  //     }
  //   }, errorDelay);
  // };

  const switchAuthModeHandler = () => {
    setIsLogin((prevState) => !prevState);
  };

  const capitalizeFirstLetter = (word: string) => {
    return word.charAt(0) + word.slice(1).toLowerCase();
  };

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

  /*
  create account
  login
  logout
  */

  return (
    <Card additionalClass="authForm">
      <section className={classes.auth}>
        <h1>{isLogin ? "Login" : "Create Account"}</h1>

        <form onSubmit={submitHandler}>
          <div className={`${classes.control} ${emailError && classes.error}`}>
            <label htmlFor="email">Your Email</label>
            <input id="email" type="email" required ref={emailInputRef} />
          </div>

          {emailError && <p className={classes.errorText}>{emailError}</p>}

          <div className={`${classes.control} ${passwordError && classes.error}`}>
            <label htmlFor="password">Your Password</label>
            <input id="password" type="password" required ref={passwordInputRef} />
          </div>

          {passwordError && <p className={classes.errorText}>{passwordError}</p>}

          <div className={classes.actions}>
            <button className={button}>{isLogin ? "Login" : "Create Account"}</button>
            <button type="button" className={button} onClick={switchAuthModeHandler}>
              {isLogin ? "Create account" : "Go to Login"}
            </button>
          </div>
        </form>
      </section>
    </Card>
  );
};

export default AuthForm;
