import { getBlob, ref } from "firebase/storage";
import { RefObject } from "react";
import { fileStorage } from "../firebase-config";

/**
 * Adds a click event listener to a given HTML element and executes a callback
 * function on a single click.
 * @param element - Object with 2 optional properties.
 *  @param {HTMLElement} element.dom - An HTML element. 
 *  @param {RefObject<HTMLElement>} element.ref - A reference to a HTML element.
 * @param {Function} onSingleClick - onSingleClick is a function that will be executed when the element
 * is clicked once. It is passed as a parameter to the singleClick function.
 */
export const singleClick = (element: { ref?: RefObject<HTMLElement>; dom?: HTMLElement }, onSingleClick: Function) => {
  const htmlElement = element.ref ? element.ref.current : element.dom;

  if (htmlElement) {
    htmlElement.addEventListener("click", () => {
      onSingleClick();
    });
  }
};

/**
 * The function `doubleClick` listens for double clicks on a given HTML element and triggers a callback
 * function when a double click is detected, with an option to clear any text selection.
 * @param element - Object with 2 optional properties.
 *  @param {HTMLElement} element.dom - An HTML element. 
 *  @param {RefObject<HTMLElement>} element.ref - A reference to a HTML element.
 * @param {Function} onDoubleClick - onDoubleClick is a function that will be called when the element
 * is double-clicked.
 * @param {boolean} [clearSelection] - `clearSelection` is an optional boolean parameter that
 * determines whether to clear any text selection made by the user before executing the double click
 * action. If set to `true`, the function will clear any text selection made by the user before
 * executing the `onDoubleClick` function.
 */
export const doubleClick = (
  element: { ref?: RefObject<HTMLElement>; dom?: HTMLElement },
  onDoubleClick: Function,
  clearSelection?: boolean
) => {
  // The distance in pixels between the first click and the second click.
  const clickSpaceDeviation: number = 10
  // The time to wait between clicks, before forgetting about the previous click
  const doubleClickTime: number = 500

  let htmlElement = element.ref ? element.ref.current : element.dom

  if (htmlElement) {
    // Init the timer variable
    let timer: null | ReturnType<typeof setTimeout> = null

    let clientX: number = 0
    let clientY: number = 0

    htmlElement.addEventListener("click", (e: MouseEvent) => {
      if (!timer) {
        // first click position
        clientX = e.clientX
        clientY = e.clientY

        // Set the timer and exit the function
        timer = setTimeout(() => {
          timer = null
        }, doubleClickTime)
        return
      }

      // At this point, if we have a timer, this means that setTimeout did not have the time to execute it's callback.
      // Which means that the second click was within the "doubleClickTime"
      // We clear the timer, so that after we execute the onDoubleClick function, we have a fresh start,
      // and not a doubleClick on a every click.
      clearTimeout(timer)
      timer = null

      // second click position
      clientX = clientX - e.clientX
      clientY = clientY - e.clientY

      if (clearSelection) {
        // Double click creates a selection of random items, so a cleanup is required
        if (window.getSelection) {
          const selection = window.getSelection()
          if (selection !== null) {
            selection.empty() // Chrome
            selection.removeAllRanges() // Firefox
          }
        }
        // IE
        if (document.getSelection) {
          const selection = document.getSelection()
          if (selection !== null) {
            selection.empty()
          }
        }
      }

      // Prevent random fast clicking from acting as a double click
      // Evaluate the distance between click and if it doesn't exceed the clickSpaceDeviation
      // we do the onDoubleClick function
      if (
        clientX < clickSpaceDeviation &&
        clientX > -clickSpaceDeviation &&
        clientY < clickSpaceDeviation &&
        clientY > -clickSpaceDeviation
      ) {
        clientX = clientY = 0 // redundant but good practice
        onDoubleClick()
      }
    })
  }
}

/**
 * Get's the date of birth of a person
 * Works for old and new style
 * @param {string} egn - A Bulgarian EGN
 * @returns - The date of birth
 */
