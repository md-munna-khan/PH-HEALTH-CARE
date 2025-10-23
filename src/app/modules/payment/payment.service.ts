// Import the Stripe SDK to work with Stripe events and sessions
import Stripe from "stripe";

// Import your Prisma client instance to perform database operations
import { prisma } from "../../shared/prisma";

// Import your enum (from Prisma schema) to store standardized payment status values
import { PaymentStatus } from "@prisma/client";

/**
 * Handles all incoming Stripe webhook events.
 * 
 * Webhooks are sent by Stripe whenever an important event happens,
 * e.g. when a checkout session is completed, payment fails, etc.
 * 
 * This function receives a single event object from Stripe and
 * performs corresponding database updates depending on the event type.
 */
const handleStripeWebhookEvent = async (event: Stripe.Event) => {
    // The event type indicates what kind of event occurred.
    // For example: "checkout.session.completed", "payment_intent.succeeded", etc.
    switch (event.type) {

        /**
         * Event: checkout.session.completed
         * 
         * This event is triggered when a Checkout Session has successfully completed,
         * meaning the user has paid successfully or the payment has been authorized.
         */
        case "checkout.session.completed": {
            // The `data.object` property contains the full Stripe session object.
            // We cast it to `any` here because Stripe's generic type can be complex
            // and we specifically know this event relates to a Checkout Session.
            const session = event.data.object as any;

            // Retrieve the custom metadata you attached when creating the Checkout Session.
            // These IDs allow you to connect Stripe events back to your internal database records.
            const appointmentId = session.metadata?.appointmentId;
            const paymentId = session.metadata?.paymentId;

            // 🧾 Update the Appointment record in your database:
            // - Find the appointment by ID (from metadata)
            // - Update its paymentStatus field depending on Stripe's payment status
            await prisma.appointment.update({
                where: {
                    id: appointmentId,
                },
                data: {
                    // Stripe session.payment_status is usually 'paid' or 'unpaid'
                    paymentStatus:
                        session.payment_status === "paid"
                            ? PaymentStatus.PAID
                            : PaymentStatus.UNPAID,
                },
            });

            // 💰 Update the Payment record in your database:
            // - Find the payment by ID (from metadata)
            // - Store Stripe's payment data for future reference
            // - Update the status field similarly to match Stripe's payment result
            await prisma.payment.update({
                where: {
                    id: paymentId,
                },
                data: {
                    status:
                        session.payment_status === "paid"
                            ? PaymentStatus.PAID
                            : PaymentStatus.UNPAID,

                    // Save the entire Stripe session object for debugging,
                    // reconciliation, or refund processing in the future.
                    paymentGatewayData: session,
                },
            });

            // Break so no other event handler runs for this event
            break;
        }

        /**
         * Default handler for any other Stripe event types
         * that your system does not explicitly process.
         * 
         * Keeping this ensures your app logs unhandled events
         * so you can decide later if they need to be supported.
         */
        default:
            console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }
};

/**
 * Exported PaymentService object — a simple pattern
 * that keeps all payment-related logic grouped together.
 */
export const PaymentService = {
    handleStripeWebhookEvent,
};
