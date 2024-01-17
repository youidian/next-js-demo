'use client'
import { useState, useEffect, useRef } from 'react';
import {useChatManger} from "@/app/chat/useChatManger";

export default function Page() {
    const {messages,chat} = useChatManger()
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        // @ts-ignore
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);


    const handleInputChange = (e:any) => {
        setInputValue(e.target.value);
    }

    const handleSendClick = async () => {
        setInputValue('');
        await chat(inputValue);
    }

    const handleKeyPress = (e:any) => {
        if (e.key === 'Enter') {
            handleSendClick();
        }
    }
    return (
        <div className="flex justify-center w-full px-52">
        <div className="flex flex-col justify-center h-screen p-5 min-w-full ">
            <div className="overflow-auto border border-gray-300 mb-3 p-3 flex-grow rounded">
                {messages.map((message, index) => (
                    <div key={index} className={`mb-2 max-w-fit p-2 rounded-lg ${(message.role === 'bot' ||message.role === 'assistant') ? 'bg-blue-100' : 'bg-green-100 ml-auto text-right'}`}>
                        {message.content}
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
