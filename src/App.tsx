import "@fontsource/jetbrains-mono";
import { useEffect } from "react";
import PlayerStatusButton from "./components/PlayerStatusButton";
import {
  PlayerNextButton,
  PlayerPreviousButton,
} from "./components/PlayerControlButtons";
import { PlayerProgress } from "./components/PlayerProgress";
import { Language, Workspaces } from "./components/Hyprland";
import {
  LucideKeyboard,
  LucideWifi,
  LucideLayoutTemplate,
  LucideBird,
} from "lucide-react";
import { PlayerCover } from "./components/PlayerCover";
import { PlayerMetadata } from "./components/PlayerMetadata";
import { Notifications } from "./components/Notifications";
import { bulkReplace, Separator } from "./components/Common";
import { InputMaskObserver } from "./components/InputMaskObserver";
import { DateTime } from "./components/DateTime";
import { Volume } from "./components/Volume";
import { SystemStats } from "./components/SystemStats";

export default function App() {
  // effect for handling pywal colors
  useEffect(() => {
    function fetchColorscheme() {
      window.fabric.bridge
        .getColorscheme()
        .then((scheme: PywalColorScheme["colors"]) =>
          Object.entries(scheme).forEach(([name, value]) => {
            document.documentElement.style.setProperty("--" + name, value);
          })
        );
      return;
    }

    window.addEventListener("colorschemeChanged", fetchColorscheme);
    fetchColorscheme();

    return () =>
      window.removeEventListener("colorschemeChanged", fetchColorscheme);
  }, []);

  return (
    <>
      <InputMaskObserver>
        <div className="relative flex flex-row flex-nowrap items-start content-start justify-between h-[40px] max-h-[40px] first:grow-1 first:basis-0 last:grow-1 last:basis-0 m-2">
          <div className="flex flex-row content-start items-start justify-start h-full gap-2">
            <div className="observe flex flex-row items-center content-center bg-background h-full px-2 border-[1px] rounded-[2px] border-primary/40">
              <LucideBird
                className="stroke-primary stroke-2 cursor-pointer hover:fill-foreground transition-[fill] focus:animate-ping "
                size={24}
              />
              <Separator />
              <Workspaces />
              <Separator />
              <LucideLayoutTemplate
                className="stroke-primary hover:fill-foreground cursor-pointer stroke-2"
                size={24}
              />
            </div>

            <div
              className="observe relative flex flex-row items-center content-center bg-background h-full px-1 border-[1px] rounded-[2px] border-primary/40 gap-2 transition-all cursor-pointer"
              onClick={(e) => {
                e.currentTarget.classList.toggle("expanded-view");
              }}
            >
              <PlayerProgress />
              <div className="player-info flex flex-row items-center content-center gap-1 z-1">
                <PlayerCover />
                <PlayerMetadata />
              </div>
              <div className="flex flex-row items-center content-center gap-0.5 z-1">
                <PlayerPreviousButton />
                <PlayerStatusButton />
                <PlayerNextButton />
              </div>
            </div>
          </div>

          <div className="observe absolute left-1/2 transform -translate-x-1/2 h-full">
            <DateTime />
          </div>

          <div className="observe relative flex flex-row items-center content-center bg-background h-full px-2 border-[1px] rounded-[2px] border-primary/40 gap-2 transition-all">
            <Volume />
            <Separator />

            {/* PLACEHOLDER */}
            <LucideWifi className="stroke-primary stroke-2" size={22} />
            <span className="font-mono">99</span>

            <Separator />
            <SystemStats />
            <Separator />

            <Language
              keyboard=".*usb-keyboard"
              formatter={(lang) =>
                bulkReplace(lang, { "Ara.*": "AR", "Eng.*": "EN" })
              }
            />
          </div>
        </div>
        <Notifications />
      </InputMaskObserver>
    </>
  );
}
