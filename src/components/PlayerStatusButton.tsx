import styled from "styled-components";
import { useState, useEffect } from "react";
import { LucidePause, LucidePlay } from "lucide-react";

const PlayerStatusButton = () => {
  const [isChecked, setIsChecked] = useState(true);
  useEffect(() => {
    const handlePlay = () => setIsChecked(true);
    const handlePause = () => setIsChecked(false);

    window.addEventListener("playerPlay", handlePlay);
    window.addEventListener("playerPause", handlePause);

    // inital state
    window.fabric.bridge
      .playerGetStatus()
      .then((v) => setIsChecked(v === 0 ? true : false));

    return () => {
      window.removeEventListener("playerPlay", handlePlay);
      window.removeEventListener("playerPause", handlePause);
    };
  }, []);

  return (
    <StyledWrapper>
      <label className="container bg-primary p-1 active:scale-95 transition-all rounded-[2px] flex justify-center items-center cursor-pointer select-none">
        <input
          type="checkbox"
          className="absolute cursor-pointer opacity-0 w-0 h-0"
          checked={isChecked}
          onChange={() => {
            return window.fabric.bridge.playerPlayPause();
          }}
        />
        <LucidePlay className="play" size={18} />
        <LucidePause className="pause" size={18} />
      </label>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .container .play {
    animation: keyframes-fill 0.3s;
  }

  .container .pause {
    display: none;
    animation: keyframes-fill 0.3s;
  }

  .container input:checked ~ .play {
    display: none;
  }

  .container input:checked ~ .pause {
    display: block;
  }

  @keyframes keyframes-fill {
    0% {
      transform: scale(0);
      opacity: 0;
    }

    50% {
      transform: scale(1.1);
    }
  }
`;

export default PlayerStatusButton;