export const getDateFromEGN = (egn: string) => {
  let year = +egn.substring(0, 2)
  let month = +egn.substring(2, 4)
  let date = +egn.substring(4, 6)
  if (month > 40) {
    // Born after year 2000
    month = month - 40
    year = year + 2000
  } else if (month > 20) {
    // Born after year 1800
    month = month - 20
    year = year + 1800
  } else {
    // Born after year 1900
    year = year + 1900
  }
  let dateOfBirth = year + "/" + month + "/" + date
  return new Date(dateOfBirth)
}

// export const getGenderFromEgn = (egn: string | number) => {
// not working properly
//   return +String(egn).substring(8, 1) % 2 == 0 ? 1 : 0;
// };

export const capitalizeFirstLetter = (word: string) => {
  return word.charAt(0) + word.slice(1).toLowerCase();
};

/**
 * Detects which browser is used
 * @return Array of strings - each string is the name of the browser - should be only 1
 */
export const checkBrowser = () => {
  let isOpera;
  try {
    // Opera 8.0+
    // @ts-ignore
    isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(" OPR/") >= 0;
  } catch (e) {
    console.error(e);
  }
  let isFirefox;
  try {
    // Firefox 1.0+
    // @ts-ignore
    isFirefox = typeof InstallTrigger !== "undefined";
  } catch (e) {
    console.error(e);
  }
  let isSafari;
  try {
    // Safari 3.0+ "[object HTMLElementConstructor]"
    isSafari =
      // @ts-ignore
      /constructor/i.test(window.HTMLElement) ||
      (function (p) {
        return p.toString() === "[object SafariRemoteNotification]";
        // @ts-ignore
      })(!window["safari"] || (typeof safari !== "undefined" && safari.pushNotification));
  } catch (e) {
    console.error(e);
  }
  let isIE;
  try {
    // Internet Explorer 6-11
    // @ts-ignore
    isIE = /*@cc_on!@*/ false || !!document.documentMode;
  } catch (e) {
    console.error(e);
  }
  let isEdge;
  try {
    // Edge 20+
    // @ts-ignore
    isEdge = !isIE && !!window.StyleMedia;
  } catch (e) {
    console.error(e);
  }
  let isChrome;
  try {
    // Chrome 1 - 71
    // @ts-ignore
    isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
  } catch (e) {
    console.error(e);
  }
  let isBlink;
  try {
    // Blink engine detection
    // @ts-ignore
    isBlink = (isChrome || isOpera) && !!window.CSS;
  } catch (e) {
    console.error(e);
  }

  const browsers = {
    isOpera,
    isFirefox,
    isSafari,
    isIE,
    isEdge,
    isChrome,
    isBlink,
  };

  const browser = Object.keys(browsers).filter((b) => {
    // @ts-ignore
    if (!!browsers[b]) return b;
  });

  return browser;
};

/**
 * A duplicate of JSON.stringify, but without the issues of stringifying errors
 * @param {any} data - any kind of data
 * @returns A string representing the input data
*/
export const stringifyJSON = (data: any): any => {
  if (data === undefined) return undefined;
  else if (data === null) return "null";
  else if (data.constructor === Number) return String(data);
  else if (data.constructor === Boolean) return data ? "true" : "false";
  else if (data.constructor === String) {
    return '"' + data.replace(/"/g, '\\"') + '"';
  } else if (data.constructor === Array) {
    return (
      "[ " +
      data
        .reduce((acc, v) => {
          if (v === undefined) return [...acc, "null"];
          else return [...acc, stringifyJSON(v)];
        }, [])
        .join(", ") +
      " ]"
    );
  } else if (data.constructor === Object) {
    return (
      "{ " +
      Object.keys(data)
        .reduce<string[]>((acc, k) => {
          if (data[k] === undefined) {
            return acc;
          } else {
            return [...acc, stringifyJSON(k) + ":" + stringifyJSON(data[k])];
          }
        }, [])
        .join(", ") +
      " }"
    );
  } else return "{}";
};

/**
 * Get's the actual error out of the error object.
 * @param {any} err - Any object that may contain one of the common error names - code, message, text, error, err
 * @returns - The error message, if nothing is found, join all object's values and return them. The error may be there.
*/
export const getError = (err: any) => {
  const errorValue = err.code
    ? err.code
    : err.message
    ? err.message
    : err.text
    ? err.text
    : err.err
    ? err.err
    : err.error
    ? err.error
    : Object.values(err).join(",")
  return errorValue;
};

/**
 * This function fetches an image as a Blob file, creates a URL for it, and stores it in the browser's
 * memory.
 * @param {string} imageUrl - The URL of an image that needs to be fetched as a Blob file.
 * @returns An object with two properties: `blobUrl` and `revokeUrl`. `blobUrl` is a URL that
 * represents the Blob file stored in the browser's memory, and `revokeUrl` is a function that can be
 * used to release the memory used by the Blob file.
 */
export const getBlobUrl = async (imageUrl: string) => {
  // Uses Firebase to fetch an image as a Blob file
  const blob = await getBlob(ref(fileStorage, imageUrl))
  // Uses one of the window options to create a URL, to get the urlCreator
  const urlCreator = window.URL || window.webkitURL
  // Uses the urlCreator to store the Blob file in the browser's memory
  const imageUrlBlob = urlCreator.createObjectURL(blob)
  return { blobUrl: imageUrlBlob, revokeUrl: urlCreator.revokeObjectURL }
};

/**
 * The function `loadXHR` uses XMLHttpRequest to load a file from a given URL and returns a Promise
 * that resolves with the file's data as a blob or rejects with an error message.
 * @param {string} url - A string representing the URL of the resource to be loaded using
 * @param {string} asType - A string representing the responseType of the resource to be loaded using
 * XMLHttpRequest.
 * @returns A Promise object is being returned.
 * Despite its name, XMLHttpRequest can be used to retrieve any type of data, not just XML.
 */
export const loadXHR = (url: string, asType: "arraybuffer" | "blob" | "document" | "json" | "text") => {
  return new Promise((resolve, reject) => {
    try {
      const xhr = new XMLHttpRequest()
      xhr.open("GET", url)
      xhr.responseType = asType ? asType : ""
      xhr.onerror = () => reject("Network error.")
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(xhr.response)
        } else {
          reject("Loading error:" + xhr.statusText)
        }
      }
      xhr.send()
    } catch (err) {
      reject(getError(err))
    }
  })
}

/**
 * This function takes a date input and returns an object with various date values in UTC format.
 * @param {string | number | Date} [date] - The input date that needs to be converted to UTC. It can be
 * a string, number or a Date object. If no input is provided, the current date and time will be used.
 * @returns An object containing various properties related to the input date or the current date in
 * UTC format, including year, month, day, hours, minutes, seconds, utcMilliseconds, utcDate, and
 * utcDifference.
 */
export const getDateDataInUTC = (date?: string | number | Date) => {
  let useDate
  // @ts-ignore
  if (date) {
    useDate = new Date(date)
  } else {
    useDate = new Date()
  }

  // Prepare the values for Date.UTS
  const year = +useDate.getUTCFullYear().toString().substring(2)
  const fullYear = +useDate.getUTCFullYear()
  const month = useDate.getUTCMonth()
  const day = useDate.getUTCDate()
  const hours = useDate.getUTCHours()
  const minutes = useDate.getUTCMinutes()
  const seconds = useDate.getUTCSeconds()

  // Convert the existing date to a UTC date in milliseconds
  const utcMilliseconds = Date.UTC(fullYear, month, day, hours, minutes, seconds)

  // Convert the utcMilliseconds in to a readable date
  const utcDate = new Date(utcMilliseconds).toUTCString()

  // Get's the timezone difference in hours between the input date and the UTC date
  const utcDifference = new Date().getTimezoneOffset() / 60

  // This is to be prevent wrong sorting
  // 9 hours and 7 minutes is 97, 10 hours and 12 minutes is 1012
  // That way all timestamps from the small hours will be first, regardless of day which is an issue
  // These conversions help with that.
  const converted = {
    month: month < 10 ? "0" + month : month,
    day: day < 10 ? "0" + day : day,
    hours: hours < 10 ? "0" + hours : hours,
    minutes: minutes < 10 ? "0" + minutes : minutes,
    seconds: seconds < 10 ? "0" + seconds : seconds,
  }

  // This is to take accurate and formatted time stamp for the logs
  const formattedDate = `${fullYear}${converted.month}${converted.day}${converted.hours}${converted.minutes}${converted.seconds}`

  return {
    year,
    month,
    day,
    hours,
    minutes,
    seconds,
    utcMilliseconds,
    utcDate: utcDate,
    utcDifference: utcDifference,
    formattedDate: formattedDate,
  }
};

