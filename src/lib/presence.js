import { getDatabase, ref, onDisconnect, set as rtdbSet, onValue } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

export function initPresence() {
  const rtdb = getDatabase();

  onAuthStateChanged(auth, user => {
    if (!user) return;

    // Watch connection state
    const infoRef = ref(rtdb, ".info/connected");

    // ← use onValue, not infoRef.on
    onValue(infoRef, snap => {
      if (snap.val() === false) return;
      const userRef = ref(rtdb, `presence/${user.uid}`);
      onDisconnect(userRef).remove();
      rtdbSet(userRef, true);
    });

    // Firestore heartbeat
    const beat = () =>
      setDoc(
        doc(db, "presence", user.uid),
        { ts: serverTimestamp() },
        { merge: true }
      );
    beat();
    const id = setInterval(beat, 20000);
    window.addEventListener("beforeunload", () => clearInterval(id));
  });
}
