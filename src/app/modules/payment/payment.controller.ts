import { Request, Response } from "express";
// A custom async wrapper that catches and forwards any async errors to your global error handler
import catchAsync from "../../shared/catchAsync";

// Import your payment service logic (the handler that processes different Stripe events)
import { PaymentService } from "./payment.service";

// Utility function to send standardized API responses
import sendResponse from "../../shared/sendResponse";

// Import a preconfigured Stripe instance (with secret key)
import { stripe } from "../../helper/stripe";
import config from "../../../config";

/**
 * @description
 * This controller receives incoming Stripe webhook events (POST requests)
 * from Stripe servers. It verifies the signature for security, constructs
 * a Stripe event object, and delegates event handling to `PaymentService`.
 *
 * Stripe webhooks are crucial because they notify your backend when
 * a payment succeeds, fails, or a session completes — even if the user
 * closes the browser before returning to your site.
 */
const handleStripeWebhookEvent = catchAsync(async (req: Request, res: Response) => {

    // ✅ 1. Extract Stripe's signature from the request header.
    // This header allows you to verify that the request truly came from Stripe.
    const sig = req.headers["stripe-signature"] as string;

    // ⚠️ 2. Your webhook secret key from Stripe Dashboard.
    // Each webhook endpoint you create in Stripe has a unique secret.
    // This must match exactly; otherwise, verification will fail.
    // const webhookSecret = "whsec_ae3bd6325b8da0fbcba04075bd69fa83204a4327ead453787f914841aef87692"
    const webhookSecret = config.stripeWebHook as string;

    let event;

    try {
        // ✅ 3. Verify the incoming webhook signature.
        // `constructEvent` checks the signature and builds a verified Stripe event.
        // If verification fails (e.g., wrong secret or tampered payload),
        // an error is thrown immediately.
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
        // ❌ Signature verification failed — log the error and reject the request.
        console.error("⚠️ Webhook signature verification failed:", err.message);

        // Respond with a 400 Bad Request so Stripe knows your server rejected it.
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ✅ 4. Pass the verified event to your business logic.
    // The service will decide what to do based on event type (e.g., checkout.session.completed).
    const result = await PaymentService.handleStripeWebhookEvent(event);

    // ✅ 5. Send a standardized success response back to Stripe.
    // Stripe expects a 2xx status code; otherwise, it will retry the webhook.
    // You can log or store the event result if needed.
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Webhook request processed successfully",
        data: result,
    });
});

// Export controller object so routes can easily import and use it
export const PaymentController = {
    handleStripeWebhookEvent,
};
