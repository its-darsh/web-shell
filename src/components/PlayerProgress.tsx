import { useEffect, useState } from "react";

export const PlayerProgress = () => {
  const [playerProgress, setPlayerProgress] = useState(1.0);
  const [playerLength, setPlayerLength] = useState(1.0);

  function fetchProgress() {
    window.fabric.bridge
      .playerGetMetadata()
      .then((v) => setPlayerLength(v["mpris:length"]));
    window.fabric.bridge.playerGetPosition().then((v) => setPlayerProgress(v));
  }

  useEffect(() => {
    fetchProgress();
    const id = setInterval(fetchProgress, 1000);
    return () => clearInterval(id);
  }, []);

  const fillColor = "var(--color-secondary)";
  const bgColor = "transparent";

  const gradientStyle = {
    background: `linear-gradient(to right, ${fillColor} ${
      (playerProgress / playerLength) * 100
    }%, ${bgColor} ${(playerProgress / playerLength) * 100}%)`,
  };

  return (
    <div
      className="absolute top-0 left-0 right-0 bottom-0 z-0 opacity-30"
      style={gradientStyle}
    ></div>
  );
};
