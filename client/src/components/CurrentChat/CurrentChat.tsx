import { useState } from "react";
import Message from "../Message/Message";
import "./currentChat.css";

type messageTypes = {
  id: number;
  fromMe: boolean;
  content: string;
  created_at: string;
};
const messages = [
  {
    id: 123,
    fromMe: false,
    content: "Hello World!",
    created_at: "12-02-2026, 17h43",
  },
  {
    id: 124,
    fromMe: true,
    content: "Hello Baby!",
    created_at: "12-02-2026, 17h46",
  },
];

function CurrentChat() {
  const [inputValue, setInputValue] = useState<messageTypes>({
    id: 1233,
    fromMe: true,
    content: "",
    created_at: "",
  });
  const [allMessages, setAllMessages] = useState(messages);

  const messageSubmit = () => {
    setAllMessages([...allMessages, inputValue]);
  };

  return (
    <div className="currentChat-container">
      <div className="messagesFlow">
        {allMessages.map((msg) => (
          <Message
            key={msg.id}
            receivedOrSent={msg.fromMe ? "sent" : "received"}
            content={msg.content}
            createdAt={msg.created_at}
          />
        ))}
      </div>
      <div className="messageInput">
        <input
          type="text"
          placeholder="Type something.."
          value={inputValue.content}
          onChange={(e) => {
            setInputValue({ ...inputValue, content: e.target.value });
          }}
        />
        <button
          className="secondary"
          type="submit"
          onClick={(e) => {
            e.preventDefault;
            messageSubmit();
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
export default CurrentChat;
