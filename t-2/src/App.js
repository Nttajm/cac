import React, { useRef, useState } from 'react';
import { useEffect } from 'react';

import './Main.css'; // Create a separate CSS file for SignIn styles if needed
import './Login.css';
import './Standard.css';
import './Scopes-2.css';
import './home.css';
import './messages.css';

import SignIn from './SignIn.js';
import SignUp from './SignUp.js';


import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, doc, where, getDoc, onSnapshot } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
// import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, limit, doc, setDoc } from 'firebase/firestore';


import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

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

// function App() {
//   const [user] = useAuthState(auth);

//   return (
//     <div className="App">
//         {user ? <Home /> : <SignIn />}
//     </div>
//   );
// }

function App() {

  const [user] = useAuthState(auth);

    return (
    <div className="App">
        {user ? <Home /> : <SignIn />}
    </div>
  );
}

function Home() {
  const [user] = useAuthState(auth);


  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      <div className={user ? 'app-home app-holder' : 'app-holder app-signUp'}>
        {!user ? (
          <SignUp />
        ) : (
          <>
            <nav className="phm-nav">
              <div className="phm-greet">
                <span>{getGreeting()}, {user.displayName}</span>
              </div>
              <div className="phm-profile">
                <img src={user.photoURL || 'pfp-3.jpg'} alt="Profile" className="pfp-1" />
              </div>
            </nav>
            <section>
              <h1>Scopes</h1>
              <Scopes />
            </section>
            <div className="bubble">  
              <SignOut />
            </div>
          </>
        )}
      </div>
    </>
  );
}




function Scopes() {
  const [scopes, setScopes] = useState([]);
  const [selectedScopeId, setSelectedScopeId] = useState(null);
  const [selectedClubId, setSelectedClubId] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [clubChats, setClubChats] = useState([]);

  useEffect(() => {
    const scopesRef = collection(firestore, 'scopes');
    const unsubscribe = onSnapshot(scopesRef, (querySnapshot) => {
      const scopesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setScopes(scopesList);
    });

    return () => unsubscribe();
  }, []);

  const handleScopeClick = (scopeId) => {
    setSelectedScopeId(scopeId);
    const clubsRef = collection(firestore, 'scopes', scopeId, 'clubs');
    const unsubscribe = onSnapshot(clubsRef, (querySnapshot) => {
      const clubsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClubs(clubsList);
    });

    return () => unsubscribe();
  };

  const handleClubClick = (clubId) => {
    setSelectedClubId(clubId);
    const clubChatsRef = collection(firestore, 'scopes', selectedScopeId, 'clubs', clubId, 'chats');
    const unsubscribe = onSnapshot(clubChatsRef, (querySnapshot) => {
      const clubChatsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClubChats(clubChatsList);
    });

    return () => unsubscribe();
  };

  const clubData = clubs.find(club => club.id === selectedClubId);
  const scopeName = scopes.find(scope => scope.id === selectedScopeId)?.name || 'Selected Scope';

  return (
    <div className='phm-scopes'>
      {scopes.length > 0 ? (
        scopes.map((scope) => (
          <div
            key={scope.id}
            className={`scope bubble ${scope.color}`}
            onClick={() => handleScopeClick(scope.id)}
          >
            <div className="scope-img">
              <img src="https://lcnjoel.com/images/thspng.png" alt={scope.name} />
            </div>
            <div className="scope-text">
              <span className="title">{scope.name}</span>
            </div>
          </div>
        ))
      ) : (
        <p>No scopes available</p>
      )}
      {selectedScopeId && (
        <div className="clubs-section app-holder app-clubs">
          <nav>
            <div className="scope-img">
              <img src="thspng.png" alt={scopeName} />
            </div>
            <div className="scope-text">
              <span className="title">{scopeName}</span>
            </div>
          </nav>
          <div className='cont'>
            <input type="text" className="inp-2" placeholder={scopeName}></input>
            
            {clubs.length > 0 ? (
              clubs.map((club) => (
                <div
                  className="club"
                  key={club.id}
                  onClick={() => handleClubClick(club.id)}
                >
                  <div className="club-emj">{club.letter}</div>
                  <div className="club-info">
                    <span className="club-name">{club.name}</span>
                    <div className="tags">
                      <span>Weekly</span>
                      <span>Room 23</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No clubs available for this scope</p>
            )}
          </div>
        </div>
      )}
      {clubData && selectedClubId && (
        <Chats clubData={clubData} isValid={true} clubChats={clubChats} selectedScopeId={selectedScopeId} />
      )}
    </div>
  );
}

function Chats({ clubData, isValid, clubChats, selectedScopeId }) {
  const [formValue, setFormValue] = useState('');
  const dummy = useRef();
  const [messageType, setMessageType] = useState('alert');

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;
    if (!formValue.trim()) return;
    try {
      await addDoc(collection(firestore, 'scopes', selectedScopeId, 'clubs', clubData.id, 'chats'), {
        message: formValue,
        createdAt: serverTimestamp(),
        uid,
        photoURL,
        messageType
      });
      setFormValue('');
      dummy.current.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className={isValid ? 'club-chats-section app-holder show' : 'club-chats-section app-holder'}>
      <nav>
        <div className="club-emj">
          {clubData.letter}
        </div>
        <div className="scope-text">
          <span className="title">{clubData.name}</span>
        </div>
      </nav>
      {clubChats.length > 0 ? (
        clubChats.map((chat) => (
          <div className={'message ' + (chat.uid === auth.currentUser.uid ? 'sent' : 'received' + messageType)} key={chat.id}>
            <span className="text">
              {chat.message}
            </span>
            <div className="info">
              <div className="person">
                <img src={chat.photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt="User Avatar" />
              </div>
              <div className="creator">
                <span>{new Date(chat.createdAt?.toDate()).toLocaleString()}</span>
                <span>Joel</span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>No chats available for this club</p>
      )}
      <span ref={dummy}></span>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          className="inp-2"
          placeholder="Type a message..."
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
        />
        <button type="submit" className="send-btn" disabled={!formValue}>Send</button>
      </form>
    </div>
  );
}





function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => signOut(auth)}>Sign Out</button>
  );
}


export default App;
