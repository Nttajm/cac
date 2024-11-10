import React from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

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

function SignIn() {
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Create a user object to add to Firestore
      const userRef = doc(firestore, 'users', user.uid);
      const userData = {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: new Date(), // timestamp for when the user was created
        hasEnteredCode: false, // flag to check if the user has entered a code
      };

      // Set the user data in Firestore
      await setDoc(userRef, userData, { merge: true });
      console.log("User data added to Firestore:", userData);

    } catch (error) {
      console.error('Error during Google sign-in:', error);
      // Show an error message to the user
    }
  };

  const signInWithEmail = () => {
    // Handle email sign-in logic here
  };

  const signInWithApple = () => {
    // Handle Apple sign-in logic here
  };

  return (
    <>
      <div className="blob-sec">
        <div className="blob"></div>
        <div className="blob"></div>
        <div className="blob"></div>
      </div>

      <div className="signup">
        <div className="text">
          <div>
            <span>Mind.</span>
            <span>Find.</span>
            <div className="switcher">
              <div className="s-items">
                <span>Explore.</span>
                <span>chat.</span>
                <span>Create.</span>
                <span>Explore.</span>
                <span>chat.</span>
                <span>Create.</span>
              </div>
            </div>
            <span className="s">with friends and more.</span>
          </div>
        </div>
        <div className="buttons">
          <div onClick={signInWithGoogle}>
            <img src="image.png" alt="" />
            <span>Continue with Google</span>
          </div>
          <div className="email" onClick={signInWithEmail}>
            <span>Continue with email</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignIn;
