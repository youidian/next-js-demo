import { NextResponse, type NextRequest } from 'next/server';
import {Message, QwenChatApi, StreamResponse} from '@/app/util/QwenChatApi';

export  async function POST(req:NextRequest, res:NextResponse) {
    // Extract the request body
    const data = await req.json();
    const qwenChatApi = new QwenChatApi({model:'qwen-max'});
    const history = data.history?.filter((it:Message)=>it.role!=="bot")
    return  StreamResponse(qwenChatApi.stream([{ role: 'user', content: data.message }],history))
}
