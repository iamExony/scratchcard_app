"use client";

import Link from "next/link";

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
                    <strong>Total Amount:</strong> ₦{data.total}
                </p>
            </div>

            <div className="flex gap-4 justify-center mt-6">
                <Link href="#" className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition">
                    Pay Now
                </Link>
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
