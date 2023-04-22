import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getStorage, ref } from "firebase/storage"

const config = {
  apiKey: "AIzaSyB-oRc7j1XHEkdr4ZkEM3crAIU7Yrx-EBo",
  authDomain: "ttodorovnet.firebaseapp.com",
  databaseURL: "https://ttodorovnet-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ttodorovnet",
  storageBucket: "ttodorovnet.appspot.com",
  messagingSenderId: "15250086966",
  appId: "1:15250086966:web:32c54c73f80f569f8ccc97",
  measurementId: "G-VW1THNC0ZX",
}

const app = initializeApp(config)
const fireStore = getFirestore(app)
const fileStorage = getStorage()
const fileStorageRef = ref(fileStorage)

export { app, fireStore, fileStorageRef, fileStorage }
