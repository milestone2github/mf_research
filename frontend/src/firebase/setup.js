// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC0LAS9jccugiHgO5qjhVXiHzgtyGqCS5s",
  authDomain: "mftrans2-618a5.firebaseapp.com",
  projectId: "mftrans2-618a5",
  storageBucket: "mftrans2-618a5.appspot.com",
  messagingSenderId: "1051760324037",
  appId: "1:1051760324037:web:66dbf73a9d3042bea7efac"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)