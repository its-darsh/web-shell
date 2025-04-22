import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useState, useRef, useEffect } from "react";
import { LucideX } from "lucide-react";
import { insertBetween } from "./Common";

const NotificationItem: React.FC<{
  notification: NotificationData;
  onRemove: (id: number) => void;
}> = ({ notification, onRemove }) => {
  const notificationRef = useRef<HTMLLIElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!notificationRef.current) {
      return;
    }
    gsap.set(progressRef.current, {
      scaleX: 0,
      transformOrigin: "left center",
    });

    const anim = gsap.to(progressRef.current, {
      duration: 8,
      scaleX: 1,
      ease: "sine.inOut",
      onComplete: () => onRemove(notification.id),
    });

    notificationRef.current.onmouseover = () => anim.pause();
    notificationRef.current.onmouseout = () => anim.play();
  });

  return (
    <li
      className="notification relative border border-primary/40 bg-background rounded-[2px]"
      ref={notificationRef}
    >
      <div className="flex flex-col gap-3">
        <div>
          <div
            onClick={() => onRemove(notification.id)}
            className="absolute p-1 bg-3 border border-primary/40 rounded-full -top-1 -right-1 cursor-pointer"
          >
            <LucideX className="stroke-background" size={16} />
          </div>
          <div className="flex items-center p-4">
            {notification["image-pixmap"] && (
              <img
                width={70}
                height={70}
                className="object-cover rounded-[2px]"
                src={
                  notification["image-pixmap"] !== null
                    ? `data:image/png;base64,${notification["image-pixmap"][6]}`
                    : notification["image-file"] || ""
                }
                alt="notification"
              />
            )}
            <div className="ml-3 overflow-hidden">
              <p className="font-medium">{notification.summary}</p>
              <p className="max-w-xs text-sm truncate">{notification.body}</p>
            </div>
          </div>
          {notification.actions && (
            <div className="notification-actions flex flex-row justify-between items-stretch">
              {insertBetween(
                notification.actions.map((action) => (
                  <div
                    key={action[0]}
                    className="notification-action border-t border-primary/40 bg-background cursor-pointer w-full flex items-center justify-center text-center hover:bg-primary hover:text-background transition-colors"
                    onClick={() =>
                      window.fabric.bridge.notificationsInvokeAction(
                        notification.id,
                        action[0],
                      )
                    }
                  >
                    {action[1]}
                  </div>
                )),
                <div className="w-0.5 bg-primary/40" />,
              )}
            </div>
          )}
          <div
            ref={progressRef}
            className="notification-progress bg-primary h-0.5 w-full"
          />
        </div>
      </div>
    </li>
  );
};

export const Notifications = () => {
  const [notificationsList, setNotificationsList] = useState<
    NotificationData[]
  >([]);
  const notificationsRef = useRef<HTMLUListElement>(null);
  const observerRef = useRef<IntersectionObserver>(null);

  const removeNotification = (id: number) => {
    setNotificationsList((prev) => prev.filter((n) => n.id !== id));
    window.fabric.bridge.notificationsClose(id);
  };

  useEffect(() => {
    const handleNotificationAdded = (e: any) => {
      setNotificationsList((prev) => [...prev, e.notification]);
    };
    window.addEventListener("notificationAdded", handleNotificationAdded);
    return () => {
      window.removeEventListener("notificationAdded", handleNotificationAdded);
    };
  }, []);

  useEffect(() => {
    const listEl = notificationsRef.current;
    if (!listEl) return;

    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        listEl.classList.toggle("overflow", entry.intersectionRatio < 1);
      },
      {
        root: listEl,
        threshold: 1.0,
      },
    );

    const lastChild = listEl.lastElementChild;
    if (lastChild) {
      observerRef.current.observe(lastChild);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [notificationsList]);

  return (
    <div className="flex flex-row-reverse overflow-hidden -my-4">
      <ul
        className="observe notifications flex flex-col gap-3 overflow-y-auto max-h-[64vh] max-w-86 w-86 -mx-2 not-empty:p-4"
        ref={notificationsRef}
      >
        {notificationsList.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
          />
        ))}
      </ul>
    </div>
  );
};
