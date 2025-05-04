"use client";

import React, { useState } from "react";
import Script from "next/script";
import { toast } from "react-hot-toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentPage = () => {
  const AMOUNT = 100;
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/create-order", { method: "POST" });
      if (!response.ok) {
        throw new Error("Failed to create order");
      }
      
      const data = await response.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: AMOUNT * 100,
        currency: "INR",
        name: "Webirent",
        description: "Test Transaction",
        order_id: data.orderId,
        handler: function(response: any) {
          toast.success("Payment Successful!");
          console.log(response);
        },
        prefill: {
          name: "John Doe",
          email: "john@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();

      rzp1.on('payment.failed', function(response: any) {
        toast.error(`Payment failed: ${response.error.description}`);
      });
    } catch (error) {
      console.error("Payment failed:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Payment Page</h1>
        <p className="mb-4">Amount to pay: ₹{AMOUNT}</p>
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className="btn-primary"
        >
          {isProcessing ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;