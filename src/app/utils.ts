import { RefObject } from "react";

export const singleClick = (element: { ref?: RefObject<HTMLElement>; dom?: HTMLElement }, onSingleClick: Function) => {
  const htmlElement = element.ref ? element.ref.current : element.dom;

  if (htmlElement) {
    htmlElement.addEventListener("click", () => {
      onSingleClick();
    });
  }
};

export const doubleClick = (
  element: { ref?: RefObject<HTMLElement>; dom?: HTMLElement },
  onDoubleClick: Function,
  clearSelection?: boolean
) => {
  const clickSpaceDeviation: number = 10;
  const doubleClickTime: number = 500;

  let htmlElement = element.ref ? element.ref.current : element.dom;

  if (htmlElement) {
    let timer: null | ReturnType<typeof setTimeout> = null;

    let clientX: number = 0;
    let clientY: number = 0;

    htmlElement.addEventListener("click", (e: MouseEvent) => {
      if (!timer) {
        // first click position
        clientX = e.clientX;
        clientY = e.clientY;

        timer = setTimeout(() => {
          timer = null;
        }, doubleClickTime);
        return;
      }

      clearTimeout(timer);
      timer = null;

      // second click position
      clientX = clientX - e.clientX;
      clientY = clientY - e.clientY;

      if (clearSelection) {
        // Double click creates a selection of random items, so I clear it
        if (window.getSelection) {
          const selection = window.getSelection();
          if (selection !== null) {
            selection.empty(); // Chrome
            selection.removeAllRanges(); // Firefox
          }
        }
        // IE
        if (document.getSelection) {
          const selection = document.getSelection();
          if (selection !== null) {
            selection.empty();
          }
        }
      }

      // Prevent random fast clicking from acting as double click
      if (
        clientX < clickSpaceDeviation &&
        clientX > -clickSpaceDeviation &&
        clientY < clickSpaceDeviation &&
        clientY > -clickSpaceDeviation
      ) {
        clientX = clientY = 0; // redundant but good practice
        onDoubleClick();
      }
    });
  }
};

export const getDateFromEGN = (egn: string) => {
  let year = +egn.substring(0, 2);
  let month = +egn.substring(2, 4);
  let date = +egn.substring(4, 6);
  if (month > 40) {
    month = month - 40;
    year = year + 2000;
  } else if (month > 20) {
    month = month - 20;
    year = year + 1800;
  } else {
    year = year + 1900;
  }
  let dateOfBirth = year + "/" + month + "/" + date;
  return new Date(dateOfBirth);
};

// export const getGenderFromEgn = (egn: string | number) => {
  // not working properly
//   return +String(egn).substring(8, 1) % 2 == 0 ? 1 : 0;
// };

export const capitalizeFirstLetter = (word: string) => {
  return word.charAt(0) + word.slice(1).toLowerCase();
};

/**
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

  const browser = Object.keys(browsers)
    .filter((b) => {
      // @ts-ignore
      if (!!browsers[b]) return b;
    });

  return browser;
};

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

export const getError = (err: any) => {
  const errorValue = err.code
    ? err.code
    : err.message
    ? err.message
    : err.text
    ? err.text
    : err.error
    ? err.error
    : Object.values(err).join(",");
  return errorValue;
};