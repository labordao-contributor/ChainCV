import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { ensName } = await request.json();
    const apiKey = process.env.ALCHEMY_API_KEY;
    if (!apiKey) {
      throw new Error("API key not found.");
    }
    const endpoint = `https://eth-mainnet.g.alchemy.com/v2/${apiKey}/resolveAddress?ensName=${ensName}`;
    const response = await fetch(endpoint, { method: 'GET', headers: { 'accept': 'application/json' } });
    const data = await response.json();
    if (data.error || !data.address) {
      return NextResponse.json({ error: 'ENS name not found' }, { status: 404 });
    }
    return NextResponse.json({ address: data.address });
  } catch (error: any) {
    console.error("ENS RESOLUTION ERROR:", error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}