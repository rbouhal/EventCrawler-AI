import React from 'react';
import { useLocation } from 'react-router-dom';

function MarkInsights() {
  const searchLocation = useLocation();
  const params = new URLSearchParams(searchLocation.search);
  const city = params.get('location'); // Extract the searched city

  return (
    <div>
      <h1>Marketing Insights</h1>
      {city && <p>Searched City: {city}</p>} {/* Display the searched city */}
    </div>
  );
}

export default MarkInsights;
