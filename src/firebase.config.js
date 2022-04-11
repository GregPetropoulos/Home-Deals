// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// brought the firestor database in here
import {getFirestore} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAkRpadniphVow0M0FQoOPX8JkNDrccLdM",
  authDomain: "home-deals-app.firebaseapp.com",
  projectId: "home-deals-app",
  storageBucket: "home-deals-app.appspot.com",
  messagingSenderId: "582782092849",
  appId: "1:582782092849:web:56ec2648b6dba5fed0f710",
  measurementId: "G-6L8S2VQD50"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore()