/**
 * Chatbot API Service
 *
 * Handles communication with AWS Lambda chatbot endpoint
 */

import { LambdaResponse } from '../types/chatbot';

// Environment variable
const AWS_LAMBDA_ENDPOINT = import.meta.env.VITE_AWS_LAMBDA_CHATBOT_URL;

/**
 * Send message to AWS Lambda chatbot and get response
 *
 * @param message - User's question
 * @returns Bot's response
 */
export async function sendMessageToLambda(
  message: string
): Promise<string> {
  if (!AWS_LAMBDA_ENDPOINT) {
    throw new Error('AWS Lambda endpoint is not configured. Please set VITE_AWS_LAMBDA_CHATBOT_URL in .env');
  }

  try {
    console.log('[ChatbotApi] Sending message to Lambda:', message);

    // Call AWS Lambda via API Gateway (/chat endpoint, POST)
    const response = await fetch(`${AWS_LAMBDA_ENDPOINT}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ChatbotApi] Lambda error:', errorText);
      throw new Error(`Lambda error: ${response.status} ${response.statusText}`);
    }

    // Lambda returns just the answer text
    const answerText = await response.text();
    console.log('[ChatbotApi] Lambda response received');

    return answerText;
  } catch (error) {
    console.error('[ChatbotApi] sendMessageToLambda failed:', error);
    throw error;
  }
}
