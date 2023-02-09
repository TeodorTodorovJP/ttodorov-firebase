import Card from "../UI/Card";
import classes from "./Chat.module.css";
import { Langs, langs } from "./ChatTexts";

import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  setDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getPerformance } from "firebase/performance";
import { FormEvent, useState } from "react";

import { useAppSelector } from "../../app/hooks";
import { selectUserData } from "../Auth/userSlice";

const Chat = () => {
  // Store
  const userData = useAppSelector(selectUserData);

  // Local state
  const [message, setMessage] = useState("");

  // Adds a size to Google Profile pics URLs.
  function addSizeToGoogleProfilePic(url: string) {
    if (url.indexOf("googleusercontent.com") !== -1 && url.indexOf("?") === -1) {
      return url + "?sz=150";
    }
    return url;
  }

  // Saves the messaging device token to Cloud Firestore.
  async function saveMessagingDeviceToken() {
    try {
      const currentToken = await getToken(getMessaging());
      if (currentToken) {
        console.log("Got FCM device token:", currentToken);
        // Saving the Device Token to Cloud Firestore.
        const tokenRef = doc(getFirestore(), "fcmTokens", currentToken);
        const auth = getAuth();
        if (auth && auth.currentUser) {
          await setDoc(tokenRef, { uid: auth.currentUser.uid });

          // This will fire when a message is received while the app is in the foreground.
          // When the app is in the background, firebase-messaging-sw.js will receive the message instead.
          onMessage(getMessaging(), (message) => {
            console.log("New foreground notification from Firebase Messaging!", message.notification);
          });
        }
      } else {
        // Need to request permissions to show notifications.
        requestNotificationsPermissions();
      }
    } catch (error) {
      console.error("Unable to get messaging token.", error);
    }

    /*
    Got FCM device token: dNx-oLJTBzsUanCib7gPRH:APA91bE6MW7XgECzNJM_UcsfPRy3_V_obihKT_Jw6g3iEzvaPjKHfKcIETfkP1Syv2nDbd7S9DZOpO5uXmKT7l6MVGM8OhhLqExUeJnsANlpIYDScZyj6UE2AAEhRoMmlN156E0bjJ6W
    */
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

  // Saves a new message to Cloud Firestore.
  const saveMessage = async (messageText: string) => {
    // Add a new message entry to the Firebase database.
    try {
      await addDoc(collection(getFirestore(), "messages"), {
        name: userData.names,
        text: messageText,
        profilePicUrl: userData.profilePic,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error writing new message to Firebase Database", error);
    }
  };

  // Returns true if a user is signed-in.
  function isUserSignedIn() {
    return !!getAuth().currentUser;
  }

  // Triggered when the send new message form is submitted.
  function onMessageFormSubmit(event: FormEvent) {
    event.preventDefault();
    // Check that the user entered a message and is signed in.
    if (message && isUserSignedIn()) {
      saveMessage(message)
        .then(function () {
          // Clear message text field and re-enable the SEND button.
          setMessage("");

          // disable send
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }

  return (
    <Card additionalClass="chat">
      <div className={classes.chat}>
        <div>
          <div>
            <div id="messages"></div>
            <form onSubmit={onMessageFormSubmit}>
              <div>
                <input
                  type="text"
                  onChange={(e) => {
                    setMessage(e.target.value);
                  }}
                />
                <label htmlFor="message">Message...</label>
              </div>
              <button id="submit" type="submit">
                Send
              </button>
            </form>
            {/* <form id="image-form" action="#">
              <input id="mediaCapture" type="file" accept="image/*" />
              <button id="submitImage" title="Add an image">
                <i className="material-icons">image</i>
              </button>
            </form> */}
          </div>
        </div>

        <div id="must-signin-snackbar">
          <button type="button"></button>
        </div>
      </div>
    </Card>
  );
};

export default Chat;
