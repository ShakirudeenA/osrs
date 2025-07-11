import React, { useRef, useEffect, useState, useCallback } from 'react';

// Wilderness map image URL
const WILDERNESS_MAP_URL = 'https://oldschool.runescape.wiki/images/thumb/The_Wilderness.png/800px-The_Wilderness.png?48133';

// Define some speculative "hotspot" regions on the map (pixel coordinates relative to 800x800 map)
// These are rough estimates for demonstration purposes.
const HOTSPOTS = [
  // Edgeville Wilderness (low level PvP, common entry)
  { x: 150, y: 700, radius: 80, density: 0.4, name: "Edgeville Wilderness (Lvl 1-5)" },
  // Chaos Altar / Temple (prayer training, pkers)
  { x: 650, y: 150, radius: 70, density: 0.3, name: "Chaos Altar / Temple" },
  // Revenant Caves (high risk, high reward)
  { x: 400, y: 400, radius: 90, density: 0.5, name: "Revenant Caves Entrance" },
  // Wilderness Slayer Cave / Lava Dragons (PvM + PvP)
  { x: 600, y: 550, radius: 60, density: 0.25, name: "Wilderness Slayer/Lava Dragons" },
  // Deep Wilderness (multi-combat, bosses)
  { x: 400, y: 100, radius: 100, density: 0.35, name: "Deep Wilderness Bosses" },
];

// Function to generate speculative death data
const generateDeathData = (numDeaths = 2000) => {
  const deaths = [];
  const mapWidth = 800; // Assumed width of the base map image
  const mapHeight = 800; // Assumed height of the base map image

  for (let i = 0; i < numDeaths; i++) {
    let x, y;
    // Randomly pick a hotspot to generate a death around, or a general random spot
    const hotspotChance = Math.random();
    let chosenHotspot = null;

    // Distribute deaths with higher density around hotspots
    if (hotspotChance < 0.8) { // 80% chance to be near a hotspot
      const hotspotIndex = Math.floor(Math.random() * HOTSPOTS.length);
      chosenHotspot = HOTSPOTS[hotspotIndex];
      // Generate coordinates within the hotspot's radius
      const angle = Math.random() * 2 * Math.PI;
      const r = chosenHotspot.radius * Math.sqrt(Math.random()); // For more even distribution within circle
      x = chosenHotspot.x + r * Math.cos(angle);
      y = chosenHotspot.y + r * Math.sin(angle);
    } else { // 20% chance for a general random death anywhere
      x = Math.random() * mapWidth;
      y = Math.random() * mapHeight;
    }

    // Ensure coordinates are within map bounds
    x = Math.max(0, Math.min(mapWidth, x));
    y = Math.max(0, Math.min(mapHeight, y));

    deaths.push({ x, y });
  }
  return deaths;
};

