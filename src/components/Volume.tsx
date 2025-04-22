import { LucideVolume2 } from "lucide-react";
import { useEffect, useState } from "react";

export function Volume() {
  const [audioVolume, setAudioVolume] = useState(0.0);

  useEffect(() => {
    window.addEventListener("audioVolumeChanged", (e: { volume: number }) => {
      setAudioVolume(Math.round(e.volume));
    });
    window.fabric.bridge
      .audioGetVolume()
      .then((v) => setAudioVolume(Math.round(v)));
  }, []);

  return (
    <div
      className="flex flex-row gap-1.5"
      onWheel={(e) => {
        if (e.deltaY > 0) {
          window.fabric.bridge.audioSetVolume(audioVolume - 5);
        } else if (e.deltaY < 0) {
          window.fabric.bridge.audioSetVolume(audioVolume + 5);
        }
      }}
    >
      <LucideVolume2 className="stroke-primary stroke-2" size={22} />
      <span className="font-mono">{audioVolume}</span>
    </div>
  );
}
