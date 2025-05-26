import axios from 'axios';

// API client for the frontend
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get balance for a specific address
export const getBalance = async (address: string): Promise<number> => {
  try {
    const response = await api.get<{ balance: number }>(`/balance/${address}`);
    return response.data.balance;
  } catch (error) {
    console.error('Error fetching balance:', error);
    throw error;
  }
};

// Send transaction
export interface SendTransactionParams {
  sender: string;
  recipient: string;
  amount: number;
}

export interface SendTransactionResponse {
  balance: number;
}

export const sendTransaction = async (
  params: SendTransactionParams,
): Promise<SendTransactionResponse> => {
  try {
    const response = await api.post<SendTransactionResponse>('/send', params);
    return response.data;
  } catch (error) {
    console.error('Error sending transaction:', error);
    throw error;
  }
};

export default api;
