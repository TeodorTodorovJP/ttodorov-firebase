import { useEffect } from "react";
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
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { setUserData, UserData } from "./components/Auth/userSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { fireStore, VAPID_KEY, messaging } from "./firebase-config";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

// import useAuthContext from "./app/auth-context";

const App = () => {
  const dispatch = useAppDispatch();

  // Context
  const authCtx = useAuthContext();

  // Router
  const navigate = useNavigate();

  // const autoLogin = true;
  let localHost = false;

  useEffect(() => {
    if (document.location.hostname === "localhost") {
      document.title = "TTodorov DEV";
      localHost = true;

      // if (autoLogin) {
      //   const expirationTime = new Date(new Date().getTime() + 1 * 1000 * 60 * 60 * 24); // One day
      //   authCtx.login("Fake-Token", expirationTime.toISOString());
      // }
    } else {
      document.title = "TTodorov";
    }

    let userDefaultTheme = localStorage.getItem("theme");
    userDefaultTheme = userDefaultTheme ? userDefaultTheme : defaultTheme;

    let userDefaultLang = localStorage.getItem("lang");
    userDefaultLang = userDefaultLang ? userDefaultLang : defaultLang;

    if (!authCtx.isLoggedIn) {
      anonymousSignIn();
    }

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
        const getIdTokenResult = await user.getIdTokenResult();
        if (getIdTokenResult) {
          let id: string = user.uid;
          let names = "Anonymous";

          let userObj: UserData = { id, names };

          if (!user.isAnonymous) {
            userObj.names = user.displayName ? user.displayName : user.email;
            userObj.email = user.email ? user.email : "No Email";
            userObj.profilePic = user.photoURL && !localHost ? user.photoURL : null; // Got 403 for too many requests of the image
            addUserToFriends(userObj);
          }
          dispatch(setUserData(userObj));
          authCtx.login(getIdTokenResult.token, getIdTokenResult.expirationTime); // Not correct, firebase returns 2 hours old current date and expiration 1h after that is 1 hour behind
          console.log("Signed in");

          dispatch(setModal({ useModal: false }));

          const navigateTo = window.location.pathname === "/auth" ? "/" : window.location.pathname;
          navigate(navigateTo);
          saveMessagingDeviceToken();
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
      console.log("before reg");
      // const registration = await navigator.serviceWorker.register("../firebase-messaging-sw.js", {
      //   type: "module",
      // });
      const currentToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        // serviceWorkerRegistration: registration,
      });
      console.log(currentToken);
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
            console.log("New foreground notification from Firebase Messaging!");
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
      console.log("Unable to get permission to notify.");
    }
  }

  const addUserToFriends = async (userData: UserData) => {
    try {
      const friendRef = doc(fireStore, "friends", userData.id);
      const friendSnap = await getDoc(friendRef);

      if (!friendSnap.exists()) {
        const timestamp = serverTimestamp();
        await setDoc(friendRef, { timestamp, ...userData });
      }
    } catch (error) {
      console.error("Error creating new friend to Firebase Database", error);
    }
  };

  // Make these like helper functions
  // const accessibility = accessibilityProvider('div', 'label', 'customMessage');
  // const accessibility = {
  //   div: {
  //     role: "myRole", // if you want to make div into a button
  //     "aria-label": "aria-label-text", // for name
  //     "aria-expanded": "true", // in this case, this is the value
  //   },
  // };

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
