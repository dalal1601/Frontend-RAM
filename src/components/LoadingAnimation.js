import React from 'react';

const LoadingAnimation = () => {
  const styles = {
    content: {
      alignItems: 'center',
      display: 'flex',
      height: '100vh',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    airplaneLoader: {
      margin: '24px',
    },
    ramText: {
      fontFamily: 'Arial, sans-serif',
      fontSize: '48px',
      fontWeight: 'bold',
      color: '#000000',
      margin: '0 48px',
    },
  };

  return (
    <div style={styles.content}>
      <svg version="1.1" id="airplane-loader" xmlns="http://www.w3.org/2000/svg" width="144" height="48" viewBox="0 0 144 48" style={styles.airplaneLoader}>
        <path id="airplane-take-off" fill="#C2002F" d="M59.124,34L56,29h-4l2.947,11H89c1.657,0,3-1.343,3-3s-1.343-3-3-3H78.998L69,18h-4l4.287,16H59.124z"/>
        <rect id="ground" x="52" y="44" fill="#795548" width="40" height="4"/>
      </svg>
      <div style={styles.ramText}>RAM</div>
      <svg version="1.1" id="airplane-loader" xmlns="http://www.w3.org/2000/svg" width="144" height="48" viewBox="0 0 144 48" style={styles.airplaneLoader}>
        <path id="airplane-landing" fill="#C2002F" d="M59.124,34L56,29h-4l2.947,11H89c1.657,0,3-1.343,3-3s-1.343-3-3-3H78.998L69,18h-4l4.287,16H59.124z"/>
        <rect id="ground" x="52" y="44" fill="#795548" width="40" height="4"/>
      </svg>
      <style jsx>{`
        #airplane-take-off {
          transform-origin: bottom center;
          animation-name: take-off;
          animation-duration: 2s;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
        }
        @keyframes take-off {
          0% {
            opacity: 0;
            transform: translate(-40px,0) rotate(0deg);
          }
          10% {
            opacity: 1;
          }
          25% {
            transform: translate(0,0) rotate(0deg);
          }
          30% {
            transform: translate(8px,-1px) rotate(-2deg);
          }
          35% {
            transform: translate(16px,-3px) rotate(-4deg);
          }
          40% {
            opacity: 1;
            transform: translate(24px,-5px) rotate(-7deg);
          }
          45% {
            transform: translate(32px,-8px) rotate(-10deg);
          }
          50% {
            opacity: 0;
            transform: translate(40px,-12px) rotate(-16deg);
          }
          100% {
            opacity: 0;
            transform: translate(40px,-12px) rotate(-16deg);
          }
        }
        #airplane-landing {
          transform-origin: bottom center;
          animation-name: landing;
          animation-duration: 2s;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
        }
        @keyframes landing {
          0% {
            opacity: 0;
            transform: translate(-40px,-12px) rotate(16deg);
          }
          50% {
            opacity: 0;
            transform: translate(-40px,-12px) rotate(16deg);
          }
          55% {
            transform: translate(-32px,-8px) rotate(10deg);
          }
          60% {
            opacity: 1;
            transform: translate(-24px,-5px) rotate(7deg);
          }
          65% {
            transform: translate(-16px,-3px) rotate(4deg);
          }
          70% {
            transform: translate(-8px,-1px) rotate(2deg);
          }
          75% {
            transform: translate(0,0) rotate(0deg);
          }
          90% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(40px,0) rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingAnimation;