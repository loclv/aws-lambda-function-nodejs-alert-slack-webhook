// Example: 'https://hooks.slack.com/services/zzz/xxx'
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

const sendAlertToSlack = async (message) => {
  try {
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: message }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        'Error sending message to Slack:',
        response.status,
        errorText,
      );

      return { statusCode: response.status, message: errorText };
    }

    console.log('Successfully sent message to Slack:', message);

    return { statusCode: 200, message: 'OK' };
  } catch (error) {
    console.error('Error with request:', error);
    return { statusCode: 500, message: error.message };
  }
};

export const handler = async (event) => {
  // Log the received event for debugging purposes
  console.log('Event received:', JSON.stringify(event));

  const message =
    event.message ?? 'Alert! Check your systems. (default message from Lambda)';

  const result = await sendAlertToSlack(message);

  return {
    statusCode: result.statusCode,
    body: result.message,
  };
};
