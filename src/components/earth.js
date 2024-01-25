import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Earth = () => {
  const [population, setPopulation] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const options = {
        method: 'GET',
        url: 'https://get-population.p.rapidapi.com/population',
        headers: {
          'X-RapidAPI-Key': 'e534d11067msh1a198bf158daefbp120dc2jsn6a6e6b2c9fcc', // Use your actual API key
          'X-RapidAPI-Host': 'get-population.p.rapidapi.com'
        }
      };

      try {
        const response = await axios.request(options);
        console.log(response.data);
        // Update the state with the correct path to the population data
        setPopulation(response.data.readable_format); // Now using 'readable_format' for a formatted string
      } catch (error) {
        console.error(error);
        setError('Failed to fetch data');
      }
    };

    fetchData();
  }, []); // Empty dependency array means this effect runs once on mount

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {population !== null ? (
        <p>{population}</p>
      ) : (
        <p></p>
      )}
    </div>
  );
};

export default Earth;
