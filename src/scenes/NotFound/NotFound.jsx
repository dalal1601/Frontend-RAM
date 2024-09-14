// Import React and styled-components
import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

// Keyframe animations for stars and clouds
const starsOpacity = keyframes`
  0% { opacity: 1; }
  100% { opacity: 0; }
`;

const move = keyframes`
  from { right: -100px; }
  to { right: 180px; }
`;

// Define styled-components
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 95vh;

  .airplane-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

const AirplaneContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const WindowContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 25px;
  margin-left: 30px;
  width: 148px;
  height: 148px;
  border-radius: 63.79px;

  .window-back {
    position: absolute;
    width: 116px;
    height: 116px;
    border-radius: 59px;
  }

  .window {
    width: 116px;
    height: 116px;
    border-radius: 50px;
  }

  .stars-window {
    position: absolute;
    top: 22px;

    div {
      position: absolute;
      width: 3px;
      height: 2px;
      border-radius: 100px;
      background: #fff;

      &:nth-child(1) {
        top: 43px;
        right: 50px;
      }
      &:nth-child(2) {
        top: 5px;
        left: 30px;
      }
      &:nth-child(3) {
        top: 85px;
        left: 35px;
      }
    }
  }

  .clouds {
    position: absolute;
    top: 22px;
    right: 180px;
    animation: ${move} 2s linear infinite;

    div {
      position: absolute;
      width: 20px;
      height: 20px;
      background: #ffffff;
      border-radius: 100px;

      &:nth-child(1) {
        top: 23px;
        left: 5px;
      }
      &:nth-child(2) {
        top: 32px;
        left: 16px;
      }
      &:nth-child(3) {
        top: 32px;
        left: 1px;
      }
    }
  }
`;

const NotFoundText = styled.div`
  color: #ffffff;
  font-size: 20px;
`;

const Stars = styled.div`
  position: relative;
  background: linear-gradient(119.64deg, #fffebe 0%, #ffffff 100%);
  overflow: hidden;

  div {
    position: absolute;
    border-radius: 100%;
    background: #fffebe;
    z-index: 4;
    margin: 30px;
    animation: ${starsOpacity} 0.1s infinite;
    opacity: 0.6;
  }
`;

// Define the main component
const NotFound = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const toggleDarkMode = () => setDarkMode(prevMode => !prevMode);
    const intervalId = setInterval(toggleDarkMode, 2000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Container style={{ background: darkMode ? 'linear-gradient(180deg, #141311 0%, #0b1144 100%)' : 'linear-gradient(180deg, #ff2632 0%, #cc000b 100%)' }}>
      <AirplaneContainer>
        <div>
          <span style={{ color: darkMode ? 'rgba(255,255,255,0.2)' : '#ffffff', fontSize: '170px' }}>4</span>
        </div>
        <WindowContainer>
          <div className="window-back" style={{ border: darkMode ? '8px solid rgba(18, 19, 32, 0.7)' : '8px solid #ffffff' }} />
          <div className="window" style={{ background: darkMode ? 'linear-gradient(180deg, #29d7cf 0%, #000000 100%)' : 'linear-gradient(180deg, #c9fffe 0%, #ffffff 100%)' }} />
          <div className="stars-window">
            <div></div>
            <div></div>
            <div></div>
          </div>
          <div className="clouds">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </WindowContainer>
        <div>
          <span style={{ color: darkMode ? 'rgba(255,255,255,0.2)' : '#ffffff', fontSize: '170px' }}>4</span>
        </div>
      </AirplaneContainer>
      <NotFoundText style={{ opacity: darkMode ? 0.2 : 1 }}>NOT FOUND</NotFoundText>
      <Stars>
        {[...Array(100)].map((_, i) => (
          <div key={i} style={{
            width: `${Math.random() * 4 + 1}px`,
            height: `${Math.random() * 4 + 1}px`,
            background: 'linear-gradient(119.64deg, #fffebe 0%, #ffffff 100%)',
            left: `${Math.random() * 4024 - 100}px`,
            top: `${Math.random() * 1000 - 100}px`,
            animationDelay: `${i * 0.1}s`,
            opacity: darkMode ? 1 : 0.6
          }}></div>
        ))}
      </Stars>
    </Container>
  );
};

export default NotFound;
