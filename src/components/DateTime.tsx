import { useEffect, useState } from "react";
import { LucideMoon, LucideSun } from "lucide-react";

export function DateTime() {
  const [hours, setHours] = useState("12");
  const [minutes, setMinutes] = useState("00");
  const [amPm, setAmPm] = useState("AM");

  function fetchTime() {
    return window.fabric.bridge
      .formatTimeString("%I %M %p")
      .then((v: string) => {
        const [h, m, ap] = v.split(" ");
        setHours(h);
        setMinutes(m);
        setAmPm(ap);
      });
  }

  useEffect(() => {
    const id = setInterval(fetchTime, 1000);
    fetchTime();

    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-row items-center bg-background h-full px-3 border-[1px] rounded-[2px] border-primary/40">
      {hours}
      <span className="m-1.5">
        {amPm === "PM" ? (
          <LucideMoon className="stroke-2 stroke-primary" size={20} />
        ) : (
          <LucideSun className="stroke-2 stroke-primary" size={20} />
        )}
      </span>
      {minutes}
    </div>
  );
}
