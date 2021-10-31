import {
    Context,
    ServerlessCallback,
    ServerlessFunctionSignature,
} from '@twilio-labs/serverless-runtime-types/types';

const DEFAULT_COUNTRY_CODE = "+61"

// You have to change that based on which parameters you expect to be passed to
// your Twilio Function via the POST body or request parameters.
type RequestParameters = {
    request: {
        cookies: {};
        headers: {};
    }
    Digits?: String
};

export const handler: ServerlessFunctionSignature = function (
    context: Context<{ PROXY_PHONE?: String }>,
    event: RequestParameters,
    callback: ServerlessCallback
) {
    const twiml = new Twilio.twiml.VoiceResponse();

    const proxyPhoneNumber = context.PROXY_PHONE;
    if (proxyPhoneNumber === undefined) {
        twiml.say("Unexpected error, we have been alerted.")
        return callback(null, twiml)
    }
    const inputPhoneNumber = event.Digits;

    if (inputPhoneNumber === undefined) {
        twiml.say(`No phone number provided`);
        return callback(null, twiml)
    }

    // Phone Numbers must start with +61
    let phoneNumberToCall = ""
    if (inputPhoneNumber[0] === "0") {
        phoneNumberToCall = DEFAULT_COUNTRY_CODE + inputPhoneNumber.slice(1)
    } else {
        phoneNumberToCall = DEFAULT_COUNTRY_CODE + inputPhoneNumber
    }

    twiml.say(`Starting call to ${phoneNumberToCall.split('').join(' ')}`);

    // callerId required to make the phone call "originate" from proxyPhoneNumber
    twiml.dial({ callerId: proxyPhoneNumber.toString() }, phoneNumberToCall.toString());

    return callback(null, twiml);
};