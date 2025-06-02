import { LucideKeyboard } from "lucide-react";
import { useState, useEffect } from "react";

export function Workspaces() {
  const [activeWorkspace, setActiveWorkspace] = useState(0);
  const [workspaces, setWorkspaces] = useState<number[]>([]);

  function fetchWorkspaces() {
    window.fabric.bridge
      .hyprlandSendCommand("j/workspaces")
      .then((v: { id: number }[]) => {
        setWorkspaces(v.map((ws) => ws.id).sort((a, b) => a - b));
      });

    window.fabric.bridge
      .hyprlandSendCommand("j/activeworkspace")
      .then((v: { id: number }) => setActiveWorkspace(v.id));
    return;
  }

  useEffect(() => {
    fetchWorkspaces();
    window.addEventListener(
      "hyprlandActiveWorkspace",
      (e: { workspaceId: number }) => {
        setActiveWorkspace(e.workspaceId);
      },
    );
    window.addEventListener(
      "hyprlandCreateWorkspace",
      (e: { workspaceId: number }) => {
        setWorkspaces((prev) =>
          [...new Set([...prev, e.workspaceId])].sort((a, b) => a - b),
        );
      },
    );
    window.addEventListener(
      "hyprlandDestroyWorkspace",
      (e: { workspaceId: number }) => {
        setWorkspaces((prev) => prev.filter((id) => id !== e.workspaceId));
      },
    );
  }, []);

  return (
    <div
      onWheel={(e) => {
        if (e.deltaY > 0) {
          return window.fabric.bridge.hyprlandSendCommand(
            "/dispatch workspace e-1",
          );
        }
        return window.fabric.bridge.hyprlandSendCommand(
          "/dispatch workspace e+1",
        );
      }}
      className="workspaces flex flex-row"
    >
      {workspaces.map((workspaceId) => (
        <div
          key={workspaceId}
          className={`workspace-item text-center rounded-[2px] border-solid border border-primary transition-all m-[0.1rem] w-7 cursor-pointer ${
            workspaceId === activeWorkspace ? "bg-primary text-background" : ""
          }`}
          onClick={() =>
            window.fabric.bridge.hyprlandSendCommand(
              `/dispatch workspace ${workspaceId}`,
            )
          }
        >
          {workspaceId}
        </div>
      ))}
    </div>
  );
}

export const Language: React.FC<{
  keyboard: string;
  formatter: (language: string) => string;
}> = ({ keyboard = ".*", formatter = (lang) => lang }) => {
  const [language, setLanguage] = useState<React.ReactNode>(formatter(""));

  useEffect(() => {
    const re = new RegExp(keyboard);

    function onActiveLayout(e: { keyboard: string; language: string }) {
      if (
        !(
          typeof e.keyboard === "string" &&
          typeof e.language === "string" &&
          re.test(e.keyboard)
        )
      )
        return;
      setLanguage(formatter(e.language));
    }

    window.fabric.bridge
      .hyprlandSendCommand("j/devices")
      .then(
        (v: {
          keyboards: Array<{ name?: string; active_keymap?: string }>;
        }) => {
          for (const kb of v.keyboards ?? []) {
            if (!(kb.name && kb.active_keymap && re.test(kb.name))) continue;

            setLanguage(formatter(kb.active_keymap));
            break;
          }
        },
      )
      .catch(() => {
        // shhh
      });

    window.addEventListener("hyprlandActiveLayout", onActiveLayout);

    return () => {
      window.removeEventListener("hyprlandActiveLayoutChanged", onActiveLayout);
    };
  }, []);

  return (
    <>
      <LucideKeyboard className="stroke-primary stroke-2" size={22} />
      <span className="font-mono">{language}</span>
    </>
  );
};
