import { initializeApp } from "firebase/app";
import { getAuth }       from "firebase/auth";
import { getFirestore }  from "firebase/firestore";
import { getStorage }    from "firebase/storage";

const firebaseConfig = {
  apiKey:            process.env.REACT_APP_FB_API_KEY,
  authDomain:        process.env.REACT_APP_FB_AUTH_DOMAIN,
  projectId:         process.env.REACT_APP_FB_PROJECT_ID,
  storageBucket:     process.env.REACT_APP_FB_BUCKET,
  messagingSenderId: process.env.REACT_APP_FB_SENDER,
  appId:             process.env.REACT_APP_FB_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth     = getAuth(app);
export const db       = getFirestore(app);
export const storage  = getStorage(app);
