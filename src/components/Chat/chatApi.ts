import { collection, query, onSnapshot } from "firebase/firestore";
import { fireStore } from "../../firebase-config";

export function fetchChat(userId: string) {
  const dbRooms = query(collection(fireStore, "chats", userId, "rooms"));

  // Start listening to the query.
  return onSnapshot(dbRooms, (snapshot) => {
    const rooms = snapshot.docChanges().map((change) => {
      const roomData = change.doc.data();

      return { roomData, roomId: change.doc.id };
    });
  });
}
