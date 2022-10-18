import firebase from 'firebase';

var firebaseConfig = {
  apiKey: "AIzaSyBzkAdS_s4sV7gNjpBMvnuYDyRLEcYscPI",
  authDomain: "d3-react-cf276.firebaseapp.com",
  projectId: "d3-react-cf276",
  storageBucket: "d3-react-cf276.appspot.com",
  messagingSenderId: "592277183253",
  appId: "1:592277183253:web:c2cfa1289f19691d12671c",
  measurementId: "G-4VLXGWVKD4"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
db.settings({timestampsInSnapshots: true})
firebase.analytics();
export default db;