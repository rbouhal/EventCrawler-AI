import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './FindEvents.css';
import { AiOutlineSearch, AiOutlineClose, AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";
import { useContext } from 'react';
import { AuthContext } from '../../AuthContext';
import { db } from '../../firebaseConfig';
import { collection, addDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { RiRobot3Fill } from "react-icons/ri";

function FindEvents() {
  // Use localStorage to retrieve persisted state
  const [events, setEvents] = useState(JSON.parse(localStorage.getItem('events')) || []);
  const [location, setLocation] = useState(localStorage.getItem('location') || '');
  const [page, setPage] = useState(0);
  const [noMoreResults, setNoMoreResults] = useState(false);
  const [filters, setFilters] = useState({
    keyword: localStorage.getItem('keyword') || '',
    startDateTime: localStorage.getItem('startDateTime') || '',
    radius: localStorage.getItem('radius') || '',
    unit: 'miles',
  });
  const [selectedEvents, setSelectedEvents] = useState(JSON.parse(localStorage.getItem('selectedEvents')) || []);
  const navigate = useNavigate();
  const searchLocation = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(searchLocation.search);
    const query = params.get('location');
    if (query && query !== location) {
      setLocation(query);
      localStorage.setItem('location', query); // Persist location
      fetchEvents(query, filters, 0);
    }
  }, [searchLocation, location, filters]);

  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events)); // Persist events
    localStorage.setItem('selectedEvents', JSON.stringify(selectedEvents)); // Persist selected events
  }, [events, selectedEvents]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
    localStorage.setItem(name, value); // Persist filters
  };

  const fetchEvents = async (query, filters, pageNumber) => {
    try {
      const apiKey = process.env.REACT_APP_TICKETM_KEY;
      let url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&city=${query}&size=10&page=${pageNumber}`;

      if (filters.keyword) url += `&keyword=${filters.keyword}`;
      if (filters.startDateTime) url += `&startDateTime=${new Date(filters.startDateTime).toISOString()}`;
      if (filters.radius) url += `&radius=${filters.radius}&unit=${filters.unit}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data._embedded && data._embedded.events) {
        const eventsData = data._embedded.events.map(event => {
          const venue = event._embedded.venues[0];
          const addressLine = venue.address ? venue.address.line1 : "Address not available";
          const stateCode = venue.state ? venue.state.stateCode : "";
          const postalCode = venue.postalCode || "Postal code not available";

          return {
            name: event.name,
            date: event.dates.start.localDate,
            time: event.dates.start.localTime || 'TBD',
            address: `${addressLine}, ${venue.city.name}, ${stateCode} ${postalCode}`,
            url: event.url,
            image: event.images[0].url,
          };
        });

        setEvents(prevEvents => (pageNumber === 0 ? eventsData : [...prevEvents, ...eventsData]));
        setNoMoreResults(false);
      } else {
        setNoMoreResults(true);
        setTimeout(() => setNoMoreResults(false), 3000);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const { currentUser } = useContext(AuthContext);

  const handleAddEvent = async (event) => {
    if (!currentUser) return;

    const eventExists = selectedEvents.find((e) => e.name === event.name);

    if (eventExists) {
      await removeEventFromStorage(event);
      setSelectedEvents(selectedEvents.filter((e) => e.name !== event.name));
    } else {
      await addEventToStorage(event);
      setSelectedEvents([...selectedEvents, event]);
    }
  };

  const addEventToStorage = async (event) => {
    try {
      const userEventsRef = collection(db, 'users', currentUser.uid, 'events');
      await addDoc(userEventsRef, event);
    } catch (error) {
      console.error("Error adding event to Firestore: ", error);
    }
  };

  const removeEventFromStorage = async (event) => {
    try {
      const userEventsRef = collection(db, 'users', currentUser.uid, 'events');
      const q = query(userEventsRef, where('name', '==', event.name));
      const snapshot = await getDocs(q);
      snapshot.forEach(async (docSnapshot) => {
        await deleteDoc(docSnapshot.ref);
      });
    } catch (error) {
      console.error("Error removing event from Firestore: ", error);
    }
  };

  const handleSearch = () => {
    setPage(0);
    setEvents([]);
    fetchEvents(location, filters, 0);
  };

  const handleClearSearch = () => {
    setFilters({
      keyword: '',
      startDateTime: '',
      endDateTime: '',
      radius: '',
      unit: 'miles',
    });
    setEvents([]);
    setPage(0);
    localStorage.removeItem('location');
    localStorage.removeItem('events');
    localStorage.removeItem('selectedEvents');
  };

  const loadMoreResults = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchEvents(location, filters, nextPage);
  };

  const goToAIRecc = () => {
    navigate('/ai-recc', { state: { selectedEvents } });
  };

  return (
    <div className="find-events-page">
      {location ? (
        <>
     
            <h1 className="location">Events in {location}</h1>
    
 

          {/* Search Filters */}
          <div className="search-filters">
            <input
              type="text"
              name="keyword"
              placeholder="Keyword"
              value={filters.keyword}
              onChange={handleInputChange}
            />
            <label>
              Start
              <input
                type="date"
                name="startDateTime"
                value={filters.startDateTime}
                onChange={handleInputChange}
              />
            </label>
            <label>
              End
              <input
                type="date"
                name="endDateTime"
                value={filters.endDateTime}
                onChange={handleInputChange}
              />
            </label>
            <label className="radius">
              Distance
              <input
                type="text"
                name="radius"
                placeholder="Radius"
                value={filters.radius}
                onChange={handleInputChange}
              />
              <select name="unit" value={filters.unit} onChange={handleInputChange}>
                <option value="miles">Miles</option>
                <option value="km">Kilometers</option>
              </select>
            </label>

            <button onClick={handleSearch} className='search-button'><AiOutlineSearch /> Search</button>
          </div>

          {events.length > 0 ? (
            <div className='col'>
                    <button onClick={handleClearSearch} className="clear"><AiOutlineClose /> Clear Search</button>
              <ul className="events-list">
                {events.map((event, index) => (
                  <li key={index} className="event-item">
                    <img src={event.image} alt={event.name} className="event-image" />
                    <div className="event-details">
                      <h2>
                        <a href={event.url} target="_blank" rel="noopener noreferrer">
                          {event.name}
                        </a>
                      </h2>
                      <p><strong>Date:</strong> {event.date} <strong>Time:</strong> {event.time}</p>
                      <p><strong>Address:</strong> {event.address}</p>
                    </div>
                    <div className="tooltip-wrapper">
                      <button
                        className={`add-event-button ${selectedEvents.find(e => e.name === event.name) ? 'selected' : ''}`}
                        onClick={() => handleAddEvent(event)}
                      >
                        {selectedEvents.find(e => e.name === event.name) ? <AiOutlineMinus /> : <AiOutlinePlus />}
                      </button>
                      <span className="tooltip-text">
                        {selectedEvents.find(e => e.name === event.name) ? 'Remove event from AI Recommender' : 'Add event to AI Recommender'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              {!noMoreResults && <button className="more-results-button" onClick={loadMoreResults}>Load More Results</button>}
            </div>
          ) : (
            <p>No events found in {location}.</p>
          )}

          {noMoreResults && <p>No more results available.</p>}

          {/* Button to go to AI recommendations page */}
          {selectedEvents.length > 0 && (
  <button onClick={goToAIRecc} className="fab-button">
    <div className="fab-content">
      <RiRobot3Fill className="robot-icon" size={24} />
      <span>Get AI Insights</span> 
    </div>
  </button>
)}

        </>
      ) : (
        <>
          <h1>Find Events Near You</h1>
          <p>Use the search bar to discover events in your desired location.</p>
        </>
      )}
    </div>
  );
}

export default FindEvents;
