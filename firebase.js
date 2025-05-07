import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, addDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { initializeApp as adminInitializeApp, cert } from "firebase-admin/app";
import { getFirestore as adminFirestore, getAuth as adminAuth } from "firebase-admin/auth";

// Import the Firebase Admin Service Account
import serviceAccount from "./firebase-admin-key.json";

const firebaseConfig = {
  apiKey: "YOUR-API-KEY",
  authDomain: "YOUR-PROJECT-ID.firebaseapp.com",
  projectId: "YOUR-PROJECT-ID",
  storageBucket: "YOUR-PROJECT-ID.appspot.com",
  messagingSenderId: "YOUR-SENDER-ID",
  appId: "YOUR-APP-ID"
};

// Initialize Firebase for the client-side
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 🚀 Initialize Firebase Admin SDK for server-side operations
adminInitializeApp({
  credential: cert(serviceAccount)
});
const adminDB = adminFirestore();
const adminAuthInstance = adminAuth();

// 🚀 Sign In Function (Ensures Email Verification)
async function signIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (!user.emailVerified) {
      await sendEmailVerification(user);
      alert("Please verify your email first! Check your inbox.");
      return;
    }

    const userDoc = await getDoc(doc(db, "Users", user.uid));
    if (userDoc.exists()) {
      let userData = userDoc.data();
      alert(`Login successful! Welcome back, ${userData.email}`);
    } else {
      console.error("No user data found.");
    }
  } catch (error) {
    alert(error.message);
  }
}

// 🚀 Apply Referral Bonus
async function applyReferralBonus(referralCode) {
  try {
    const q = query(collection(db, "Users"), where("referralCode", "==", referralCode));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      snapshot.forEach(async (docRef) => {
        let referrerID = docRef.id;
        let referrerData = docRef.data();
        let newBalance = (referrerData.balance || 0) + 5;

        await updateDoc(doc(db, "Users", referrerID), { balance: newBalance });
        console.log("Referral bonus applied!");
      });
    } else {
      console.error("Invalid referral code.");
    }
  } catch (error) {
    console.error("Error checking referral code:", error);
  }
}

// 🚀 Buy Tokens
async function buyTokens(userID, amount) {
  try {
    const userDocRef = doc(db, "Users", userID);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      let currentBalance = userDoc.data().balance || 0;
      let newBalance = currentBalance + amount;

      await updateDoc(userDocRef, { balance: newBalance });
      await addDoc(collection(db, "Tokens"), {
        userID: userID,
        amountPurchased: amount,
        timestamp: new Date(),
      });

      alert("Purchase successful! Your balance has been updated.");
    } else {
      console.error("User not found.");
    }
  } catch (error) {
    console.error("Error updating balance:", error);
  }
}

// 🚀 Withdraw Tokens
async function withdrawTokens(userID, amount) {
  try {
    const userDocRef = doc(db, "Users", userID);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      let currentBalance = userDoc.data().balance || 0;

      if (amount > 0 && amount <= currentBalance) {
        let newBalance = currentBalance - amount;

        await updateDoc(userDocRef, { balance: newBalance });
        await addDoc(collection(db, "Withdrawals"), {
          userID: userID,
          amount: amount,
          timestamp: new Date(),
        });

        alert("Withdrawal request submitted! Your balance has been updated.");
      } else {
        alert("Invalid withdrawal amount.");
      }
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
}

export { db, auth, signIn, applyReferralBonus, buyTokens, withdrawTokens, adminDB, adminAuthInstance };