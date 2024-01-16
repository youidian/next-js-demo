'use client'
import { useState, useEffect, useRef } from 'react';

export default function Page() {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    // Simulate AI responses for demonstration
    const getAIResponse = (userInput) => {
        return `AI response to "${userInput}"`;
    }

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
            // Add user message
            setMessages([...messages, { text: inputValue, sender: 'user' }]);
            // Add AI response
            const aiResponse = getAIResponse(inputValue);
            setMessages(messages => [...messages, { text: aiResponse, sender: 'ai' }]);
            setInputValue('');
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendClick();
        }
    }

    return (
        <div className="flex justify-center w-full px-52">
        <div className="flex flex-col justify-center h-screen p-5 min-w-full ">
            <div className="overflow-auto border border-gray-300 mb-3 p-3 flex-grow rounded">
                {messages.map((message, index) => (
                    <div key={index} className={`mb-2 max-w-fit p-2 rounded-lg ${message.sender === 'ai' ? 'bg-blue-100' : 'bg-green-100 ml-auto text-right'}`}>
                        {message.text}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="flex justify-between items-center">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    className="flex-grow mr-3 p-2 border-2 border-gray-300 rounded"
                />
                <button
                    onClick={handleSendClick}
                    className="flex-none bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    发送
                </button>
            </div>
        </div>
        </div>
    );
}