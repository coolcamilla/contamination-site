import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore" 
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyAIMgCdjfel92p4pfhviy7pHGI0wiA6Wv4",
  authDomain: "contamination-site.firebaseapp.com",
  projectId: "contamination-site",
  storageBucket: "contamination-site.firebasestorage.app",
  messagingSenderId: "11963554314",
  appId: "1:11963554314:web:f35688a2c9098aee385df3"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);

export {firestore, auth};