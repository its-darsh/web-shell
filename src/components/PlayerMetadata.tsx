import { useState, useEffect } from "react";

export const PlayerMetadata = () => {
  const [playerTitle, setPlayerTitle] = useState("Homanland");
  const [playerArtist, setPlayerArtist] = useState("Homan");

  const fetchMetadata = () => {
    window.fabric.bridge.playerGetTitle().then((v) => setPlayerTitle(v));
    window.fabric.bridge.playerGetArtist().then((v) => setPlayerArtist(v));
    return;
  };

  useEffect(() => {
    window.addEventListener("playerMetadataChanged", fetchMetadata);
    fetchMetadata();
  }, []);

  return (
    <div className="player-metadata flex flex-col justify-center items-start">
      <div className="player-title text-[16px] -my-1  text-ellipsis max-w-32 text-nowrap overflow-hidden">
        {playerTitle}
      </div>
      <div className="player-artist text-[12px] -my-0.5 text-secondary  text-ellipsis max-w-32 text-nowrap overflow-hidden">
        {playerArtist}
      </div>
    </div>
  );
};
