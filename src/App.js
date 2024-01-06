import * as React from 'react';
import ThreePointVis from './ThreePointVis/ThreePointVis';
import './styles.css';
import { dates } from './dates'; // Importing the data
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { Suspense } from 'react';


export default function App() {
  const [layout, setLayout] = React.useState('spiral');
  const [selectedPoint, setSelectedPoint] = React.useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = React.useState(null);
  const [articleTitles, setArticleTitles] = React.useState([]);

  const visRef = React.useRef();

  

  const handleResetCamera = () => {
    visRef.current.resetCamera();
  };

  const [activeButton, setActiveButton] = React.useState(null);

  const onTimeButtonClick = (timeSlot) => {
    handleTimeSlotSelection(timeSlot); // Your existing logic to fetch article titles
    setActiveButton(timeSlot); // Set the active state for the button
  };

  // Function to fetch article titles and update state
  const fetchArticleTitles = async (url) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/get-article-titles/?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      if (data.titles.length === 0) {
        // Set a default message if no titles are returned
        setArticleTitles(["This YEWS is still being created. Go make it."]);
      } else {
        setArticleTitles(data.titles);
      }
    } catch (error) {
      console.error('Error fetching article titles:', error);
      setArticleTitles(["This YEWS is still being created. Go make it."]); // Set a default message in case of error
    }
  };
  

  // Function to handle time slot selection
  const handleTimeSlotSelection = async (timeSlot) => {
    const url = selectedPoint[timeSlot];
    await fetchArticleTitles(url);
  };

  // Modified onSelectPoint function to reset article titles
  const onSelectPoint = (point) => {
    setSelectedPoint(point);
    setArticleTitles([]); // Clear article titles
  };



  const selectedPointStyle = {
    position: 'fixed', // or `relative` depending on your layout needs
    top: '5%', // Adjust as necessary to position the element
    left: '50%', // Center horizontally
    transform: 'translateX(-50%)', // Adjust for exact centering
    zIndex: 2, // Ensure it's above other elements
    width: '100%', // Make sure it spans the width of the screen or container
    textAlign: 'center', // Center the text if desired
    fontSize: '0.85em',
    marginTop: '16px',
    color: '#fff' // Make the text color white for visibility
  };

  return (
    <div className="App">
      <Suspense fallback={<div>Loading...</div>}>
      <div className="vis-container">
        <ThreePointVis
          ref={visRef}
          data={dates}
          layout={layout}
          selectedPoint={selectedPoint}
          onSelectPoint={onSelectPoint} // Use the modified onSelectPoint function
        />
      </div>
      

      {selectedPoint && (
        <div className="selected-point" style={selectedPointStyle}>
          <h1>YEWS</h1> <strong>{selectedPoint.date}</strong>
          <div>
            <button className={`open-button ${activeButton === 'tenAM' ? 'button-active' : ''}`} onClick={() => onTimeButtonClick('tenAM')}>10AM</button>
            <button className={`open-button ${activeButton === 'threePM' ? 'button-active' : ''}`} onClick={() => onTimeButtonClick('threePM')}>3PM</button>
            <button className={`open-button ${activeButton === 'eightPM' ? 'button-active' : ''}`} onClick={() => onTimeButtonClick('eightPM')}>8PM</button>
          </div>
          <ul className="article-list">
            {articleTitles.map(title => (
            <li key={title}>{title}</li>
             ))}
          </ul>
      </div>
      )}

      <button className="reset-button" onClick={handleResetCamera}>
        Reset
      </button>
      </Suspense>
    </div>
  );
}
