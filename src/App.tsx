import React, { useRef, useEffect } from 'react';
import './App.css';
import { Raycaster } from './Raycaster';

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const raycaster = new Raycaster(canvasRef.current);
      raycaster.init();

      // Clean up when the component is unmounted
      return () => {
        raycaster.dispose();
      };
    }
  }, []);

  return (
    <div className="App">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default App;