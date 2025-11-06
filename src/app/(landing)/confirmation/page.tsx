"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

interface ConfirmationPageProps {
    firstname?: string,
    lastname?: string,
    email?: string,
    phone?: string,
    quantity?: number,
    product?: string,
    total?: number,
    referenceId?: string,
    purpose?: string
}

export default function ConfirmationPage({data} : {data?: ConfirmationPageProps}) {
    const [processing, setProcessing] = useState(false);

    if (!data) {
        return (
            <div className="text-center mt-10">
                <h2 className="text-xl font-semibold">No purchase details found.</h2>
                <Link
                    href="/"
                    className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                    Back to Home
                </Link>
            </div>
        );
    }

    const checkAvailability = async () => {
        try {
            const cleanProductType = data.product ? data.product.toUpperCase().split(" ")[0] : "WAEC";
            const response = await fetch(`/api/cards/check-availability?type=${encodeURIComponent(cleanProductType)}&quantity=${data.quantity}`);
             console.log("🔗 Checking availability:",response);
            const result = await response.json(); 
            
            if (!response.ok) {
                throw new Error(result.error || 'Failed to check availability');
            }

            return result.available;
        } catch (error) {
            console.error('Availability check error:', error);
            return false;
        }
    };

    const handlePayment = async () => {
        try {
            setProcessing(true);

            // Check availability first
            const isAvailable = await checkAvailability();
            
            if (!isAvailable) {
                toast.error("This card is not available at the moment. Please check back later.");
                setProcessing(false);
                return;
            }

            // Initialize payment directly with Paystack
            const paymentResponse = await fetch('/api/payments/initialize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: data.email,
                    amount: data?.total * 100, // Convert to kobo
                    reference: data.referenceId,
                    callback_url: `${window.location.origin}/success`,
                    metadata: {
                        name: `${data.firstname} ${data.lastname}`,
                        phone: data.phone,
                        productType: data.product,
                        quantity: data.quantity,
                        userId: 'guest',
                    }
                }),
            });

            const paymentData = await paymentResponse.json();
            console.log('Payment initialization response:', paymentData);

            if (!paymentResponse.ok) {
                throw new Error(paymentData.error || "Payment initialization failed");
            }

            if (!paymentData.status) {
                throw new Error(paymentData.message || "Payment initialization failed");
            }

            if (!paymentData.data?.authorization_url) {
                throw new Error("Invalid payment initialization response");
            }

            // Redirect to Paystack
            window.location.href = paymentData.data.authorization_url;
        } catch (error) {
            console.error("Payment error:", error);
            toast.error("Payment failed. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="w-[90%] md:w-[40%] mx-auto mt-10 py-5 px-8 border rounded-lg shadow-sm">
            <h1 className="text-2xl font-semibold text-center mb-5 border-b pb-3">
                Purchase Confirmation
            </h1>
            <div className="space-y-2 text-gray-700">
                <p className="border rounded-sm p-2">
                    <strong>Reference ID:</strong> {data.referenceId}
                </p>
                <p className="border rounded-sm p-2">
                    <strong>Purpose:</strong> {data.purpose}
                </p>
                <p className="border rounded-sm p-2">
                    <strong>Customer Name:</strong> {data.firstname} {data.lastname}
                </p>
                <p className="border rounded-sm p-2">
                    <strong>Email:</strong> {data.email}
                </p>
                <p className="border rounded-sm p-2">
                    <strong>Phone:</strong> {data.phone}
                </p>
                <p className="border rounded-sm p-2">
                    <strong>Product:</strong> {data.product}
                </p>
                <p className="border rounded-sm p-2">
                    <strong>Quantity:</strong> {data.quantity}
                </p>
                <p className="border rounded-sm p-2">
                    <strong>Total Amount:</strong> ₦{data.total?.toLocaleString()}
                </p>
            </div>

            <div className="flex gap-4 justify-center mt-6">
                <button 
                    onClick={handlePayment}
                    disabled={processing}
                    className={`bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {processing ? 'Processing...' : 'Pay Now'}
                </button>
                <Link
                    href="/"
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-6 py-2 rounded-md transition"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
