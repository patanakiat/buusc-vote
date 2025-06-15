import {
  getDatabase, ref, onDisconnect, set as rSet, onValue
} from "firebase/database";
import {
  doc, setDoc, serverTimestamp, deleteDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";

/* call initPresence() once from index.js */
export function initPresence() {
  const rtdb = getDatabase();
  let beatId = null;                    // timer reference

  onAuthStateChanged(auth, user => {
    /* ------------- user signed OUT ------------- */
    if (!user) {
      if (beatId) {
        clearInterval(beatId);
        beatId = null;
      }
      return;
    }

    /* ------------- user signed IN -------------- */
    /* RTDB connection flag */
    const infoRef = ref(rtdb, ".info/connected");
    onValue(infoRef, snap => {
      if (snap.val() === false) return;
      const userRef = ref(rtdb, `presence/${user.uid}`);
      onDisconnect(userRef).remove();
      rSet(userRef, true);
    });

    /* Firestore heartbeat */
    const writeBeat = () =>
      setDoc(
        doc(db, "presence", user.uid),
        { ts: serverTimestamp() },
        { merge: true }
      );

    /* write immediately and then every 20 s */
    writeBeat();
    beatId = setInterval(writeBeat, 20_000);

    /* also remove presence doc when the tab really closes */
    window.addEventListener("beforeunload", () => {
      try { clearInterval(beatId); deleteDoc(doc(db, "presence", user.uid)); }
      catch (_) {}
    }, { once: true });
  });
}
