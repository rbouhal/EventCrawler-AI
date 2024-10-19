import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './FindEvents.css';
import { AiOutlineSearch } from "react-icons/ai";
import { AiOutlineClose } from "react-icons/ai";

function FindEvents() {
  const [events, setEvents] = useState([]);
  const [location, setLocation] = useState('');
  const [page, setPage] = useState(0); // Initialize page to 0 for pagination
  const [noMoreResults, setNoMoreResults] = useState(false); // To show message for no more results
  const [filters, setFilters] = useState({
    keyword: '',
    startDateTime: '',
    endDateTime: '',
    radius: '',
    unit: 'miles',
  });

  const searchLocation = useLocation(); // Use to detect URL changes

  // Fetch events whenever location or filters change
  useEffect(() => {
    const params = new URLSearchParams(searchLocation.search);
    const query = params.get('location');
    if (query && query !== location) {
      setLocation(query);
      fetchEvents(query, filters, 0); // Fetch first page with filters (page 0)
    } else if (!query) {
      setLocation('');
      setEvents([]);
    }
  }, [searchLocation, location, filters]); // Dependency includes filters

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const fetchEvents = async (query, filters, pageNumber) => {
    try {
      const apiKey = process.env.REACT_APP_TICKETM_KEY;
      let url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&city=${query}&size=10&page=${pageNumber}`;

      if (filters.keyword) url += `&keyword=${filters.keyword}`;

      // Convert the startDateTime to the required format (YYYY-MM-DDTHH:mm:ssZ)
      if (filters.startDateTime) {
        const startDate = new Date(filters.startDateTime);
        const formattedStartDate = `${startDate.getUTCFullYear()}-${String(startDate.getUTCMonth() + 1).padStart(2, '0')}-${String(startDate.getUTCDate()).padStart(2, '0')}T00:00:00Z`;
        url += `&startDateTime=${formattedStartDate}`;
      }

      // Convert the endDateTime to the required format (YYYY-MM-DDTHH:mm:ssZ)
      if (filters.endDateTime) {
        const endDate = new Date(filters.endDateTime);
        const formattedEndDate = `${endDate.getUTCFullYear()}-${String(endDate.getUTCMonth() + 1).padStart(2, '0')}-${String(endDate.getUTCDate()).padStart(2, '0')}T23:59:59Z`;
        url += `&endDateTime=${formattedEndDate}`;
      }

      if (filters.radius) url += `&radius=${filters.radius}&unit=${filters.unit}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data._embedded && data._embedded.events) {
        const eventsData = data._embedded.events.map((event) => {
          const venue = event._embedded.venues[0];
          
          // Fallbacks for missing data
          const addressLine = venue.address ? venue.address.line1 : "Address not available";
          const stateCode = venue.state ? venue.state.stateCode : ""; // Handle missing state
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
      
        setEvents((prevEvents) => (pageNumber === 0 ? eventsData : [...prevEvents, ...eventsData]));
        setNoMoreResults(false); // Reset the no results message
      } else {
        setNoMoreResults(true);
        setTimeout(() => setNoMoreResults(false), 3000); // Message disappears after 3 seconds
      }      
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };


  // Handle search button click: reset results and fetch filtered data
  const handleSearch = () => {
    setPage(0); // Reset page number to 0
    setEvents([]); // Clear current events
    fetchEvents(location, filters, 0); // Fetch the first page of results with filters
  };

  const handleClearSearch = () => {
    setFilters({
      keyword: '',
      startDateTime: '',
      endDateTime: '',
      radius: '',
      unit: 'miles',
    });
    setEvents([]); // Clear current events
    setPage(0); // Reset the page number
  };


  // Load more results when "Load More" button is clicked
  const loadMoreResults = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchEvents(location, filters, nextPage); // Fetch the next page
  };

  return (

    <div className="find-events-page">

      {location ? (
        <>
          <div className='title'>
            <h1 className='location'>Events in {location}</h1>
            <button onClick={handleClearSearch} className='clear'><AiOutlineClose /> Clear Search</button>
          </div>
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
                placeholder="Start Date"
                value={filters.startDateTime}
                onChange={handleInputChange}
              />
            </label>
            <label>
              End
              <input
                type="date"
                name="endDateTime"
                placeholder="End Date"
                value={filters.endDateTime}
                onChange={handleInputChange}
              />
            </label>
            <label className='radius'>
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

            <button onClick={handleSearch}><AiOutlineSearch /> Search</button>


          </div>

          {events.length > 0 ? (
            <>
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
                      <p>
                        <strong>Date:</strong> {event.date} <strong>Time:</strong> {event.time}
                      </p>
                      <p>
                        <strong>Address:</strong> {event.address}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              {!noMoreResults && <button onClick={loadMoreResults}>Load More Results</button>}
            </>
          ) : (
            <p>No events found in {location}.</p>
          )}

          {noMoreResults && <p>No more results available.</p>}
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
