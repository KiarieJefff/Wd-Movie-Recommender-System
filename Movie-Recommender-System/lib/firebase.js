import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBsknabI_XdqVXihz9iJCxDwhYpguar1zg",
  authDomain: "imdb-proj-1.firebaseapp.com",
  databaseURL: "https://imdb-proj-1-default-rtdb.firebaseio.com",
  projectId: "imdb-proj-1",
  storageBucket: "imdb-proj-1.firebasestorage.app",
  messagingSenderId: "260485455352",
  appId: "1:260485455352:web:21d2c708d165ced3acca0d",
  measurementId: "G-07LNW541S2"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);