import { initializeApp } from "@firebase/app";
import { getAnalytics } from "@firebase/analytics";
import { getAuth } from "@firebase/auth";
import { getStorage } from "@firebase/storage";
import { getFirestore } from "@firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyDgvv6sPtuRligL_0ItLx2qx5ZUpBqilO4",
  authDomain: "abelens-7c501.firebaseapp.com",
  projectId: "abelens-7c501",
  storageBucket: "abelens-7c501.appspot.com",
  messagingSenderId: "770191910684",
  appId: "1:770191910684:web:3986825e316f8fdadffcd9",
  measurementId: "G-MRYPTCMFE1"
};
  
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage();
export const db = getFirestore()