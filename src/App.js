
import ThreePointVis from './ThreePointVis/ThreePointVis';
import './styles.css';
import { dates } from './dates';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { Suspense } from 'react';
import { BoxIcon } from '@radix-ui/react-icons';
import HolyLoader from "holy-loader";
import getBitcoinPriceUSD from './components/bitcoin';
import React, { useState, useEffect } from 'react';

export default function App() {
  const [layout, setLayout] = React.useState('spiral');
  const [selectedPoint, setSelectedPoint] = React.useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = React.useState(null);
  const [articleTitles, setArticleTitles] = React.useState([]);
  const [showContentBox, setShowContentBox] = React.useState(false);
  const [articleDetails, setArticleDetails] = React.useState([]);
  const [showExtraContent, setShowExtraContent] = React.useState(false);
  const [bitcoinPrice, setBitcoinPrice] = useState('Loading...');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  const formatDate = (date) => {
    const month = date.getMonth() + 1; // getMonth() returns month from 0-11
    const day = date.getDate();
    return `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };

  const visRef = React.useRef();

  const handleReset = () => {
    setSelectedPoint(null);
    setActiveButton(null);
    setArticleTitles([]);
    setShowContentBox(false);
    setShowExtraContent(false); // Add this line to hide the extra content box
  };
  

  const toggleContentBox = () => {
    setShowContentBox(!showContentBox);
  };

  const handleReadMoreClick = () => {
    console.log("Read More clicked!");
    setShowExtraContent(true);
  };

  const handleChatClick = () => {
    console.log("Chat clicked!");
    setShowExtraContent(true);
  };


  const handleResetCamera = () => {
    visRef.current.resetCamera();
  };

  const [activeButton, setActiveButton] = React.useState(null);

  const onTimeButtonClick = (timeSlot) => {
    handleTimeSlotSelection(timeSlot);
    setActiveButton(timeSlot);
  };

  const onDetailButtonClick = async (index) => {
    await fetchArticleDetails(index);
    setShowContentBox(true); // Ensure the content box is visible
    setShowExtraContent(false);
  };

  const fetchArticleTitles = async (url) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/get-article-titles/?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      setArticleTitles(data.titles.length > 0 ? data.titles : ["This YEWS is still being written. Go make it."]);
    } catch (error) {
      console.error('Error fetching article titles:', error);
      setArticleTitles(["This YEWS is still being created. Go make it."]);
    }
  };


  const fetchArticleDetails = async (index) => {
    // Now this function takes an index to fetch the specific article details
    if (selectedPoint) {
      const url = selectedPoint[selectedTimeSlot];
      try {
        const response = await fetch(`http://127.0.0.1:8000/get-yews-data/?url=${encodeURIComponent(url)}`);
        const data = await response.json();
        if (data.articles.length > index) { // Check if the article exists
          setArticleDetails([data.articles[index]]); // Set the selected article's details
          setShowContentBox(true); // Show content box
        } else {
          setArticleDetails(["No articles available."]);
          setShowContentBox(false); // Hide content box if no articles
        }
      } catch (error) {
        console.error('Error fetching article details:', error);
        setArticleDetails(["Error fetching articles. Please try again later."]);
        setShowContentBox(false); // Hide content box on error
      }
    }
  };

  const handleTimeSlotSelection = async (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
    if (selectedPoint) {
      const url = selectedPoint[timeSlot];
      await fetchArticleTitles(url);
    }
  };

  const onSelectPoint = (point) => {
    setSelectedPoint(point);
    setArticleTitles([]);
  };

  const selectedPointStyle = {
    position: 'fixed',
    top: '5%',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 2,
    width: '100%',
    textAlign: 'center',
    fontSize: '0.85em',
    marginTop: '16px',
    color: '#fff'
  };

  useEffect(() => {
    const fetchPrice = async () => {
        const price = await getBitcoinPriceUSD();
        // Round the price to the nearest dollar
        const roundedPrice = Math.round(price);
        setBitcoinPrice(roundedPrice);
    };

    fetchPrice();
}, []);

  async function displayBitcoinPrice() {
    const priceUSD = await getBitcoinPriceUSD();
    if (priceUSD) {
        console.log(`Current Bitcoin Price: $${priceUSD}`);
    } else {
        console.log('Failed to fetch Bitcoin price.');
    }
}
displayBitcoinPrice();

  return (
    <div>
      <HolyLoader />
      <Suspense fallback={<div>Loading...</div>}>
        <div className="vis-and-text-container">
          <div className="text-overlay left-text">
            <h1>YEWS</h1>
            {selectedPoint && (
              <>
                <strong>{selectedPoint.date}</strong>
                <div>
                  <button className={`open-button ${activeButton === 'tenAM' ? 'button-active' : ''}`} onClick={() => onTimeButtonClick('tenAM')}>10AM</button>
                  <button className={`open-button ${activeButton === 'threePM' ? 'button-active' : ''}`} onClick={() => onTimeButtonClick('threePM')}>3PM</button>
                  <button className={`open-button ${activeButton === 'eightPM' ? 'button-active' : ''}`} onClick={() => onTimeButtonClick('eightPM')}>8PM</button>
                </div>
                {!showExtraContent && articleTitles.length > 0 && (
                  <ul className="article-list">
                    {articleTitles.map((title, index) => (
                      <li key={index}>
                        <button className="title-button" onClick={() => onDetailButtonClick(index)}>
                          {title}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>

          <div className="text-overlay right-text">
          <p>{formatDate(currentTime)}</p>
          <p>{formatTime(currentTime)}</p>
          <strong>Bitcoin</strong>
          <p>${bitcoinPrice}</p>

          </div>
          <ThreePointVis
            ref={visRef}
            data={dates}
            layout={layout}
            selectedPoint={selectedPoint}
            onSelectPoint={onSelectPoint} 
            currentDate={formatDate(currentTime)}
          />
        </div>
        <button className="reset-button" onClick={handleReset}>
          <BoxIcon />
        </button>
      </Suspense>
    </div>
  );
}