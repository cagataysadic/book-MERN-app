import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/authContext';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';

import "./Message.css";

const ChatList = () => {
  const token = localStorage.getItem('token');
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

    axios.get('/api/message/conversations', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      console.log('Server response:', response.data);
      setConversations(response.data);
    })
    .catch(error => console.error(error));
  }, [token, otherUserId, location.state]);

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
    <div className='container'>
      <div className={`chat-list-container ${selectedChat ? 'active' : ''}`}>
        <div className='chat-list'>
          <h1 className='conversation-list-header'>Your Conversation List</h1>
          <div className='conversation-list'>
            {conversations.map((conversation, index) => (
              <div key={index}>
                <div className='conversation-list-item' onClick={() => selectChat(conversation._id, conversation.userName)}>
                  <h3>{conversation.userName}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`chat-container ${selectedChat ? 'active': ''}`}>
        {selectedChat ?
         <Chat otherUserId={selectedChat} chatName={selectedChatName} /> :
         null
        }
      </div>

      {selectedChat ?
        null :
        <h1 className='chat-select-message'>Please select a chat to start messaging</h1>
      }
    </div>
  );
};

const Chat = ({ otherUserId, chatName }) => {
  const token = localStorage.getItem('token');
  const { userId } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef();

  useEffect(() => {
    
    setLoading(true);
    axios.get(`/api/message/conversations/${otherUserId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      setLoading(false);  // end loading
      setMessages(response.data);
      console.log(response.data)
    })
    .catch(error => {
      setLoading(false);  // end loading even in case of an error
      console.error(error);
    });
  }, [otherUserId, token]);

  useEffect(() => {
    socketRef.current = io.connect('http://localhost:10000', {
      query: { userId }
    });

    socketRef.current.on('receive_message', (incomingMessage) => {
      setMessages(prevMessages => [...prevMessages, incomingMessage]);
    });

    return () => socketRef.current.disconnect();
  }, [userId]);

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

    console.log(messageData.sender);
    
    socketRef.current.emit('send_message', messageData);

    setNewMessage('');
  };


  if (loading) {
    return <div>Loading...</div>;  // or your custom loading indicator
  }

  return (
    <div className='chat'>
      <h2 className='chat-header'>Chat with {chatName}</h2>
      <div className='chat-history'>
        {messages.map((message, index) => (
          <div key={index}>
            <p><strong>{ message.sender._id === userId ? 'You' : message.sender.userName}:</strong> {message.text}</p>
          </div>
        ))}
      </div>
      <div className='chat-input'>
        <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatList;
