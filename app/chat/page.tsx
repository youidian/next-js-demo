'use client'
import { useState, useEffect, useRef } from 'react';

export default function Page() {
    const [messages, setMessages] = useState<{text:string,sender:string}[]>([]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);
    // Simulate AI responses for demonstration
    const getAIResponse = async (userInput: string) => {
        const res = await fetch('/api/tongyi', {
            method: 'POST', // Assuming it's a POST request
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userInput }),
        });
        const data = await res.json();
        console.log("data",data)
        return `"${data.output.text}"`; // Assuming 'data' is the response you want to format
    };

    const getAIStreamResponse = async (userInput: string) => {
        // 先添加一个新的AI响应到messages
        setMessages(messages => [...messages, { text: '正在获取回答...', sender: 'ai' }]);

        const response = await fetch('/api/tongyi',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept':'text/event-stream',
                },
                body: JSON.stringify({ message: userInput })});
        const reader = response.body?.getReader();
        if(reader){
            // Read the data
            while(true) {
                const { done, value } = await reader?.read();
                if (done) {
                    break;
                }
                let result = new TextDecoder("utf-8").decode(value);
                // console.log("result",result);
                // 直接在setMessages中处理更新
                setMessages(prevMessages => {
                    const newMessages = [...prevMessages];
                    newMessages[newMessages.length - 1] = { text: result, sender: 'ai' };
                    return newMessages;
                });
            }
        }

    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleInputChange = (e:any) => {
        setInputValue(e.target.value);
    }

    const handleSendClick = async () => {
        if (inputValue.trim() !== '') {
            // Add user message
            setMessages([...messages, {text: inputValue, sender: 'user'}]);
            setInputValue('');
            getAIStreamResponse(inputValue);
        }
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
