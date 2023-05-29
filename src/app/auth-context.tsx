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

/**
 * This function calculates the remaining time between the current UTC time and a given expiration
 * date.
 * @param {string | number | Date} expirationDate
 * @returns The function `calculateRemainingTime` returns the remaining duration in milliseconds
 * between the current UTC time and the expiration date passed as an argument.
 */
const calculateRemainingTime = (expirationDate: string | number | Date) => {
  // Don't use getTime, it get's the current timezone's milliseconds
  // If both dates come from different timezones, comparison would be inaccurate
  const { utcMilliseconds: currentMs } = getDateDataInUTC();
  const { utcMilliseconds: expTimeUTCms } = getDateDataInUTC(expirationDate);

  const remainingDuration = expTimeUTCms - currentMs;

  return remainingDuration;
};

/**
 * This function retrieves a stored token from local storage and checks if it has expired.
 * @returns Returns an object with two properties: `token` and `duration`. 
 * The `token` property contains the value of the token retrieved from the local storage,
 * and the `duration` property contains the remaining time in seconds until the token expires.
 */
const retrieveStoredToken = () => {
  const storedToken = localStorage.getItem("token")
  const storedExpirationDate = localStorage.getItem("expirationTime") || 0

  const remainingTime = calculateRemainingTime(storedExpirationDate)

  /** TODO: fix it, it should be <= 0, now if we have a token for the next 45 minutes it will be deleted */
  if (remainingTime <= 3600) {
    localStorage.removeItem("token")
    localStorage.removeItem("expirationTime")
    return null
  }

  return {
    token: storedToken,
    duration: remainingTime,
  }
};

/** The AuthContextProvider component provides the authentication context to the app. */
export const AuthContextProvider = (props: { children: ReactNode }) => {
  const tokenData = retrieveStoredToken()

  let initialToken
  if (tokenData) {
    initialToken = tokenData.token
  }

  const [token, setToken] = useState(initialToken)

  // Clears all token data
  const logoutHandler = useCallback(() => {
    setToken(null)
    localStorage.removeItem("token")
    localStorage.removeItem("expirationTime")

    if (logoutTimer) {
      clearTimeout(logoutTimer)
    }
  }, [])

  // Set's all token data
  const loginHandler = (token: string, expirationTime: string) => {
    setToken(token)
    localStorage.setItem("token", token)
    localStorage.setItem("expirationTime", expirationTime)
    const remainingTime = calculateRemainingTime(expirationTime)
    logoutTimer = setTimeout(logoutHandler, remainingTime)
  }

  // When the token expires, calls logoutHandler
  useEffect(() => {
    if (tokenData) {
      // console.log("Token Duration", tokenData.duration);
      logoutTimer = setTimeout(logoutHandler, tokenData.duration)
    }
  }, [tokenData, logoutHandler])

  const contextValue = {
    token: token,
    isLoggedIn: !!token,
    login: loginHandler,
    logout: logoutHandler,
  }

  return <AuthContext.Provider value={contextValue}>{props.children}</AuthContext.Provider>
};

const useAuthContext = () => useContext(AuthContext);

export default useAuthContext;
