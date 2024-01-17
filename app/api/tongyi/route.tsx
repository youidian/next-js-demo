import { NextResponse, type NextRequest } from 'next/server';
import {QwenChatApi,StreamResponse} from '../../util/QwenChatApi';

export  async function POST(req:NextRequest, res:NextResponse) {
    // Extract the request body
    const data = await req.json();
    const qwenChatApi = new QwenChatApi();
    return  StreamResponse(qwenChatApi.stream([{ role: 'user', content: data.message }],[]))
}