const App = () => {
  const canvasRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [deaths, setDeaths] = useState([]);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });

  // Generate death data once on component mount
  useEffect(() => {
    setDeaths(generateDeathData(5000)); // Generate more deaths for a denser map
  }, []);

  // Function to draw the map and death points on the canvas
  const drawMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = WILDERNESS_MAP_URL;
    img.onload = () => {
      setMapLoaded(true);
      // Set canvas dimensions based on the image's aspect ratio and container width
      const aspectRatio = img.width / img.height;
      const containerWidth = canvas.parentElement.offsetWidth;
      const newWidth = containerWidth;
      const newHeight = containerWidth / aspectRatio;

      canvas.width = newWidth;
      canvas.height = newHeight;
      setCanvasDimensions({ width: newWidth, height: newHeight });

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Scale factor to translate mock 800x800 coordinates to current canvas dimensions
      const scaleX = newWidth / 800;
      const scaleY = newHeight / 800;

      // Draw death points
      deaths.forEach(death => {
        ctx.beginPath();
        // Scale the death coordinates
        ctx.arc(death.x * scaleX, death.y * scaleY, 2, 0, Math.PI * 2); // Small circles for each death
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; // Red with transparency
        ctx.fill();
      });

      // Optionally, draw hotspot circles for visual reference (can be removed in final version)
      HOTSPOTS.forEach(hotspot => {
        ctx.beginPath();
        ctx.arc(hotspot.x * scaleX, hotspot.y * scaleY, hotspot.radius * scaleX, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)'; // Cyan outline for hotspots
        ctx.lineWidth = 1;
        ctx.stroke();
      });

    };
    img.onerror = () => {
      console.error("Failed to load Wilderness map image.");
      // Display a message on the canvas if image fails to load
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.fillText('Failed to load map image. Please check URL.', 10, 50);
    };
  }, [deaths]); // Redraw if deaths data changes

  // Redraw on window resize to maintain responsiveness
  useEffect(() => {
    const handleResize = () => {
      // Trigger redraw by re-setting mapLoaded state, which will re-run drawMap
      if (mapLoaded) {
        drawMap();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mapLoaded, drawMap]);

  // Initial draw when component mounts
  useEffect(() => {
    drawMap();
  }, [drawMap]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 font-inter p-4 sm:p-6 md:p-8 rounded-lg shadow-lg">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
          }
          canvas {
            display: block;
            max-width: 100%;
            height: auto; /* Maintain aspect ratio */
            border-radius: 0.75rem; /* rounded-xl */
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* shadow-lg */
            border: 1px solid #4a5568; /* border-gray-700 */
          }
        `}
      </style>

      {/* Header Section */}
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-yellow-400 mb-2 drop-shadow-md">
          OSRS Wilderness Death Hotspot Analysis
        </h1>
        <p className="text-lg text-gray-300">
          A Speculative Look at Where Adventurers Meet Their Demise
        </p>
      </header>

      {/* Introduction */}
      <section className="bg-gray-800 p-6 rounded-xl shadow-inner mb-8 border border-gray-700">
        <h2 className="text-2xl font-semibold text-blue-300 mb-4">Project Overview</h2>
        <p className="text-gray-300 leading-relaxed">
          This app visualizes simulated player death locations in the OSRS Wilderness, identifying "hotspots" where players frequently fall. It showcases spatial data analysis, speculative dataset interpretation, and compelling data visualization.
        </p>
      </section>

      {/* Map Visualization Section */}
      <section className="bg-gray-800 p-6 rounded-xl shadow-inner mb-8 flex justify-center items-center">
        <div className="relative w-full max-w-4xl"> {/* Max width for the map container */}
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-700 bg-opacity-75 rounded-xl text-gray-300 text-xl">
              Loading Wilderness map...
            </div>
          )}
          <canvas ref={canvasRef} className="w-full h-auto"></canvas>
        </div>
      </section>

      {/* Speculative Analysis Section */}
      <section className="bg-gray-800 p-6 rounded-xl shadow-inner mb-8 border border-gray-700">
        <h2 className="text-2xl font-semibold text-blue-300 mb-4">Speculative Insights: Why Deaths Occur Here</h2>
        <div className="text-gray-300 leading-relaxed space-y-4">
          <p>
            Analyzing the simulated death data reveals distinct patterns and reasons for player demise:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-2">
            <li>
              <strong>Edgeville Wilderness (Lvl 1-5):</strong> High death density due to accessibility, low-level PvP, and unprepared new adventurers.
            </li>
            <li>
              <strong>Chaos Altar / Temple:</strong> Concentrated deaths from prayer training vulnerability, attracting high-level PKers.
            </li>
            <li>
              <strong>Revenant Caves Entrance:</strong> Hotspot for high-value targets and intense multi-combat PvP, often leading to ambushes.
            </li>
            <li>
              <strong>Wilderness Slayer Cave / Lava Dragons:</strong> Deaths from powerful monsters combined with unexpected player attacks during PvM.
            </li>
            <li>
              <strong>Deep Wilderness Bosses:</strong> Significant death concentrations in multi-combat zones, attracting solo adventurers and large PK teams due to high-value boss drops.
            </li>
          </ul>
          <p>
            These patterns highlight how in-game mechanics create dangerous zones, crucial for player strategy.
          </p>
        </div>
      </section>

      {/* Conclusion */}
      <footer className="text-center mt-8 text-gray-400">
        <p>&copy; 2025 Data Analysis Showcase. All rights reserved.</p>
        <p className="text-sm mt-2">
          This application uses simulated data and is for demonstration purposes only.
        </p>
      </footer>
    </div>
  );
};

export default App;