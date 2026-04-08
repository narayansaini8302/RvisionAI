import React from 'react';

const Loading = ({ fullScreen = false, size = 'md' }) => {
  // Size variants
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
    xl: 'text-8xl'
  };

  const textSize = sizeClasses[size] || sizeClasses.md;

  // If fullScreen is true, use fixed positioning
  if (fullScreen) {
    return (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(211, 218, 217, 0.3)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
      >
        <LoadingContent textSize={textSize} />
      </div>
    );
  }

  // Inline loading (relative positioning)
  return (
    <div 
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        backgroundColor: 'rgba(211, 218, 217, 0.3)',
        backdropFilter: 'blur(4px)',
        borderRadius: '1rem',
      }}
    >
      <LoadingContent textSize={textSize} />
    </div>
  );
};

// Separate content component to avoid code duplication
const LoadingContent = ({ textSize }) => {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Animated RvisionAI Text */}
      <div className="relative">
        <h1 
          className={`
            ${textSize} 
            font-bold 
            tracking-wider
            bg-gradient-to-r 
            from-accent 
            via-accent-light 
            to-accent-dark
            bg-clip-text 
            text-transparent
          `}
          style={{
            backgroundSize: '200% auto',
            animation: 'gradient 3s ease infinite',
            textShadow: '0 2px 10px rgba(113, 90, 90, 0.2)'
          }}
        >
          RvisionAI
        </h1>
        
        {/* Animated underline */}
        <div 
          style={{
            position: 'absolute',
            bottom: '-8px',
            left: 0,
            right: 0,
            height: '2px',
          }}
        >
          <div 
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #715A5A, #8b6e6e, #715A5A)',
              width: '0%',
              animation: 'slide 1.5s ease-in-out infinite'
            }}
          />
        </div>
      </div>

      {/* Animated dots */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#715A5A',
              animation: `bounce 0.8s ease-in-out infinite ${i * 0.15}s`
            }}
          />
        ))}
      </div>

      {/* Loading message */}
      <p 
        style={{
          color: '#44444E',
          fontSize: '14px',
          marginTop: '8px',
          animation: 'pulse 1.5s ease-in-out infinite'
        }}
      >
        Loading...
      </p>

      <style>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        @keyframes slide {
          0% {
            width: 0%;
            opacity: 0;
          }
          50% {
            width: 100%;
            opacity: 1;
          }
          100% {
            width: 0%;
            opacity: 0;
          }
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Loading;