// Firestore helper functions for the ballot
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

/*  Save or overwrite one voter’s choice
    username → document id (“john123”)                               */
export async function submitVote(username, uid, choice) {
  await setDoc(
    doc(db, "votes", username),
    { uid, choice, ts: serverTimestamp() },
    { merge: true }
  );
}

/*  Return { choice, ts } or null if the voter hasn’t voted yet      */
export async function fetchVote(username) {
  const snap = await getDoc(doc(db, "votes", username));
  return snap.exists() ? snap.data() : null;
}
