import { NextResponse, type NextRequest } from 'next/server';
import {EventStreamContentType, fetchEventSource} from '@fortaine/fetch-event-source';
import { Readable } from 'stream';
/*export  async function POST(req: NextRequest, res: NextResponse) {
    // Extract the request body
    const data = await req.json();
    // 创建一个可读流
    const readable = new Readable({
        read() {}
    });
    // Log the received data
    console.log("Received message:", data.message);
    const output =  streamChat({messages:[{role:'user',content:data.message}],history:[]},readable)
    console.log("chat output:", output);
    // return NextResponse.json({ output:output["output"]})
    return new NextResponse(readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache, no-transform',
        },
    });
}*/

function iteratorToStream(iterator: any) {
    return new ReadableStream({
        async pull(controller) {
            const { value, done } = await iterator.next()

            if (done) {
                controller.close()
            } else {
                controller.enqueue(value)
            }
        },
    })
}

const encoder = new TextEncoder()



export  async function POST(req:NextRequest, res:NextResponse) {
    // Extract the request body
    const data = await req.json();
    // Stream Chat
    const chatStream = streamChat({ messages: [{ role: 'user', content: data.message }], history: [] });
    async function* makeIterator() {
        try {
            for await
                (const message of chatStream) {
                console.log(message);
                const parse = JSON.parse(message);
                // 处理每个消息
                yield encoder.encode(parse["output"]["text"])
            }
        } catch (err) {
            console.error('Error during streaming:', err);
        }
    }

    const iterator = makeIterator()
    const stream = iteratorToStream(iterator)
    return new Response(stream,{
        headers: {
            'Content-Type': EventStreamContentType,
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache, no-transform',
        },
    })
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

function streamChat(data: { messages: any; history: any; }){
    let resolveNext:Function;
    let rejectNext:Function;
    let pending = false;
    let done = false;
    let queue:any[] = [];
    // 创建异步迭代器
    const asyncIterator = {
        next() {
            if (queue.length > 0) {
                // 如果队列中有数据，立即返回
                return Promise.resolve({ value: queue.shift(), done: false });
            } else if (done) {
                // 如果流已经结束，返回结束信号
                return Promise.resolve({ done: true });
            } else {
                // 否则，等待下一个值
                pending = true;
                return new Promise((resolve, reject) => {
                    resolveNext = resolve;
                    rejectNext = reject;
                });
            }
        },

        // 可选：提供一个方法来手动关闭迭代器
        return() {
            done = true;
            if (pending) {
                resolveNext({ done: true });
            }
            return Promise.resolve({ done: true });
        }
    };
    const ctrl = new AbortController();
    const { messages, history = [] } = data;
    const requestTimeoutId = setTimeout(
        () => ctrl.abort(),
        30 * 1000,
    );
    const requestData = {
        model: "qwen-turbo",
        input: {
            messages,
            history,
        },
        parameters: {},
    };
    fetchEventSource(GENERATION_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept':'text/event-stream',
            'Authorization': 'Bearer sk-e291921d55444a72a3c5cd345452e525',
        },
        body: JSON.stringify(requestData),
        signal: ctrl.signal,
        async onopen(response) {
            clearTimeout(requestTimeoutId);
        },
        onmessage(msg) {
            const text = msg.data;
            if (pending) {
                resolveNext({ value: text, done: false });
                pending = false;
            } else {
                queue.push(text);
            }
        },
        onclose() {
            done = true;
            if (pending) {
                resolveNext({ done: true });
            }
        },
        onerror(err) {
            done = true;
            if (pending) {
                rejectNext(err);
            }
        }
    });
    return {
        [Symbol.asyncIterator]() {
            return asyncIterator;
        }
    };
}
