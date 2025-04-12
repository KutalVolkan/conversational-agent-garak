import React, { useEffect, useState } from "react";

/**
 * Loader component - Displays an animated "Thinking..." indicator
 * Uses a shimmer effect and animated dots to indicate loading state
 */
function Loader() {
  // State to track animated dots
  const [dots, setDots] = useState("");

  // Set up dot animation interval
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return "";
        return prev + ".";
      });
    }, 500);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // CSS for shimmer animation effect
  const shimmerStyles = `
   @keyframes shimmer {
     0% {
       background-position: -200px 0;
     }
     100% {
       background-position: 200px 0;
     }
   }
   
   .text-shimmer {
     background: linear-gradient(90deg, 
       rgba(156,163,175,0.3) 0%, 
       rgba(220,220,220,0.8) 50%, 
       rgba(156,163,175,0.3) 100%
     );
     background-size: 200px 100%;
     background-clip: text;
     -webkit-background-clip: text;
     color: transparent;
     animation: shimmer 4s infinite linear;
   }
 `;

  return (
    <>
      <style>{shimmerStyles}</style>
      <div className="flex items-center justify-center">
        <div className="font-medium tracking-wide text-shimmer">
          Thinking<span className="inline-block w-8 text-left">{dots}</span>
        </div>
      </div>
    </>
  );
}

export default Loader;
