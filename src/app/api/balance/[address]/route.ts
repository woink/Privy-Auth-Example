import { NextResponse } from 'next/server';
import { getBalance } from '@/db/accounts';

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    const address = params.address;
    const balance = getBalance(address);
    
    return NextResponse.json({ balance });
  } catch (error) {
    console.error('Error getting balance:', error);
    return NextResponse.json(
      { error: 'Failed to get balance' },
      { status: 500 }
    );
  }
}