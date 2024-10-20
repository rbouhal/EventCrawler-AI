import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../AuthContext'; 
import { db } from '../../firebaseConfig';  // Firestore database
import { collection, getDocs } from 'firebase/firestore';  // Firebase Firestore functions

function AIRecc() {
  const [events, setEvents] = useState([]);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser) {
      const fetchEvents = async () => {
        try {
          const eventsRef = collection(db, 'users', currentUser.uid, 'events');
          const snapshot = await getDocs(eventsRef);
          const eventsData = snapshot.docs.map(doc => doc.data());
          setEvents(eventsData);
        } catch (error) {
          console.error("Error fetching events:", error);
        }
      };

      fetchEvents();
    }
  }, [currentUser]);

  return (
    <div>
      <h1>AI Recommendations</h1>
      {events.length > 0 ? (
        <ul>
          {events.map((event, index) => (
            <li key={index}>
              <h2>{event.name}</h2>
              <p>{event.date}</p>
              <p>{event.address}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No events added yet.</p>
      )}
    </div>
  );
}

export default AIRecc;
