import { useState, useEffect } from "react";

/**
 * This function returns the online status of the user and whether they were previously offline, and
 * provides a method to reset the offline status.
 * @returns An object containing three properties: `isOnline`, `wasOffline`, and `resetOnlineStatus`.
 */
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  const resetOnlineStatus = () => {
    setWasOffline(false);
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  return { isOnline, wasOffline, resetOnlineStatus };
};
