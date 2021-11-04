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
};

export const handler: ServerlessFunctionSignature = function (
  context: Context<{ ORGANISER_PHONE?: string; PROXY_PHONE?: string }>,
  event: RequestParameters,
  callback: ServerlessCallback
) {
  const twiml = new Twilio.twiml.VoiceResponse();
  console.log(context);

  const privatePhoneNumber = context.ORGANISER_PHONE;
  if (privatePhoneNumber === undefined) {
    twiml.say("Unexpected error, we have been alerted.");
    return callback(null, twiml);
  }

  const proxyPhoneNumber = context.PROXY_PHONE;
  if (proxyPhoneNumber === undefined) {
    twiml.say("Unexpected error, we have been alerted.");
    return callback(null, twiml);
  }

  if (event.From === privatePhoneNumber) {
    const gather = twiml.gather({ action: "/dialNumber" });
    gather.say(
      "Welcome to the forwarding dashboard. Please enter a phone number followed by the hash key?"
    );

    // fallback message in case no response is given
    twiml.say("We didn't receive any input. Goodbye!");
    return callback(null, twiml);
  } else {
    // forward call to your private phone number
    twiml.dial({ callerId: proxyPhoneNumber }, privatePhoneNumber);
    twiml.sms(
      { from: proxyPhoneNumber, to: privatePhoneNumber },
      `Call from: ${event.From}`
    );
    return callback(null, twiml);
  }
};
