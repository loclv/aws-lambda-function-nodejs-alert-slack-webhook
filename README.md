# AWS Lambda function code using Node.js and the fetch API to make a POST request to the Slack webhook URL

## Set up an Incoming Webhook in Slack

- Go to your Slack workspace and create an Incoming Webhook URL. This will allow you to post messages to a Slack channel.
- Save the Webhook URL for use in your Lambda function.

## Create an AWS Lambda Function

- Go to the AWS Management Console and create a new Lambda function.
- AWS Lambda Function Runtime settings:
  - Runtime: Node.js 20.x (for fetch API availability - see <https://aws.amazon.com/jp/blogs/compute/node-js-18-x-runtime-now-available-in-aws-lambda/>)
  - Handler: index.handler
  - Architecture: arm64
  - Update runtime version: Auto

## Write the Lambda Function Code

Use the following JavaScript code to create your Lambda function. Copy it to your Lambda function code's `index.mjs` file.

This function sends an alert message to the specified Slack channel using the Incoming Webhook URL and the fetch API.

```javascript
// Example: 'https://hooks.slack.com/services/zzz/xxx'
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

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
```

May be you can see a warning on Lambda Function Code editor at the `fetch` API.

> `fetch` is not defined. Please fix or add global `fetch`.

This warning you can ignore because you are using the new `fetch` API of new version Node.js.

Here is a tip.

- On development environment:
  - You can change `mjs` file extension to `ts` on local for better type checking.
  - Create a new package manager and install `eslint` to lint your code.

```sh
pnpm init
# or
bun init
```

- View all source code on browser AWS lambda function editor to check if there are warnings in your code.

## Set Environment Variables

- In the AWS Lambda console, go to your function's configuration and add an environment variable with the name `SLACK_WEBHOOK_URL` and the value as your Slack Webhook URL.
- If no need to keep it secret, set `SLACK_WEBHOOK_URL` variable directly.

## Deploy and Test the Function

- To save the source code, deploy the Lambda function.
- Test the function by creating a test event with a JSON payload, for example:

```json
{
  "message": "This is a test alert from AWS Lambda."
}
```

- Press `test` button and you should see a message at Slack channel.

## Set Up Trigger (Optional)

If you want this Lambda function to be triggered by specific events (e.g., CloudWatch alarms, SNS messages), configure the appropriate trigger in the AWS Lambda console.

## Keep the source code by git repository with formatter and linter configuration

You can choose prettier, eslint or biome. For example:

`biome.json`

```json
{
  "$schema": "https://biomejs.dev/schemas/1.8.3/schema.json",
  "organizeImports": {
    "enabled": false
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single"
    }
  },
  "formatter": {
    "indentStyle": "space"
  }
}
```
