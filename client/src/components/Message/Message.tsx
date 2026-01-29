import "./message.css";
type MessageProps = {
  content: string;
  receivedOrSent: string;
  createdAt: string;
};
function Message({ content, receivedOrSent, createdAt }: MessageProps) {
  return (
    <div className={`${receivedOrSent} message`}>
      <p>{content}</p>
      <span>{createdAt}</span>
    </div>
  );
}
export default Message;
