'use client'
import { useState, useEffect, useRef } from 'react';

export default function Page() {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    }

    const handleSendClick = () => {
        if (inputValue.trim() !== '') {
            setMessages([...messages, inputValue]);
            setInputValue('');
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendClick();
        }
    }

    return (
        <div>
            <div style={{ height: '300px', overflow: 'auto', border: '1px solid black', marginBottom: '10px' }}>
                {messages.map((message, index) => (
                    <div key={index}>{message}</div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                style={{ marginRight: '10px' }}
            />
            <button onClick={handleSendClick}>Send</button>
        </div>
    );
}
