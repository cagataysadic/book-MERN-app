import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/authContext';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import groupBy from 'lodash.groupby';
import "./styles/Animation.scss";


const ChatList = () => {
  const { token, userId, api } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedChatName, setSelectedChatName] = useState('');

  const location = useLocation();
  const otherUserId = location.state ? location.state.otherUserId : null;

  useEffect(() => {
    if (otherUserId) {
        setSelectedChat(otherUserId);
        setSelectedChatName(location.state ? location.state.chatName : '');
    }

    api.get('/message/conversations')
    .then(response => {
      setConversations(response.data);
    })
    .catch(error => console.error(error));
  }, [token, otherUserId, location.state, api]);

  const selectChat = (otherUserId, chatName) => {
    if (selectedChat === otherUserId && selectedChatName === chatName) {
      setSelectedChat(null);
      setSelectedChatName('');
    } else {
      setSelectedChat(otherUserId);
      setSelectedChatName(chatName);
    }
  };

  return (
    <div className="bg-zinc-900 relative flex justify-center items-center min-h-screen overflow-y-hidden">
      <ul className={`${selectedChat ? 'ml-0 bg-zinc-950' : ''} transition-colors w-1/6 mx-auto py-12 flex flex-col items-center justify-center justify-items-center h-screen`}>
        <li>
          {conversations.map((conversation, index) => (
            <div key={index}>
              <div className={`${selectedChatName === conversation.userName ? 'text-teal-200 text-2xl' : ''} text-teal-300 hover:text-teal-200 relative inline-block py-6 text-2xl font-medium cursor-pointer`} onClick={() => selectChat(conversation._id, conversation.userName)}>
                <h3>{conversation.userName}</h3>
              </div>
            </div>
          ))}
        </li>
      </ul>

      <div className={`${selectedChat ? 'bg-zinc-900': ''} w-5/6 right-0 absolute`}>
        {selectedChat ?
         <Chat otherUserId={selectedChat} chatName={selectedChatName} api={api} token={token} userId={userId} /> :
         null
        }
      </div>
    </div>
  );
};

const Chat = ({ otherUserId, api, token, userId }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  const socketRef = useRef();

  const messagesEndRef = useRef(null);

  const groupedMessages = groupBy(messages, message => 
    new Date(message.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  );

  useEffect(() => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }
    }, 0);
  }, [messages]);

  useEffect(() => {
    if (!loading) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [loading]);

  useEffect(() => {
    
    setLoading(true);
    api.get(`/message/conversations/${otherUserId}`)
    .then(response => {
      setLoading(false);
      setMessages(response.data);
    })
    .catch(error => {
      setLoading(false);
      console.error(error);
    });
  }, [otherUserId, token, api]);

  useEffect(() => {
    socketRef.current = io.connect((process.env.REACT_APP_SOCKET_URL) || (process.env.REACT_DEV_URL), {
      query: { userId }
    });

    socketRef.current.on('receive_message', (incomingMessage) => {
      if (incomingMessage.receiver._id !== otherUserId && incomingMessage.sender._id !== otherUserId) return;
        setMessages(prevMessages => [...prevMessages, incomingMessage]);
    });

    socketRef.current.on('delete_message', (deletedMessageId) => {
      setMessages(prevMessages => prevMessages.filter(message => message._id !== deletedMessageId));
    });

    return () => socketRef.current.disconnect();
  }, [userId, otherUserId]);

  if (!userId) {
    console.error('User ID is not defined!');
    return;
  }  

  const sendMessage = () => {
    const messageData = {
      text: newMessage, 
      sender: userId,
      receiver: otherUserId
    };
    
    socketRef.current.emit('send_message', messageData);

    setNewMessage('');
  };

  const deleteMessage = (messageId) => {
    api.delete(`/message/delete/${messageId}`)
    .then (() => {
      setMessages(messages.filter(message => message._id !== messageId));
    })
    .catch(error => console.error(error));
  };

  const handleKeydown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };


  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='flex-1 flex flex-col py-5 h-screen'>
      <div className='h-screen flex flex-col items-stretch overflow-y-auto pt-6 scroll-smooth'>
        {Object.entries(groupedMessages).map(([date, messages], index) => (
          <div key={index} className='px-6'>
            <h3 className="text-teal-200 text-lg py-3 font-bold ml-4">{date}</h3>
            <div className='flex flex-col'>
              {messages.map((message, index) => (
                <div 
                  key={index}
                  className={`${message.sender._id === userId ? 'self-end bg-teal-950 text-teal-100' : 'self-start bg-cyan-950 text-cyan-100'} text-lg w-fit max-w-2xl justify-center items-center m-6 py-2 px-3 rounded-xl break-words`}
                >
                  <p>{message.text.split('\n').map((item, key) => {
                    return <span key={key}>{item}<br /></span>
                  })}</p>
                  <p className="text-teal-200 text-sm py-2">{new Date(message.createdAt).toLocaleTimeString()}</p>
                  {message.sender._id === userId &&
                    <div className='flex justify-center'>
                      <button className="delete-button" onClick={() => deleteMessage(message._id)}>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        Delete
                      </button>
                    </div>
                  }
                </div>
              ))}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className='flex mt-2'>
        <textarea
          className="outline-teal-500 bg-teal-200 focus:caret-teal-600 w-5/6 ml-24 mb-2 p-2 rounded text-neutral-900 hover:shadow-lg"
          value={newMessage} 
          onChange={e => setNewMessage(e.target.value)} 
          onKeyDown={handleKeydown} 
          />
        <button className="message-button" onClick={sendMessage}>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatList;