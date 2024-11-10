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
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, doc, where, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
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

const cUser = auth.currentUser;

const getNextMeeting = (club) => {
  const today = new Date();
  const day = today.getDay();
  const clubDay = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].indexOf(club.day.toLowerCase());
  const clubTime = club.startTime.split(':');
  const clubHour = parseInt(clubTime[0], 10);
  const clubMinute = parseInt(clubTime[1], 10);
  const nextMeeting = new Date(today);

  if (club.frequency === "weekly") {
    nextMeeting.setDate(today.getDate() + (clubDay - day + 7) % 7);
  } else if (club.frequency === "bi-weekly") {
    const weeksToAdd = (clubDay - day + 14) % 14;
    nextMeeting.setDate(today.getDate() + weeksToAdd);
  } else if (club.frequency === "monthly") {
    nextMeeting.setMonth(today.getMonth() + 1);
    nextMeeting.setDate(clubDay);
  }

  nextMeeting.setHours(clubHour);
  nextMeeting.setMinutes(clubMinute);
  nextMeeting.setSeconds(0);
  nextMeeting.setMilliseconds(0);

  const options = { month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
  return nextMeeting.toLocaleString('en-US', options).replace(',', ' at');
};

const fetchUserCollection = async () => {
  if (cUser) {
    const userRef = collection(firestore, 'users');
    const q = query(userRef, where('uid', '==', cUser.uid));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      var userDoc = querySnapshot.docs[0];
      console.log('User document ID:', userDoc.id);
      return userDoc.id;
    } else {
      console.log('No matching user document found.');
      return null;
    }
  }
};


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
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userRef = doc(firestore, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setCurrentUser(userSnap.data());
        } else {
          console.log('No such document!');
        }
      }
    };

    fetchUserData();
  }, [user]);

  const [userScopes, setUserScopes] = useState(null);

  useEffect(() => {
    const fetchUserScopes = async () => {
      if (user) {
        const userScopesRef = collection(firestore, 'users', user.uid, 'userScopes');
        const userScopesSnapshot = await getDocs(userScopesRef);
        const scopesList = userScopesSnapshot.docs.map(doc => doc.data());
        setUserScopes(scopesList);
      }
    };

    fetchUserScopes();
  }, [user]);

  return (
    <div className={user ? 'app-home app-holder' : 'app-holder app-signUp'}>
      {!user || (currentUser && !currentUser.hasEnteredCode && !userScopes.length > 0 ) ? (
        <ScopeCode user={user} />
      ) : (
        <HomeContent user={user} currentUser={currentUser}/>
      )}
    </div>
  );
}

function HomeContent({ user, currentUser }) {
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 18) return 'Good afternoon';
    return 'Good evening';
  };
  return (
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
        <Explore />
      </section>
      <div className="phm-scopes">
      <div className="scope red">
        <SignOut />
      </div>
      </div>
    </>
  );
}

function Explore() {
  const [showScopeCode, setShowScopeCode] = useState(false);

  const handleFindScopeClick = () => {
    setShowScopeCode(true);
  };

  return (
    <div className="find">
      <div className="bubble" onClick={handleFindScopeClick}>
        <span>Find A Scope</span>
      </div>
      <div className="bubble">
        <span>Explore</span>
      </div>
      {showScopeCode && <ScopeCode user={auth.currentUser} setShowScopeCode={setShowScopeCode} />}
    </div>
  );
}

function ScopeCode({ user, setShowScopeCode }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [scope, setScope] = useState(null);

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    const scopeRef = doc(firestore, 'scopes', code);
    const scopeSnap = await getDoc(scopeRef);

    if (scopeSnap.exists()) {
      setScope(scopeSnap.id);

      const userRef = doc(firestore, 'users', user.uid);

      // Update the user's Firestore document to set hasEnteredCode to true
      await updateDoc(userRef, {
        hasEnteredCode: true
      });

      // Add the scope to the user's userScopes collection
      const userScopesRef = collection(firestore, 'users', user.uid, 'userScopes');
      await addDoc(userScopesRef, {
        scopeId: scopeSnap.id,
        addedAt: new Date() // Optionally store the date and time when the scope was added
      });

      const scopeMembersRef = collection(firestore, 'scopes', scopeSnap.id, 'members');
      await addDoc(scopeMembersRef, {
        uid: user.uid,
        role: 'member',
        joinedAt: serverTimestamp()
      });

      if (setShowScopeCode) {
        setShowScopeCode(false);
      }

      


    } else {
      setError('Invalid scope code');
    }
  };

  return (
    <div className="app-holder app-signUp">
      <h1>Enter your scope/School code</h1>
      <form onSubmit={handleCodeSubmit}>
        {error && <p className="error">{error}</p>}
        <input
          type="text"
          placeholder="Scope Code"
          value={code}
          onChange={(e) => setCode(e.target.value.toLowerCase())}
          required
        />
        <button type="submit" className="btn-3">Enter</button>
        <span onClick={() => { return( <HomeContent /> ) }}>Maybe later</span>
      </form>
    </div>
  );
}




