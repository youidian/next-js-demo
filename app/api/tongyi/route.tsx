import { NextResponse, type NextRequest } from 'next/server';
export  async function POST(req: NextRequest, res: NextResponse) {
    // Extract the request body
    const data = await req.json();

    // Log the received data
    console.log("Received data:", data);

    // Perform operations with the data here

    return NextResponse.json({ data })
}
