import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAUmjmCaawAlQUvKYBd3GSdEZvw0GUWxxs",
  authDomain: "calculator-javascript123.firebaseapp.com",
  databaseURL: "https://calculator-javascript123.firebaseio.com",
  projectId: "calculator-javascript123",
  storageBucket: "calculator-javascript123.appspot.com",
  messagingSenderId: "520299893352",
  appId: "1:520299893352:web:ce8241012661bd969be1dd",
  measurementId: "G-WS6KH5XSXT",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

export { app, database };
