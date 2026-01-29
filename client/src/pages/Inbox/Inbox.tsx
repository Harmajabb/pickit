import "./Inbox.css";
function Inbox() {
  return (
    <main className="inbox-container">
      <div className="inbox-chatList">
        <div>user pfp item</div>
      </div>
      <div className="inbox-currentChat">
        <div>blabla</div>
        <div>blabla</div>
        <input type="text" />
        <button type="submit" className="secondary">
          go
        </button>
      </div>
    </main>
  );
}
export default Inbox;
