import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/authContext';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import groupBy from 'lodash.groupby';


const ChatList = () => {
  const { token, userId, api, darkMode } = useContext(AuthContext);
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
    <div className={`${darkMode ? 'bg-stone-500' : 'bg-stone-200'} relative flex justify-center items-center min-h-screen overflow-y-hidden`}>
      <ul className={`${darkMode ? `${selectedChat ? 'ml-0 bg-stone-600' : ''}` : `${selectedChat ? 'ml-0 bg-stone-300' : ''}`}transition-colors w-1/4 mx-auto py-12 flex flex-col items-center justify-center justify-items-center h-screen`}>
        <li>
          {conversations.map((conversation, index) => (
            <div key={index}>
              <div className={`${darkMode ? `${selectedChatName === conversation.userName ? 'text-teal-700 text-3xl' : ''} text-stone-200 hover:text-teal-500` : `${selectedChatName === conversation.userName ? 'text-teal-500 text-3xl' : ''} text-stone-900 hover:text-teal-700`} relative inline-block py-6 text-2xl font-medium cursor-pointer`} onClick={() => selectChat(conversation._id, conversation.userName)}>
                <h3>{conversation.userName}</h3>
              </div>
            </div>
          ))}
        </li>
      </ul>

      <div className={`${darkMode ? `${selectedChat ? 'bg-neutral-500': ''}` : `${selectedChat ? 'bg-neutral-200': ''}`} w-3/4 left-1/4 absolute`}>
        {selectedChat ?
         <Chat otherUserId={selectedChat} chatName={selectedChatName} api={api} token={token} userId={userId} darkMode={darkMode} /> :
         null
        }
      </div>
    </div>
  );
};

const Chat = ({ otherUserId, api, token, userId, darkMode }) => {
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
            <h3 className={`${darkMode ? 'text-neutral-200' : 'text-neutral-900'} text-lg py-3 font-bold ml-4`}>{date}</h3>
            <div className='flex flex-col'>
              {messages.map((message, index) => (
                <div 
                  key={index}
                  className={`${darkMode ? `${message.sender._id === userId ? 'self-end bg-teal-600 text-neutral-200' : 'self-start bg-zinc-600 text-stone-200'}` : `${message.sender._id === userId ? 'self-end bg-teal-400 text-neutral-200' : 'self-start bg-zinc-400 text-stone-100'}`} text-xl w-fit max-w-4xl justify-center items-center m-6 py-2 px-3 rounded-xl break-words`}
                >
                  <p>{message.text.split('\n').map((item, key) => {
                    return <span key={key}>{item}<br /></span>
                  })}</p>
                  <p className={`${darkMode ? 'text-stone-200' : 'text-stone-100'} text-sm py-2`}>{new Date(message.createdAt).toLocaleTimeString()}</p>
                  {message.sender._id === userId &&
                    <div className='flex justify-center'>
                      <button className={`${darkMode ? 'bg-red-700 text-stone-300 hover:bg-red-800' : 'bg-red-600 text-stone-200 hover:bg-red-700'} text-sm cursor-pointer mb-1 py-1 px-2 rounded-xl transition-colors`} onClick={() => deleteMessage(message._id)}>Delete</button>
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
          className={`${darkMode ? 'outline-teal-500 bg-neutral-200 focus:caret-teal-600' : 'outline-teal-300 bg-neutral-100 focus:caret-teal-500'} w-5/6 ml-24 mb-2 p-2 rounded text-neutral-900 hover:shadow-lg`}
          value={newMessage} 
          onChange={e => setNewMessage(e.target.value)} 
          onKeyDown={handleKeydown} 
          />
        <button className={`${darkMode ? 'bg-teal-700 text-neutral-200 hover:bg-teal-800' : 'bg-teal-600 text-neutral-100 hover:bg-teal-700'} ml-8 mb-2 py-0 px-3 border-none text-xl rounded-xl cursor-pointer transition-colors`} onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatList;