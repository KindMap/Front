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
      body: JSON.stringify({ question: message }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ChatbotApi] Lambda error:', errorText);
      throw new Error(`Lambda error: ${response.status} ${response.statusText}`);
    }

    // Lambda returns JSON with "answer" field
    const data = await response.json();
    const answerText = data.answer || data.response || JSON.stringify(data);

    // Replace escaped newlines with actual newlines
    const formattedAnswer = answerText.replace(/\\n/g, '\n');

    console.log('[ChatbotApi] Lambda response received:', formattedAnswer);

    return formattedAnswer;
  } catch (error) {
    console.error('[ChatbotApi] sendMessageToLambda failed:', error);
    throw error;
  }
}