/**
 * The function checks if the user is on a mobile device by testing the user agent string for specific
 * keywords.
 * @returns The function `isMobile` returns a boolean value indicating whether the user agent string
 * contains the words "iPhone", "iPad", "iPod", or "Android". If any of these words are present, the
 * function returns `true`, indicating that the device is a mobile device. Otherwise, it returns
 * `false`, indicating that the device is not a mobile device.
 */
export const isMobile = () => {
  const test = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  return test;
};

/**
 * Get the Date info formatted.
*/
export const getLocalDateInfo = (date?: string | number | Date) => {
  let useDate
  // @ts-ignore
  if (date) {
    useDate = new Date(date)
  } else {
    useDate = new Date()
  }

  // Prepare the values for Date.UTS
  const year = +useDate.getFullYear().toString().substring(2)
  const fullYear = +useDate.getFullYear()
  const month = useDate.getMonth()
  const day = useDate.getDate()
  const hours = useDate.getHours()
  const minutes = useDate.getMinutes()
  const seconds = useDate.getSeconds()
  const milliseconds = useDate.getMilliseconds();

  // Convert the utcMilliseconds in to a readable date
  const readableDate = new Date().toString()

  // This is to be prevent wrong sorting
  // 9 hours and 7 minutes is 97, 10 hours and 12 minutes is 1012
  // That way all timestamps from the small hours will be first, regardless of day which is an issue
  // These conversions help with that.
  const converted = {
    month: month < 10 ? "0" + month : month,
    day: day < 10 ? "0" + day : day,
    hours: hours < 10 ? "0" + hours : hours,
    minutes: minutes < 10 ? "0" + minutes : minutes,
    seconds: seconds < 10 ? "0" + seconds : seconds,
  }

  // This is to take accurate and formatted time stamp for the logs
  const formattedDate = `${fullYear}${converted.month}${converted.day}${converted.hours}${converted.minutes}${converted.seconds}`

  return {
    year,
    month,
    day,
    hours,
    minutes,
    seconds,
    milliseconds,
    readableDate,
    formattedDate,
  }
};



  /** Reads all possible screen parameters and gives the sizes. */
  export const getSizes = () => {
    // Find the size of the screen
    const body = document.body
    const html = document.documentElement

    const windowMaxHeight: number = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    )

    // console.log("body.scrollHeight: ", body.scrollHeight);
    // console.log("body.offsetHeight: ", body.offsetHeight);
    // console.log("html.clientHeight: ", html.clientHeight);
    // console.log("html.scrollHeight: ", html.scrollHeight);
    // console.log("html.offsetHeight: ", html.offsetHeight);
    // console.log("windowMaxHeight: ", windowMaxHeight);

    /* This is to help with window resize when address bar is hidden*/
    // Does not work, on mobile still returns 0
    const addressBarHeight = window.innerHeight - html.clientHeight
    const windowHeight = windowMaxHeight + addressBarHeight

    /* This is to help with window resize when address bar is hidden*/
    // 100vh + addressBarVH
    const addressBarHeightPercentage = 100 + Math.trunc(addressBarHeight / windowMaxHeight)

    const windowMaxWidth: number = Math.max(
      body.scrollWidth,
      body.offsetWidth,
      html.clientWidth,
      html.scrollWidth,
      html.offsetWidth
    )

    // console.log("windowMaxWidth: ", windowMaxWidth);
    // console.log("windowMaxHeight: ", windowMaxHeight);
    // console.log("addressBarHeight: ", addressBarHeight);
    // console.log("addressBarHeightPercentage: ", addressBarHeightPercentage);

    return {
      windowMaxWidth,
      windowMaxHeight,
      addressBarHeight,
      addressBarHeightPercentage,
    }
  }
