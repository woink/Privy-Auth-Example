import { updateBalance } from '@/db/accounts';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { sender, recipient, amount } = await request.json();

    if (!sender || !recipient || amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Ensure amount is a number
    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount)) {
      return NextResponse.json(
        { error: 'Amount must be a valid number' },
        { status: 400 },
      );
    }

    const result = updateBalance(sender, recipient, parsedAmount);

    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: 400 });
    }

    return NextResponse.json({ balance: result.newBalance });
  } catch (error) {
    console.error('Error processing transaction:', error);
    return NextResponse.json(
      { error: 'Failed to process transaction' },
      { status: 500 },
    );
  }
}
