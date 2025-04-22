import { LucideSkipBack, LucideSkipForward } from "lucide-react";

const PlayerNextButton = () => {
  return (
    <div
      className="p-1 active:scale-95 transition-all rounded-[2px] cursor-pointer"
      onClick={() => window.fabric.bridge.playerNext()}
    >
      <LucideSkipForward size={18} />
    </div>
  );
};

const PlayerPreviousButton = () => {
  return (
    <div
      className="p-1 active:scale-95 transition-all rounded-[2px] cursor-pointer"
      onClick={() => window.fabric.bridge.playerPrevious()}
    >
      <LucideSkipBack size={18} />
    </div>
  );
};

export { PlayerNextButton, PlayerPreviousButton };
