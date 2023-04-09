import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  ReactNode,
} from "react";

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

const getDateDataInUTC = (date?: string | number | Date) => {
  let useDate;
  if (date) {
    useDate = new Date(date);
  } else {
    useDate = new Date();
  }

  const year = +useDate.getUTCFullYear().toString().substring(2);
  const month = useDate.getUTCMonth();
  const day = useDate.getUTCDate();
  const hours = useDate.getUTCHours();
  const minutes = useDate.getUTCMinutes();
  return {
    year,
    month,
    day,
    hours,
    minutes,
  };
};

const calculateRemainingTime = (expirationDate: string | number | Date) => {
  // Don't use getTime, it get's the current timezone's milliseconds
  // If both dates come from different timezones, comparison would be inaccurate
  const c = getDateDataInUTC();
  const currentTimeUTCms = Date.UTC(c.year, c.month, c.day, c.hours, c.minutes);

  const exp = getDateDataInUTC(expirationDate);
  const expTimeUTCms = Date.UTC(exp.year, exp.month, exp.day, exp.hours, exp.minutes);

  const remainingDuration = expTimeUTCms - currentTimeUTCms;

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