function Scopes() {
  const [scopes, setScopes] = useState([]);
  const [selectedScopeId, setSelectedScopeId] = useState(null);
  const [selectedClubId, setSelectedClubId] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [clubChats, setClubChats] = useState([]);
  const [showCreateClub, setShowCreateClub] = useState(false);
  const [isOverflowHidden, setIsOverflowHidden] = useState(false);

  const userScopesRef = collection(firestore, 'users', auth.currentUser.uid, 'userScopes');
  const [userScopes] = useCollectionData(userScopesRef, { idField: 'id' });

  // Fetch all scopes from Firestore
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

  // Filter scopes based on userScopes
  const filteredUserScopes = scopes.filter(scope =>
    userScopes?.some(userScope => userScope.scopeId === scope.id)
  );

  // Handle scope click to fetch clubs for the selected scope
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

  // Handle club click to fetch chats for the selected club
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

  // Handle the click to create a club
  const handleCreateClubClick = () => {
    setShowCreateClub(true);
    setIsOverflowHidden(true); // Hide overflow when creating a club
  };

  // Close the create club form
  const handleCloseCreateClub = () => {
    setShowCreateClub(false);
    setIsOverflowHidden(false); // Restore overflow
  };

  const clubData = clubs.find(club => club.id === selectedClubId);
  const scopeName = scopes.find(scope => scope.id === selectedScopeId)?.name || 'Selected Scope';
  const scope = scopes.find(scope => scope.id === selectedScopeId);
  const UnofficialClubs = clubs.filter(club => club.official === false);

  // Fetch scope members for the selected scope
  const scopeMembersRef = selectedScopeId
    ? collection(firestore, 'scopes', selectedScopeId, 'members')
    : null;

  const { data: scopeMembers = [] } = useCollectionData(scopeMembersRef || undefined);

  // Check if the current user is a member of the selected scope
  const isScopeMember = scopeMembers.some(member => member.uid === auth.currentUser.uid);


  return (
    <div className='phm-scopes'>
      {/* Display filtered scopes that the user is a part of */}
      {filteredUserScopes.length > 0 ? (
        filteredUserScopes.map((scope) => (
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
        null
      )}

      {/* Display clubs for the selected scope */}
      {selectedScopeId && (
        <div className={`app-holder app-clubs ${isOverflowHidden ? 'overflow-hidden' : ''}`}>
          <nav>
            <div className="scope-img">
              <img src={scope.img} alt={scopeName} /> 
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
            <h2>Clubs</h2>
            <Clubs clubs={clubs} scopeName={scopeName} handleClubClick={handleClubClick} />
            {UnofficialClubs.length > 0 && (
              <>
                <h2>Unofficial</h2>
                <Clubs clubs={UnofficialClubs} scopeName={scopeName} handleClubClick={handleClubClick} />
              </>
            )}
            {showCreateClub && (
              <CreateClub scope={selectedScopeId} onClose={handleCloseCreateClub} isSelected={showCreateClub} />
            )}
          </div>
        </div>
      )}

      {/* Display chats for the selected club */}
      {clubData && selectedClubId && (
        <Chats clubData={clubData} isValid={true} clubChats={clubChats} selectedScopeId={selectedScopeId} />
      )}
    </div>
  );
}



function CreateClub({ scope, onClose, isSelected, isSettings, clubData }) {
  const [selectedDay, setSelectedDay] = useState("monday");
  const [selectedFrequency, setSelectedFrequency] = useState("weekly");
  const [clubName, setClubName] = useState('');
  const [clubEmoji, setClubEmoji] = useState('');
  const [clubDescription, setClubDescription] = useState('');
  const [clubLocation, setClubLocation] = useState('');
  const [startTime, setStartTime] = useState('');
  const [readOnly, setReadOnly] = useState(false);
  const [error, setError] = useState(null);

  // Populate form with clubData if in settings mode
  useEffect(() => {
    if (isSettings && clubData) {
      setClubName(clubData.name || '');
      setClubEmoji(clubData.letter || '');
      setClubDescription(clubData.description || '');
      setClubLocation(clubData.room || '');
      setStartTime(clubData.startTime || '');
      setSelectedDay(clubData.day || 'monday');
      setSelectedFrequency(clubData.frequency || 'weekly');
      setReadOnly(clubData.readOnly || false);
    }
  }, [isSettings, clubData]); // This will trigger whenever `isSettings` or `clubData` changes.

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newClub = {
      name: clubName,
      letter: clubEmoji,
      description: clubDescription,
      room: clubLocation,
      day: selectedDay,
      frequency: selectedFrequency,
      startTime: startTime,
      readOnly: readOnly,
      createdAt: serverTimestamp(),
      owner: auth.currentUser.uid,
      official: false,
      sections,
    };

    try {
      if (!isSettings) {
        await addDoc(collection(firestore, 'scopes', scope, 'clubs'), newClub);
      if (newClub.readOnly === 'askToJoin') {
        await addDoc(collection(firestore, 'scopes', scope, 'clubs', newClub.id, 'members'), {
          uid: auth.currentUser.uid,
          role: 'owner',
          joinedAt: serverTimestamp(),
        });
      }
      resetForm();
      onClose();
      } else {
        const clubRef = doc(firestore, 'scopes', scope, 'clubs', clubData.id);
        await updateDoc(clubRef, newClub);
        onClose();
      }
    } catch (err) {
      console.error('Error adding document: ', err);
      setError('Failed to create club. Please try again.');
    }
  };

  const resetForm = () => {
    setClubName('');
    setClubEmoji('');
    setClubDescription('');
    setClubLocation('');
    setStartTime('');
    setSelectedDay("monday");
    setSelectedFrequency("weekly");
    setReadOnly(false);
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']; // Example days
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']; // Corresponding labels
  const frequencies = ['weekly', 'bi-weekly', 'monthly']; // Example frequencies
  
  const [sections, setSections] = useState(['Announcements', 'Events']);
  const [newSection, setNewSection] = useState('');

  const addSection = () => {
    if (newSection.trim()) {
      setSections([...sections, newSection]); // Add new section to the list
      setNewSection(''); // Clear the input
    }
  };

  const removeSection = (sectionToRemove) => {
    setSections(sections.filter(section => section !== sectionToRemove));
  };

  return (
    <div className={isSelected ? 'create customscroll openUp' : 'openDown'}>
      <div className="close" onClick={onClose}>+</div>
      <h1>{isSettings ? 'Edit My Club' : 'Create My Club'}</h1>
      <form onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        <div className="input-sec">
          <div className="form-input" id="name-of-club">
            <label htmlFor="name">Club name</label>
            <span className="ex">EX: athlete recognition club</span>
            <input
              type="text"
              id="club-name"
              className="inp-3"
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              required
            />
          </div>
          <div className="form-input">
            <label htmlFor="emoji">Letter/Emoji</label>
            <span className="ex">Pick an emoji or letter to describe your club</span>
            <input
              type="text"
              id="club-emoji"
              className="inp-3"
              value={clubEmoji}
              onChange={(e) => setClubEmoji(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="input-sec">
          <div className="form-input">
            <label htmlFor="description">Description</label>
            <span className="ex">EX: To make sports stand out...</span>
            <textarea
              id="club-description"
              className="inp-3"
              value={clubDescription}
              onChange={(e) => setClubDescription(e.target.value)}
              required
            ></textarea>
          </div>
        </div>
        <div className="input-sec">
          <div className="form-input">
            <label htmlFor="location">Room Number or Location</label>
            <span className="ex">EX: C4</span>
            <input
              type="text"
              id="club-location"
              className="inp-3"
              value={clubLocation}
              onChange={(e) => setClubLocation(e.target.value)}
              required
            />
          </div>
        </div>
        <h1>Schedule</h1>
        <span>What days will you meet?</span>
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
          <input
            type="time"
            className="inp-3"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>
        <h2>Sections</h2>
        <div className='sections-div'>
        {sections.map((section) => (
          <div className="section" key={section}>
            <div className="fl-r fl-jsp-b w-100">
              <span>{section}</span>
              <span className='ex-n' onClick={() => removeSection(section)}>X</span> {/* Remove button */}
            </div> 
          </div>
        ))}
        <input
          type="text"
          className="inp-3 w-fc"
          value={newSection}
          onChange={(e) => setNewSection(e.target.value)}
          placeholder="Add a section"
        />
        <button type="button" className="btn-1 w-fc" onClick={addSection}>
          Add
        </button>
      </div>
        <h2>Usability</h2>
        <div className="option-s fl-r fl-jsp-b" onClick={() => setReadOnly('readOnly')}>
          <div className="fl-c">
            <span>Read only</span>
            <span className="ex">
              Make your club read only, only the club creator can post.
            </span>
          </div>
          {readOnly === 'readOnly' && <div className="selected-indicator">✔️</div>}
        </div>
        <div className="option-s fl-r fl-jsp-b" onClick={() => setReadOnly('askToJoin')}>
          <div className="fl-c">
            <span>Ask to join</span>
            <span className="ex">
              Users must ask to join the club.
            </span>
          </div>
          {readOnly === 'askToJoin' && <div className="selected-indicator">✔️</div>}
        </div>
        <div className="option-s fl-r fl-jsp-b" onClick={() => setReadOnly(false)}>
          <div className="fl-c">
            <span>Open</span>
            <span className="ex">
              Anyone can join and post.
            </span>
          </div>
          {readOnly === false && <div className="selected-indicator">✔️</div>}
        </div>
        <div className="option-s fl-r fl-jsp-b" onClick={() => setReadOnly('private')}>
          <div className="fl-c">
            <span>Private</span>
            <span className="ex">
              Users must be accepted by the club creator and won’t see messages until then.
            </span>
          </div>
          {readOnly === 'private' && <div className="selected-indicator">✔️</div>}
        </div>
        <button type="submit" className="btn-3" id="last-btn">Let's Go</button>
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
          <NotAvailable text={'No Clubs running today!'}/>
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
                <span>{club.day}</span>
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
  const [messageType, setMessageType] = useState('regular');
  const [messageSection, setMessageSection] = useState('');
  const [currentView, setCurrentView] = useState('');
  const [joinRequestsCount, setJoinRequestsCount] = useState(0); // State to store the number of join requests
  const isOwner = clubData.owner === auth.currentUser.uid;
  const owner = clubData.owner;

  
  const [isMember, setIsMember] = useState(false);
  const [isRequested, setIsRequested] = useState(false); 
  const handleMake = (view) => {
    setCurrentView(view);
  };

  // Effect to check membership status
  useEffect(() => {
    const checkMembershipStatus = async () => {
      try {
        const membersRef = collection(firestore, 'scopes', selectedScopeId, 'clubs', clubData.id, 'members');
        const q = query(membersRef, where("uid", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const member = querySnapshot.docs[0].data();
          if (member.role === 'member') {
            setIsMember(true);
          } else if (member.role === 'requested') {
            setIsRequested(true);
          }
        }
      } catch (error) {
        console.error("Error checking membership status:", error);
      }
      
    };

    const countJoinRequests = async () => {
      try {
        const membersRef = collection(firestore, 'scopes', selectedScopeId, 'clubs', clubData.id, 'members');
        const q = query(membersRef, where('role', '==', 'requested'));
        const querySnapshot = await getDocs(q);
        
        const requestedMembers = querySnapshot.docs.map(doc => doc.data());
        console.log('Requested members:', requestedMembers);
        
        setJoinRequestsCount(requestedMembers.length); // Set the count of join requests
      } catch (error) {
        console.error('Error fetching join requests:', error);
        setJoinRequestsCount(0); // In case of error, set it to 0
      }
    };
    

    checkMembershipStatus();
    countJoinRequests();
  }, [selectedScopeId, clubData.id, clubData.members]); // Add clubData.members to dependency list

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
        messageType,
        displayName: auth.currentUser.displayName,
        messageSection,
      });
      setFormValue('');
      dummy.current.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleJoinClub = async () => {
    try {
      const membersRef = collection(firestore, 'scopes', selectedScopeId, 'clubs', clubData.id, 'members');
      
      // Check if the user is already a member or has requested to join
      const q = query(membersRef, where("uid", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.log('User is already a member or has requested to join.');
        return;
      }

      // If the user is not found in the members list, add them as 'requested'
      await addDoc(membersRef, {
        uid: auth.currentUser.uid,
        role: 'requested',
        name: auth.currentUser.displayName,
        photoURL: auth.currentUser.photoURL,
        joinedAt: serverTimestamp(),
      });

      // Update the UI to reflect the request
      setIsRequested(true);
      console.log('Join request sent successfully');
    } catch (error) {
      console.error('Error joining club:', error);
    }
  };

  const [selectedSection, setSelectedSection] = useState(false);
  const filteredChats = selectedSection ? clubChats.filter(chat => chat.messageSection === selectedSection) : clubChats;

  const changesectionView = (section) => () => {
    setSelectedSection(section);
  };

  return (
    <div className={`club-chats-section app-holder ${isValid ? 'valid' : 'invalid'}`}>
      <nav>
        <div className="club-emj">
          {clubData.letter}
        </div>
        <div className="scope-text">
          <span className="title">{clubData.name}</span>
        </div>
      </nav>
      <div className="club-meet">
        Next meeting: {getNextMeeting(clubData).toLocaleString()} <span className='tag'>Add to Google calendar</span>
      </div>
      <div className='club-secs'>
         { clubData.sections && clubData.sections.length > 0 && (
           <div className="sections">
            <span className="section">@all</span>
             {clubData.sections.map((section) => (
               <span key={section} className='section' onClick={changesectionView(section)}>@{section}</span>
             ))}
           </div>
         )}
      </div>

      <main>
        <>
          {filteredChats.length > 0 ? (
            filteredChats
              .sort((a, b) => a.createdAt?.toDate() - b.createdAt?.toDate())
              .map((chat) => (  
                <div 
                className={`message ${chat.uid === auth.currentUser.uid ? 'sent' : 'received'} ${messageType} ${chat.uid === owner ? 'owner' : ''}`}
                 key={chat.id}
                 >
                  <span className="text">
                    {chat.message}
                  </span>
                  <div className="info">
                    <div className="person"></div>
                    <div className="person">
                      <img src={chat.photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt="User Avatar" className={chat.id === owner && 'img-owner'} />
                    </div>
                    <div className="creator">
                      <span>{new Date(chat.createdAt?.toDate()).toLocaleString()}</span>
                      <span>{chat.uid === auth.currentUser.uid ? 'You' : chat.displayName}</span>
                      {chat.uid === owner && (
                        <span className="role owner">Owner</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <div className='box'>
              <h2>{clubData.name}</h2>
              {isOwner ? (
                <p>You created a club! start by sending a messaging or sharing with others.</p>
                ) : (
                  <p>
                    There are no messages yet, but will be soon! 🚀 
                  </p>
                )}
            </div>
          )}
        </>
      </main>

      <span ref={dummy}></span>
      {currentView === 'settings' && <CreateClub scope={selectedScopeId} clubData={ clubData } onClose={() => setCurrentView('')} isSelected={true} isSettings={true} />}
      {currentView === 'post' && <Post />}
      {currentView === 'joinRequests' && <Joins clubData={clubData} joinRequests={joinRequestsCount}/>}
      <div className='chatbtns'>
        {isOwner ? (
          <>
            <span id='cb-edit' onClick={() => handleMake('settings')}>Settings ⚙️</span>
            <span id='cb-post' onClick={() => handleMake('post')}>Post ✨</span>
            {clubData.readOnly === 'askToJoin' && (
              <span id='cb-joins' onClick={() => handleMake('joinRequests')}>Join requests ({joinRequestsCount})</span>

            )}
          </>
        ) : (
          clubData.readOnly === 'askToJoin' && !isMember ? '' : <span id='cb-join'>Settings</span>
        )}
      </div>

      {!isOwner && clubData.readOnly === 'askToJoin' && (
      <div className="join-club">
        {isMember ? (
          <span>You are a member of this club</span>
        ) : isRequested ? (
          <button className='btn-3 btn-n'>Requested</button>
        ) : (
          <button onClick={handleJoinClub} className='btn-3'>Join Club</button>
        )}
      </div>
    )}
    {
      !isOwner && clubData.readOnly === 'askToJoin' && !isMember ? (
        null
      ) : (
        <form onSubmit={sendMessage} className='fl-r'>
          <input
            type="text"
            className="inp-2"
            placeholder={clubData.readOnly && !isOwner ? 'Read Only' : 'Type a message'}
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
            disabled={clubData.readOnly && !isOwner} // Disable input if readOnly and the user is not the owner
          />
          <button type="submit" className="send-btn" disabled={!formValue || (clubData.readOnly && !isOwner)}>
          🚀
          </button>
        </form>
      )
    }
    </div>
  );
}

function Post({ clubData, setAnnoucemnt }) {

  const clubSections = clubData.sections || [];
  

  return (
    <div class="post">
            <h3>Section</h3>
            <div class="sections">
                <div class="section">
                    <span>
                        @Joel
                    </span>
                </div>
                {clubSections && clubSections.map((section) => (
                  <div class="section">
                    <span>
                        @{section}
                    </span>
                </div>
                ))
                  
                }
                
            </div>
            <h3>Type</h3>
            <div class="sections">
                <div class="section">
                    <span>
                        Announcement
                    </span>
                </div>
                <div class="section">
                    <span>
                        Poll
                    </span>
                </div>
                <div class="section">
                    <span>
                        Timed poll
                    </span>
                </div>
                <div class="section">
                    <span>
                        Scheduled post
                    </span>
                </div>
            </div>
        </div>
  )
}

function Joins({ clubData, selectedScopeId }) {
  // Function to accept a join request
  const handleAccept = async (requestId) => {
    try {
      // Create a reference to the specific member's document
      const memberRef = doc(firestore, 'scopes', selectedScopeId, 'clubs', clubData.id, 'members', requestId);
      
      // Update the member's role to 'member'
      await updateDoc(memberRef, {
        role: 'member',
      });

      // Optionally, you can handle the UI update if necessary
      // Here you might want to remove the accepted request from the UI state
      // For example, you can trigger a refetch or update local state
      // If you're managing state here, use a state setter function to update it
    } catch (error) {
      console.error("Error accepting join request:", error);
    }
  };

  const [joinRequests, setJoinRequests] = useState([]);

  useEffect(() => {
    const fetchJoinRequests = async () => {
      try {
        const membersRef = collection(firestore, 'scopes', selectedScopeId, 'clubs', clubData.id, 'members');
        const q = query(membersRef, where('role', '==', 'requested'));
        const querySnapshot = await getDocs(q);
        
        const requestedMembers = querySnapshot.docs.map(doc => doc.data());

        setJoinRequests(requestedMembers);
      } catch (error) {
        console.error('Error fetching join requests:', error);
      }
    };

    fetchJoinRequests();
  }, [selectedScopeId, clubData.id]);

  console.log('Join Requests:', joinRequests);


  return (
    <div className="joins">
      {joinRequests.length > 0 ? (
        joinRequests.map(request => (
          <div className="requester" key={request.id}>
            <div className="person">
              <img src={request.photoURL || 'pfp-3.jpg'} alt="" />
            </div>
            <span className="name">
              {request.name}
            </span>
            <button className="btn-5-s" onClick={() => handleAccept(request.id)}>Accept</button>
          </div>
        ))
      ) : (
        // <NotAvailable text="No requests available." />
        <div className="joins">
    <div className="requester">
        <div className="person">
            <img src="pfp-3.jpg" alt="" />
        </div>
        <span className="name">Joel</span>
        <button className="btn-5-s">Accept</button>
    </div>
</div>
      )}
    </div>
  );
}




function SignOut() {
  return auth.currentUser && (
    <button className="sign-out scope red" onClick={() => signOut(auth)}>Sign Out</button>
  );
}

function NotAvailable({ text }) {
  return (
    <div className="not-available b">
      <span>{text}</span>
    </div>
  );
}


export default App;

