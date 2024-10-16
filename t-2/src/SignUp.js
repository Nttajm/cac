import React, { useRef, useState } from 'react';
import { useEffect } from 'react';

import { initializeApp } from 'firebase/app';
import { getAuth} from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, doc, where, getDoc } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
// import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, limit, doc, setDoc } from 'firebase/firestore';


// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAWDN0LUrAEsqT6gqjPwhORcp924ZDngFE",
  authDomain: "chat-3-7942e.firebaseapp.com",
  projectId: "chat-3-7942e",
  storageBucket: "chat-3-7942e.appspot.com",
  messagingSenderId: "589178656779",
  appId: "1:589178656779:web:5bf03576d4fe60e9354f0e",
  measurementId: "G-146SHE01R7"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const analytics = getAnalytics(app);

function SignUp({ onSignUp }) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [scopeCode, setScopeCode] = useState('');
    const [error, setError] = useState(null);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        // Add user details to Firestore
        await addDoc(collection(firestore, 'users'), {
          firstName,
          lastName,
          displayName,
          scopeCode,
          createdAt: serverTimestamp(),
        });
        onSignUp();  // Call the onSignUp callback after successful sign-up
      } catch (err) {
        console.error('Error adding document: ', err);
        setError('Failed to sign up');
      }
    };
  
    return (
      <form onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        {error && <p>{error}</p>}
        
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        
        <input
          type="text"
          placeholder="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
  
        <input
          type='text'
          placeholder='Scope Code'
          value={scopeCode}
          onChange={(e) => setScopeCode(e.target.value)}
          required
        />
  
        <button type="submit">Sign Up</button>
      </form>
    );
  }

export default SignUp;