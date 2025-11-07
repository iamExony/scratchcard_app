"use client";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { products } from "@/components/landing/products";
import React, { useState, use } from "react";
import { useRouter } from "next/navigation";
import ConfirmationPage from "../confirmation/page";
import { generateReference } from "@/lib/utils";


interface DetailPageProp {
    params: Promise<{ id: string }>;
}

export default function DetailPage({ params }: DetailPageProp) {

    const { id } = use(params);
    const cards = products.find((card) => card.id === id)
    const router = useRouter();
    const [next, setNext] = useState(false)
    const [userData, setUserData] = useState({});


    const [form, setForm] = useState({
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        quantity: 1
    })

    const handleTitleSelect = (title?: string) => {
        if (!title) {
            return 'WAEC'
        }
        const sepTitle = title.split(" ");
        const firstTitle = sepTitle[0];
        return firstTitle;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === 'quantity' ? Number(value) : value
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const referenceId = generateReference()
        const purpose = `${handleTitleSelect(cards?.title)} Scratch Card Purchase`;

        setUserData({
            ...form,
            product: cards?.title,
            total: cards ? (parseInt(cards.price.replace('₦', '').replace(',', '')) * form.quantity) : 0,
            referenceId,
            purpose
        });

        setNext(true);

    }
    return (
        <div>
            {!next ? (<div className="flex flex-col w-[90%] mx-auto my-5 gap-5">
                <h1 className="bg-gray-50 py-5 text-center text-sm md:text-2xl font-semibold ">{handleTitleSelect(cards?.title)} Scratch Card Online</h1>
                <div className="flex flex-col md:flex-row gap-5 md:gap-10 md:justify-between">
                    <div className="w-full md:w-1/2 mx-auto flex flex-col gap-3">
                        <Image
                            src={cards?.image ?? '/cards/waec_result.jpeg'}
                            width={300}
                            height={200}
                            alt="waec card"
                            className="w-full" />
                        <div className="text-2xl font-semibold md:text-2xl text-gray-700">
                            <Badge variant="secondary" className="text-success bg-success/10 border-success/20">
                                In Stock
                            </Badge> <span>Price: {cards?.price} </span></div>
                    </div>
                    <div className="md:w-[60%] flex flex-col gap-3">
                        <h1 className="text-xl font-semibold md:text-3xl text-gray-700">Buy {handleTitleSelect(cards?.title)} Scratch Card Online - Buy WAEC Result Checker Online</h1>
                        <div>
                            <p><span className="font-bold">Product Description e-Pin:</span> {handleTitleSelect(cards?.title)} Result Checker</p>
                            <p><span className="font-bold">Format:</span> {handleTitleSelect(cards?.title)} e-Pin & Serial No</p>
                            <p><span className="font-bold">Card Delivery:</span> Instant {handleTitleSelect(cards?.title)} Pin Delivery</p>
                            <div>
                                <span className="font-bold">How to Use</span>
                                <ol>
                                    {
                                        cards?.howToUse.map((details, index) => (
                                            <li key={index} className="list-decimal list-inside">{details}</li>
                                        ))
                                    }
                                </ol>
                            </div>
                        </div>
                        <div>
                            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 grid-cols-1 gap-2">
                                <div>
                                    <label htmlFor="firstname" className="font-medium">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        id="firstname"
                                        name="firstname"
                                        onChange={handleChange}
                                        value={form.firstname}
                                        className="w-full border border-gray-300 rounded-md p-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="lastname" className="font-medium">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        id="lastname"
                                        name="lastname"
                                        onChange={handleChange}
                                        value={form.lastname}
                                        className="w-full border border-gray-300 rounded-md p-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="font-medium">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        onChange={handleChange}
                                        value={form.email}
                                        className="w-full border border-gray-300 rounded-md p-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="font-medium">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        onChange={handleChange}
                                        value={form.phone}
                                        className="w-full border border-gray-300 rounded-md p-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="quantity" className="font-medium">
                                        Quantity
                                    </label>
                                    <input
                                        type="number"
                                        id="quantity"
                                        name="quantity"
                                        min={1}
                                        onChange={handleChange}
                                        value={form.quantity}
                                        className="w-full border border-gray-300 rounded-md p-2"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="md:col-span-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                                >
                                    Buy Now
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
                <Link
                    href="/"
                    className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-4 py-2 rounded-md transition"
                >
                    ← Back to Home
                </Link>
            </div>) : (
                <ConfirmationPage data={userData} />
            )}

        </div>

    )
}
