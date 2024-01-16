import { NextResponse, type NextRequest } from 'next/server';
export  async function POST(req: NextRequest, res: NextResponse) {
    // Extract the request body
    const data = await req.json();

    // Log the received data
    console.log("Received message:", data.message);
    const output = await chat({messages:[{role:'user',content:data.message}],history:[]})
    console.log("chat output:", output);
    return NextResponse.json({ output:output["output"]})
}

export const GENERATION_URL =
    "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation";

export const chat = async (data: { messages: any; history: any; }) => {
    const { messages, history = [] } = data;
    const requestData = {
        model: "qwen-turbo",
        input: {
            messages,
            history,
        },
        parameters: {},
    };
    return  fetch(GENERATION_URL, {
        method: 'POST', // Assuming it's a POST request
        headers: {
            'Content-Type': 'application/json',
            // 'Accept':'text/event-stream',
            'Authorization': 'Bearer sk-e291921d55444a72a3c5cd345452e525',
        },
        body: JSON.stringify(requestData),
    }).then((response) => response.json());
};
