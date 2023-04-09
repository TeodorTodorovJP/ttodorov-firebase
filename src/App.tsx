import { useEffect, useState } from "react";
import classes from "./App.module.css";
// import "./App.css";
import Navigation from "./components/Navigation/Navigation";
import { Outlet } from "react-router-dom";
import Background from "./components/UI/Background/Background";
import Modal from "./components/Modal/Modal";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import {
  selectModal,
  setTheme,
  setUser,
  MainObj,
  defaultTheme,
  defaultLang,
  setModal,
} from "./components/Navigation/navigationSlice";
import useAuthContext from "./app/auth-context";
import { Langs } from "./components/Navigation/NavigationTexts";
import { getAuth, onAuthStateChanged, signInAnonymously, signOut } from "firebase/auth";
import { clearUserData, setUserData, UserData, userHasData } from "./components/Auth/userSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { fireStore, VAPID_KEY, messaging } from "./firebase-config";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useAddUserAsFriendMutation } from "./components/Chat/chatApi";
import useError from "./components/CustomHooks/useError";

// import useAuthContext from "./app/auth-context";

const App = () => {
  const dispatch = useAppDispatch();
  const userHasDataR = useAppSelector(userHasData);

  const [friendsError, setFriendsError] = useError();
  const [loginError, setLoginError] = useError();

  // const autoLogin = true;
  const [localHost, setLocalHost] = useState(false);

  // Context
  const authCtx = useAuthContext();

  // Router
  const navigate = useNavigate();

  const [addUserToFriends, { data: friendsData, isLoading: isSendingPost, isError, error }] =
    useAddUserAsFriendMutation();

  useEffect(() => {
    if (((isError && error) || (friendsData && friendsData.error)) && !friendsError) {
      setFriendsError([isError, error, friendsData], "ambiguousSource");
    }
  }, [isError, error, friendsData]);

  useEffect(() => {
    if (friendsError) {
      dispatch(setModal({ message: friendsError }));
    }
  }, [friendsError]);

  useEffect(() => {
    if (loginError) {
      dispatch(setModal({ message: loginError }));
    }
  }, [loginError]);

  useEffect(() => {
    if (document.location.hostname === "localhost") {
      document.title = "TTodorov DEV";
      setLocalHost(true);

      if (!authCtx.isLoggedIn) {
        anonymousSignIn();
      }
    } else {
      document.title = "TTodorov";
      if (!authCtx.isLoggedIn) {
        anonymousSignIn();
      }
    }

    let userDefaultTheme = localStorage.getItem("theme");
    userDefaultTheme = userDefaultTheme ? userDefaultTheme : defaultTheme;

    let userDefaultLang = localStorage.getItem("lang");
    userDefaultLang = userDefaultLang ? userDefaultLang : defaultLang;

    dispatch(setUser({ theme: userDefaultTheme, lang: userDefaultLang as keyof Langs }));

    let changeTheme: MainObj = { main: userDefaultTheme } as MainObj;
    dispatch(setTheme(changeTheme));
  }, []);

  const anonymousSignIn = () => {
    try {
      signInAnonymously(getAuth());
      //setSuccessFulLogin(successModal.anonymous);
    } catch (error: any) {}
  };

  useEffect(() => {
    return onAuthStateChanged(getAuth(), async (user: any) => {
      if (user) {
        // The signed-in user info.
        try {
          const getIdTokenResult = await user.getIdTokenResult();
          if (getIdTokenResult) {
            if (!user.isAnonymous && !userHasDataR) {
              const userObj: UserData = {
                id: user.uid,
                names: user.displayName ? user.displayName : user.email ? user.email : "Anonymous",
                email: user.email ? user.email : "No Email",
                profilePic: user.photoURL && !localHost ? user.photoURL : null, // Got 403 for too many requests of the image
              };

              // Add user to firebase
              addUserToFriends(userObj);
              // Add user to context
              authCtx.login(getIdTokenResult.token, getIdTokenResult.expirationTime);
              // Add user to store
              dispatch(setUserData(userObj));

              const navigateTo = window.location.pathname === "/auth" ? "/" : window.location.pathname;
              navigate(navigateTo);

              console.log("Signed in");
            } else if (user.isAnonymous && authCtx.isLoggedIn) {
              // If the user didn't login, but there is data in local storage
              // Context, local storage, state
              authCtx.logout();
              // Store
              dispatch(clearUserData());
            }
            dispatch(setModal({ useModal: false }));
            saveMessagingDeviceToken();
          }
        } catch (err) {
          setLoginError([err], "ambiguousSource");
        }
      } else if (authCtx.isLoggedIn) {
        authCtx.logout();
        dispatch(setUserData({ id: "", names: "" }));
        console.log("Signed out");
      }
    });
  }, [onAuthStateChanged]);

  // if ("serviceWorker" in navigator) {
  //   navigator.serviceWorker
  //     .register("./firebase-messaging-sw.js")
  //   }

  // Saves the messaging device token to Cloud Firestore.
  async function saveMessagingDeviceToken() {
    try {
      //console.log("before reg");
      // const registration = await navigator.serviceWorker.register("../firebase-messaging-sw.js", {
      //   type: "module",
      // });
      const currentToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        // serviceWorkerRegistration: registration,
      });
      //console.log(currentToken);
      if (currentToken) {
        //console.log("Got FCM device token:", currentToken);
        // Saving the Device Token to Cloud Firestore.
        const tokenRef = doc(fireStore, "fcmTokens", currentToken);
        const auth = getAuth();
        if (auth && auth.currentUser) {
          await setDoc(tokenRef, { uid: auth.currentUser.uid });

          // This will fire when a message is received while the app is in the foreground.
          // When the app is in the background, firebase-messaging-sw.js will receive the message instead.
          onMessage(messaging, (message: any) => {
            //console.log("New foreground notification from Firebase Messaging!");
          });
        }
      } else {
        // Need to request permissions to show notifications.
        requestNotificationsPermissions();
      }
    } catch (error) {
      console.error("Unable to get messaging token.", error);
    }
  }

  // Requests permissions to show notifications.
  async function requestNotificationsPermissions() {
    console.log("Requesting notifications permission...");
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      console.log("Notification permission granted.");
      // Notification permission granted.
      await saveMessagingDeviceToken();
    } else {
      console.error("Unable to get permission to notify.");
    }
  }

  return (
    <div className={classes.app}>
      <Modal />
      <Background />
      <Navigation />
      <div className={classes.outlet}>
        <Outlet />
      </div>
    </div>
  );
};

export default App;
// You can use autocomplete, look how to do it with user permission like popup or alert
// <input id="email" autocomplete="email" name="email" aria-required="true" placeholder="Email" required>
