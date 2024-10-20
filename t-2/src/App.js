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
        <div className='onLoad'>
          <div className='onLoad-img-div'>
            <img src='myndfindlogo.png' alt='MyndFind Logo' className='onLoad-img' />
          </div>
        </div>
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
  const [showHelloWorld, setShowHelloWorld] = useState(false);
  const [isOverflowHidden, setIsOverflowHidden] = useState(false); // State to control overflow

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

  const handleCreateClubClick = () => {
    setShowHelloWorld(true);
    setIsOverflowHidden(true); // Set overflow to hidden when "Create" is clicked
  };

  const clubData = clubs.find(club => club.id === selectedClubId);
  const scopeName = scopes.find(scope => scope.id === selectedScopeId)?.name || 'Selected Scope';
  const scope = scopes.find(scope => scope.id === selectedScopeId);

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
              <img src={scope.img} alt={scope.name} />
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
        <div className={`app-holder app-clubs ${isOverflowHidden ? 'overflow-hidden' : ''}`}>
          <nav>
            <div className="scope-img">
              <img src={''} alt={scopeName} /> 
            </div>
            <div className="scope-text">
              <span className="title">{scopeName}</span>
            </div>
          </nav>
          <div className='cont'>
            <input type="text" className="inp-2" placeholder={scopeName} />
            <ClubsSchedule clubs={clubs} handleClubClick={handleClubClick} />
            <div className="bubble create-club">
              <button className="btn-3" onClick={handleCreateClubClick}>
                  Create a club
              </button>
            </div>
            <Clubs clubs={clubs} scopeName={scopeName} handleClubClick={handleClubClick} />
            {showHelloWorld && (
              <CreateClub />
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


function CreateClub() {
  const [selectedDay, setSelectedDay] = useState("monday"); // default day
  const [selectedFrequency, setSelectedFrequency] = useState("weekly"); // default frequency

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const dayLabels = ["M", "T", "W", "TH", "F", "S", "SU"];

  const frequencies = ["weekly", "bi-weekly", "monthly"];

  return (
    <div className="create customscroll">
      <h1>My club</h1>
      <form action="">
        <div className="input-sec">
          <div className="form-input" id="name-of-club">
            <label htmlFor="name">Club name</label>
            <span className="ex">EX: athlete recognition club</span>
            <input type="text" id="club-name" className="inp-3" />
          </div>
          <div className="form-input">
            <label htmlFor="name">Letter/Emoji</label>
            <span className="ex">pick an emoji or letter to describe your club</span>
            <input type="text" id="club-emoji" className="inp-3" />
          </div>
        </div>
        <div className="input-sec">
          <div className="form-input">
            <label htmlFor="description">Description</label>
            <span className="ex">EX: To make sports stand out......</span>
            <textarea id="club-description" className="inp-3"></textarea>
          </div>
        </div>
        <div className="input-sec">
          <div className="form-input">
            <label htmlFor="location">Room Number or Location</label>
            <span className="ex">EX: C4</span>
            <input type="text" id="club-location" className="inp-3" />
          </div>
        </div>
        <h1>Schedule</h1>
        <span>What days will you meet? </span>
        <div className="selecter">
          {days.map((day, index) => (
            <span
              key={day}
              className={`day ${selectedDay === day ? "selected" : ""}`}
              onClick={() => setSelectedDay(day)}
            >
              {dayLabels[index]}
            </span>
          ))}
        </div>
        <div className="selecter">
          {frequencies.map((freq) => (
            <span
              key={freq}
              className={`freq ${selectedFrequency === freq ? "selected" : ""}`}
              onClick={() => setSelectedFrequency(freq)}
            >
              {freq}
            </span>
          ))}
        </div>
        <div className="option">
          <span>Start time</span>
          <input type="time" className="inp-3" />
        </div>
        <h2>Usability</h2>
        <div className="option fl-r fl-jsp-b">
          <div className="fl-c">
            <span>Read only</span>
            <span className="ex">
              Make your club read only, only the club creator can post.
            </span>
          </div>
          <input type="checkbox" />
        </div>
        <button className="btn-3" id="last-btn">Let's Go</button>
      </form>
    </div>
  );
}

function ClubsSchedule({ clubs, handleClubClick }) {
  const today = new Date();
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-US', options);
  const clubToday = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  const todaysClubs = clubs.filter(club => club.day && club.day.trim().toLowerCase() === clubToday);

  return (
    <>
      <div className="bubble right-now">
        <h1>{formattedDate}</h1>
        <div className="sub-club-sec">
        {todaysClubs.length > 0 ? (
          todaysClubs.map((club) => (
              <div className="sub-club" key={club.id}>
                <div className="top">
                  <div className="club-emj">{club.letter}</div>
                  <div className="club-info">
                    <span className="club-name">{club.name}</span>
                    <div className="tags">
                      <span>{club.frequency}</span>
                      <span>{club.room}</span>
                    </div>
                  </div>
                </div>
                <div className="button-sec">
                  <button className="btn" 
                  onClick={() => handleClubClick(club.id)}
                  >Go to club</button>
                </div>
              </div>
          ))
        ) : (
          <p>No clubs available for today :(</p>
        )}
      </div>
        </div>
    </>
  );
}


function Clubs ({ clubs, scopeName, handleClubClick }) {
  return (
    <>
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
                <span>{club.frequency}</span>
                <span>{club.room}</span>
                {/* <span>{club.day}</span> */}
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>No clubs available for this scope :(</p>
      )}
    </>
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
    <div className={isValid ? 'club-chats-section app-holder' : 'club-chats-section app-holder'}>
      <nav>
        <div className="club-emj">
          {clubData.letter}
        </div>
        <div className="scope-text">
          <span className="title">{clubData.name}</span>
        </div>
      </nav>
      <main>
      {clubChats.length > 0 ? (
        clubChats
          .sort((a, b) => a.createdAt?.toDate() - b.createdAt?.toDate())
          .map((chat) => (
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
                  <span>{chat.uid === auth.currentUser.uid ? 'You' : chat.displayName}</span>
                </div>
              </div>
            </div>
          ))
      ) : (
        <p>No chats available for this club :(</p>
      )}
      </main>
      <span ref={dummy}></span>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          className="inp-2"
          placeholder="Type a message..."
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
        />
        <button type="submit" className="send-btn" disabled={!formValue}>send IT</button>
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
