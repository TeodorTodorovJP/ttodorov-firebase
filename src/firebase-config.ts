import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
import { getFirestore } from "firebase/firestore";

/**
 * To find your Firebase config object:
 *
 * 1. Go to your [Project settings in the Firebase console](https://console.firebase.google.com/project/_/settings/general/)
 * 2. In the "Your apps" card, select the nickname of the app for which you need a config object.
 * 3. Select Config from the Firebase SDK snippet pane.
 * 4. Copy the config object snippet, then add it here.
 */
// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const config = {
  apiKey: "AIzaSyB-oRc7j1XHEkdr4ZkEM3crAIU7Yrx-EBo",
  authDomain: "ttodorovnet.firebaseapp.com",
  databaseURL: "https://ttodorovnet-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ttodorovnet",
  storageBucket: "ttodorovnet.appspot.com",
  messagingSenderId: "15250086966",
  appId: "1:15250086966:web:32c54c73f80f569f8ccc97",
  measurementId: "G-VW1THNC0ZX",
};

export function getFirebaseConfig() {
  if (!config || !config.apiKey) {
    throw new Error(
      "No Firebase configuration object provided." +
        "\n" +
        "Add your web app's configuration object to firebase-config.js"
    );
  } else {
    return config;
  }
}

export const VAPID_KEY = "BGTum42lGqEdsfdrQPrPkw7Tagx7OFNNidBk5MAbJ4aD5atTv2ocJV0Qr6w6uRdZA8K2kRbuRZepiJJ1a6SYRoE";
// Initialize Firebase

const app = initializeApp(config);
const fireStore = getFirestore(app);
const messaging = getMessaging();

export { app, fireStore, messaging };
