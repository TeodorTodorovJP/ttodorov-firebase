import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { getDateDataInUTC } from "./utils";

let logoutTimer: ReturnType<typeof setTimeout> = setTimeout(() => "", 1000);

type AuthContent = {
  token: string | null | undefined;
  isLoggedIn: boolean;
  login: (token: string, expirationTime: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContent>({
  token: "",
  isLoggedIn: false,
  login: (token) => {},
  logout: () => {},
});

const calculateRemainingTime = (expirationDate: string | number | Date) => {
  // Don't use getTime, it get's the current timezone's milliseconds
  // If both dates come from different timezones, comparison would be inaccurate
  const { utcMilliseconds: currentMs } = getDateDataInUTC();
  const { utcMilliseconds: expTimeUTCms } = getDateDataInUTC(expirationDate);

  const remainingDuration = expTimeUTCms - currentMs;

  return remainingDuration;
};

const retrieveStoredToken = () => {
  const storedToken = localStorage.getItem("token");
  const storedExpirationDate = localStorage.getItem("expirationTime") || 0;

  const remainingTime = calculateRemainingTime(storedExpirationDate);

  if (remainingTime <= 3600) {
    localStorage.removeItem("token");
    localStorage.removeItem("expirationTime");
    return null;
  }

  return {
    token: storedToken,
    duration: remainingTime,
  };
};

export const AuthContextProvider = (props: { children: ReactNode }) => {
  const tokenData = retrieveStoredToken();

  let initialToken;
  if (tokenData) {
    initialToken = tokenData.token;
  }
  //console.log("tokenData: ", tokenData);
  const [token, setToken] = useState(initialToken);

  const logoutHandler = useCallback(() => {
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("expirationTime");

    if (logoutTimer) {
      clearTimeout(logoutTimer);
    }
  }, []);

  const loginHandler = (token: string, expirationTime: string) => {
    setToken(token);
    localStorage.setItem("token", token);
    localStorage.setItem("expirationTime", expirationTime);
    const remainingTime = calculateRemainingTime(expirationTime);
    logoutTimer = setTimeout(logoutHandler, remainingTime);
  };

  useEffect(() => {
    if (tokenData) {
      // console.log("Token Duration", tokenData.duration);
      logoutTimer = setTimeout(logoutHandler, tokenData.duration);
    }
  }, [tokenData, logoutHandler]);

  const contextValue = {
    token: token,
    isLoggedIn: !!token,
    login: loginHandler,
    logout: logoutHandler,
  };

  return <AuthContext.Provider value={contextValue}>{props.children}</AuthContext.Provider>;
};

const useAuthContext = () => useContext(AuthContext);

export default useAuthContext;
