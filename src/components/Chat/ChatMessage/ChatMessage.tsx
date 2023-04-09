import { ReactElement, ReactNode, useRef } from "react";
import { FriendsContent, MessageData } from "../chatSlice";
import classes from "./ChatMessage.module.css";

const ChatMessage = (props: { data: MessageData; otherUser: FriendsContent }) => {
  const textRef = useRef<HTMLElement>(null);

  const { name, userId, text, timestamp, profilePicUrl } = props.data;
  const { id: otherUserId, names: otherNames, email: otherEmail, profilePic: otherPic } = props.otherUser;

  // { text?: string; picUrl?: string; imageUrl?: string }

  // Adds a size to Google Profile pics URLs.
  const addSizeToGoogleProfilePic = (url: string) => {
    if (url.indexOf("googleusercontent.com") !== -1 && url.indexOf("?") === -1) {
      return url + "?sz=150";
    }
    return url;
  };

  // if (imageUrl) {
  //     //If the message is an image.
  //     var image = document.createElement("img");
  //     image.addEventListener("load", function () {
  //         messageListElement.scrollTop = messageListElement.scrollHeight;
  //     });

  //     image.src = imageUrl + "&" + new Date().getTime();
  //     messageElement.innerHTML = "";
  //     messageElement.appendChild(image);
  //     }
  //     //Show the card fading-in and scroll to view the new message.
  //     setTimeout(function () {
  //     div.classList.add("visible");
  //     }, 1);
  //     messageListElement.scrollTop = messageListElement.scrollHeight;
  //     messageInputElement.focus();

  let content = <p></p>;
  let contentText = <p></p>;
  const isOther = userId === otherUserId;

  const sideClass = isOther ? classes.leftSide : classes.rightSide;

  if (text) {
    contentText = <p>{text}</p>;
  }
  if (profilePicUrl) {
    let backgroundImage = "url(" + addSizeToGoogleProfilePic(profilePicUrl) + ")";
    content = <p style={{ backgroundImage: backgroundImage }}>{text}</p>;
  }

  // if (props.imageUrl) {
  //     content = <img src={props.imageUrl + "&" + new Date().getTime()} alt="Girl in a jacket" width="500" height="600"/>
  // }
  return (
    <div className={sideClass}>
      <p>{text}</p>
    </div>
  );

  // '<div class="spacing"><div class="pic"></div></div>' +
  // '<div class="message"></div>' +
  // '<div class="name"></div>' +
};

export default ChatMessage;
