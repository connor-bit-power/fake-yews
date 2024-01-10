import * as React from 'react';
import ThreePointVis from './ThreePointVis/ThreePointVis';
import './styles.css';
import { dates } from './dates';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { Suspense } from 'react';
import { BoxIcon } from '@radix-ui/react-icons';
import HolyLoader from "holy-loader";

export default function App() {
  const [layout, setLayout] = React.useState('spiral');
  const [selectedPoint, setSelectedPoint] = React.useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = React.useState(null);
  const [articleTitles, setArticleTitles] = React.useState([]);
  const [showContentBox, setShowContentBox] = React.useState(false);
  const [articleDetails, setArticleDetails] = React.useState([]);
  const [showExtraContent, setShowExtraContent] = React.useState(false);

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

  return (
    <div className="App">
      <HolyLoader />
      <Suspense fallback={<div>Loading...</div>}>
        <div className="vis-container">
          <ThreePointVis
            ref={visRef}
            data={dates}
            layout={layout}
            selectedPoint={selectedPoint}
            onSelectPoint={onSelectPoint} />
        </div>
  
        <div>
          <h1>YEWS</h1>
        </div>
  
        {selectedPoint && (
          <div className="selected-point" style={selectedPointStyle}>
            <h1>YEWS</h1> <strong>{selectedPoint.date}</strong>
            <div>
              <button className={`open-button ${activeButton === 'tenAM' ? 'button-active' : ''}`} onClick={() => onTimeButtonClick('tenAM')}>10AM</button>
              <button className={`open-button ${activeButton === 'threePM' ? 'button-active' : ''}`} onClick={() => onTimeButtonClick('threePM')}>3PM</button>
              <button className={`open-button ${activeButton === 'eightPM' ? 'button-active' : ''}`} onClick={() => onTimeButtonClick('eightPM')}>8PM</button>
            </div>
            {!showExtraContent && articleTitles.length > 0 && (
              <>
                <ul className="article-list">
                  {articleTitles.map((title, index) => (
                    <li key={index}>
                      <button className="title-button" onClick={() => onDetailButtonClick(index)}>
                        {title}
                      </button>
                    </li>
                  ))}
                </ul>
                <div>
                  <button className="read-more-button" onClick={handleReadMoreClick}>
                    Read More
                  </button>
                  <button className="chat-button" onClick={handleChatClick}>
                    Chat
                  </button>
                </div>
              </>
            )}
            {showContentBox && articleDetails.length > 0 && (
              <div className="content-box">
                {typeof articleDetails[0] === 'string' ? (
                  <p>{articleDetails[0]}</p>
                ) : (
                  <>
                    <h3>{articleDetails[0]?.article_title || "Title not available"}</h3>
                    <p>{articleDetails[0]?.body_text || "Content not available"}</p>
                  </>
                )}
              </div>
            )}
          </div>
        )}
  
        <button className="reset-button" onClick={handleReset}>
          <BoxIcon />
        </button>
      </Suspense>
    </div>
  );
                }