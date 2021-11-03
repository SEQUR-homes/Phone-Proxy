import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";

// You have to change that based on which parameters you expect to be passed to
// your Twilio Function via the POST body or request parameters.
type RequestParameters = {
  // eslint-disable-next-line
  request: { cookies: {}; headers: {} };
  From?: string;
  Body?: string;
};

export const handler: ServerlessFunctionSignature = function (
  context: Context<{ ORGANISER_PHONE?: string; PROXY_PHONE?: string }>,
  event: RequestParameters,
  callback: ServerlessCallback
) {
  const proxyPhoneNumber = context.PROXY_PHONE;
  const organiserPhone = context.ORGANISER_PHONE;
  const twiml = new Twilio.twiml.MessagingResponse();
  const body = event.Body;
  if (body === undefined) {
    twiml.message(
      "Apologies, there was an error processing this message. Please try again later."
    );
    return callback("Body was undefined", twiml);
  }

  if (event.From === organiserPhone) {
    if (!body.toLowerCase().startsWith("to ")) {
      twiml.message(
        'Please start your text with "To [phone-number]:" followed by your message. Please include the country code.'
      );
      return callback(null, twiml);
    }

    // example body: to +1123-456-7890: Hi
    const targetPhoneNumber = body.substring(3, body.indexOf(":"));
    const targetMessage = body.substring(body.indexOf(":") + 1).trim();

    twiml.message(
      { from: proxyPhoneNumber, to: targetPhoneNumber },
      targetMessage
    );
    twiml.message("Message sent");
    return callback(null, twiml);
  } else {
    twiml.message(
      { from: proxyPhoneNumber, to: organiserPhone },
      `SMS from: ${event.From}, Body: ${event.Body}`
    );
    return callback(null, twiml);
  }
};
