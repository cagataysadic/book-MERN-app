import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/authContext';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import groupBy from 'lodash.groupby';

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
    axios.get(`/api/message/conversations/${otherUserId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      setLoading(false);
      setMessages(response.data);
    })
    .catch(error => {
      setLoading(false);
      console.error(error);
    });
  }, [otherUserId, token]);

  useEffect(() => {
    socketRef.current = io.connect('http://localhost:10000', {
      query: { userId }
    });

    socketRef.current.on('receive_message', (incomingMessage) => {
      if (incomingMessage.receiver._id !== otherUserId && incomingMessage.sender._id !== otherUserId) return;
        setMessages(prevMessages => [...prevMessages, incomingMessage]);
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
    axios.delete(`/api/message/delete/${messageId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then (() => {
      setMessages(messages.filter(message => message._id !== messageId));
    })
    .catch(error => console.error(error));
  };

  const handleKeydown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      sendMessage();
    }
  };


  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='chat'>
      <h2 className='chat-header'>Chat with {chatName}</h2>
      <div className='chat-history'>
      {Object.entries(groupedMessages).map(([date, messages], index) => (
          <div key={index}>
            <h3>{date}</h3>
            <div className='message-container'>
              {messages.map((message, index) => (
                <div 
                  key={index}
                  className={`message ${message.sender._id === userId ? 'sender' : 'receiver'}`}
                >
                  <p>{message.text}</p>
                  <p className="message-time">{new Date(message.createdAt).toLocaleTimeString()}</p>
                  {message.sender._id === userId && <button className='message-delete-button' onClick={() => deleteMessage(message._id)}>Delete</button>}
                </div>
              ))}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className='chat-input'>
        <input
          type="text" 
          value={newMessage} 
          onChange={e => setNewMessage(e.target.value)} 
          onKeyDown={handleKeydown} 
          />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatList;