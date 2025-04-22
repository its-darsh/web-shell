import { useEffect, useState } from "react";
import { roundAndPad, Separator } from "./Common";
import { LucideCpu, LucideMemoryStick } from "lucide-react";

export function SystemStats() {
  const [stats, setStats] = useState({ ram: 0.0, cpu: 0.0 });

  function fetchStats() {
    window.fabric.bridge.fetchSystemStats().then((v) => setStats(v));
  }

  useEffect(() => {
    const id = setInterval(fetchStats, 1000);
    fetchStats();
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <LucideMemoryStick className="stroke-primary stroke-2" size={22} />
      <span className="font-mono">{roundAndPad(stats.ram)}</span>
      <Separator />
      <LucideCpu className="stroke-primary stroke-2" size={22} />
      <span className="font-mono">{roundAndPad(stats.cpu)}</span>
    </>
  );
}
