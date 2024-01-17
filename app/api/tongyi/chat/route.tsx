import { NextResponse, type NextRequest } from 'next/server';
import {QwenChatApi,Message} from '@/app/util/QwenChatApi';

export  async function POST(req:NextRequest, res:NextResponse) {
    // Extract the request body
    const data = await req.json();
    const qwenChatApi = new QwenChatApi({model:'qwen-max'});
    const history = data.history?.filter((it:Message)=>it.role!=="bot")
    const msg = await qwenChatApi.chat([{ role: 'user', content: data.message }],history)
    console.log("##ai返回结果",JSON.stringify(msg))
    return  NextResponse.json(msg["output"]["text"])
}
