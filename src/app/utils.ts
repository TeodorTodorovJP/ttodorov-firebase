import { RefObject } from "react";

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
