const Message = ({ message }: { message: string }) => {
    return (
    <div className="chat chat-start">
      <div className="chat-bubble">{message}</div>
    </div>
  );
};

const Chat = () => {
  return (
    <div className="chat">
      <Message message="Hello, how are you?" />
      <Message message="I'm fine, thanks for asking." />
      <Message message="I'm good too, thanks for asking." />
      <Message message="I'm doing great, thanks for asking." />
        <div className="chat chat-end">
            <div className="chat-bubble-success chat-bubble">The End</div>
        </div>
    </div>
  );
};

export default Chat;