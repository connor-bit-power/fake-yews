import React, { useState } from 'react';
import { PlayIcon, Cross1Icon } from '@radix-ui/react-icons';

function ChatBox({ isOpen, onClose, selectedDate }) {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');

    if (!isOpen) return null;

    const handleSendMessage = async () => {
        if (!message.trim()) return; // Prevents sending empty messages
        setMessages(messages => [...messages, { type: 'user', content: message }]);
        
        const response = await fetch('http://127.0.0.1:8001/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question: message, date_string: selectedDate }), // Updated to include selectedDate
        });
    
        const data = await response.json();
        setMessages(messages => [...messages, { type: 'bot', content: data.answer }]);
        setMessage(''); // Clears the input field
    };

    const handleInputChange = (event) => {
        setMessage(event.target.value);
    };

    // Added function to handle Enter key press
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div className="chat-box-container">
          <div className="chat-box">
            <button className="close-chat-btn" onClick={onClose}><Cross1Icon /></button>
            <div className="conversation-container">
              <p>{selectedDate}</p>
              {messages.map((msg, index) => (
                <p key={index} className={msg.type === 'user' ? 'user-message' : 'bot-message'}>{msg.content}</p>
              ))}
            </div>
            <div className="chat-input-container" style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="chat-input"
                style={{ flexGrow: 1, marginRight: 'auto' }}
              />
              <button className="send-chat-btn" onClick={handleSendMessage} style={{ marginLeft: 'auto' }}>
                <PlayIcon />
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    export default ChatBox;