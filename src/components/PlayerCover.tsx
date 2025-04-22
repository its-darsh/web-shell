import { useState, useEffect } from "react";

export const PlayerCover = () => {
  const [playerCoverUrl, setPlayerCoverUrl] = useState("");

  function fetchMetadata() {
    return window.fabric.bridge
      .playerGetMetadata()
      .then((v) => setPlayerCoverUrl(v["mpris:artUrl"]));
  }

  useEffect(() => {
    window.addEventListener("playerMetadataChanged", fetchMetadata);
    fetchMetadata();
  }, []);

  return (
    <img
      className="player-cover w-8 bg-no-repeat bg-cover"
      src={playerCoverUrl}
    ></img>
  );
};
