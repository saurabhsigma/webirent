'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiCheckCircle, FiArrowRight, FiDownload, FiMail } from 'react-icons/fi';
import { motion } from 'framer-motion';

// Type declaration for html2pdf.js
declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number;
    filename?: string;
    image?: { type: string; quality: number };
    html2canvas?: {
      scale?: number;
      logging?: boolean;
      useCORS?: boolean;
      scrollX?: number;
      scrollY?: number;
      [key: string]: any;
    };
    jsPDF?: {
      unit?: 'mm' | 'cm' | 'in' | 'pt' | 'pc' | 'px';
      format?: string | number[];
      orientation?: 'portrait' | 'landscape';
      [key: string]: any;
    };
  }

  interface Html2Pdf {
    set: (options: Html2PdfOptions) => Html2Pdf;
    from: (element: HTMLElement) => Html2Pdf;
    save: () => Promise<void>;
  }

  const html2pdf: Html2Pdf;
  export default html2pdf;
}

type OrderDetails = {
  orderNumber: string;
  template: {
    id: string;
    name: string;
    price: number;
  };
  customerDetails: {
    businessName: string;
    contactEmail: string;
    contactPhone: string;
    requirements: string;
  };
  date: string;
  paymentId?: string;
  orderId?: string;
  signature?: string;
};

export default function OrderConfirmation() {
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const storedDetails = localStorage.getItem('orderDetails');
    if (storedDetails) {
      setOrderDetails(JSON.parse(storedDetails));
    } else {
      router.push('/templates');
    }
  }, [router]);

  const handleDownloadReceipt = async () => {
    if (!receiptRef.current || !orderDetails || isGeneratingPDF) return;

    setIsGeneratingPDF(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      
      const opt = {
        margin: 10,
        filename: `Webirent_Receipt_${orderDetails.orderNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          logging: true,
          useCORS: true,
          scrollX: 0,
          scrollY: 0,
          letterRendering: true,
          allowTaint: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        }
      };

      await html2pdf()
        .set(opt)
        .from(receiptRef.current)
        .save();
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      // You could add a toast notification here
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  
  if (!orderDetails) {
    return (
      <div className="min-h-screen pt-20 pb-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  const formattedDate = new Date(orderDetails.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Hidden PDF Template */}
      <div className="absolute -left-[9999px]">
        <div ref={receiptRef} className="p-8 bg-white text-black w-[210mm] min-h-[297mm]">
          <style jsx>{`
            @media print {
              body, html {
                margin: 0 !important;
                padding: 0 !important;
              }
              .receipt-container {
                width: 210mm;
                height: 297mm;
                margin: 0;
                padding: 0;
              }
            }
          `}</style>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold">Webirent</h2>
              <p className="text-gray-600">Custom Website Templates</p>
            </div>
            <div className="text-right">
              <h3 className="text-lg font-semibold">Payment Receipt</h3>
              <p className="text-gray-600">{formattedDate}</p>
            </div>
          </div>
          
          <div className="border-t border-gray-300 my-6 pt-6">
            <div className="flex justify-between mb-2">
              <span className="font-semibold">Order Number:</span>
              <span>{orderDetails.orderNumber}</span>
            </div>
            {orderDetails.paymentId && (
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Payment ID:</span>
                <span>{orderDetails.paymentId}</span>
              </div>
            )}
            <div className="flex justify-between mb-2">
              <span className="font-semibold">Business:</span>
              <span>{orderDetails.customerDetails.businessName}</span>
            </div>
          </div>

          <div className="border-t border-gray-300 my-6 pt-6">
            <h3 className="text-lg font-semibold mb-4">Order Details</h3>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-medium">{orderDetails.template.name}</h4>
                <p className="text-sm text-gray-600">Includes customization</p>
              </div>
              <span>₹{orderDetails.template.price.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-300 my-4 pt-4">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>₹{orderDetails.template.price.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-300 my-6 pt-6">
            <h3 className="text-lg font-semibold mb-2">Customer Requirements</h3>
            <p className="text-gray-700 whitespace-pre-line">
              {orderDetails.customerDetails.requirements}
            </p>
          </div>

          <div className="border-t border-gray-300 my-6 pt-6 text-center text-sm text-gray-600">
            <p>Thank you for your purchase!</p>
            <p>Contact: support@webirent.com</p>
          </div>
        </div>
      </div>

      {/* Visible UI */}
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 text-green-500 mb-6">
              <FiCheckCircle size={40} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Order Confirmed!</h1>
            <p className="text-xl text-gray-300">
              Thank you for your order. We'll begin working on it immediately.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card p-8 mb-8"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold gradient-text">Webirent</h2>
                <p className="text-gray-400">Custom Website Templates</p>
              </div>
              <div className="text-right">
                <h3 className="text-lg font-semibold">Order Confirmation</h3>
                <p className="text-gray-400">{formattedDate}</p>
              </div>
            </div>
            
            <div className="border-t border-gray-700 my-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400">Order Number</p>
                  <p className="font-medium">{orderDetails.orderNumber}</p>
                </div>
                <div>
                  <p className="text-gray-400">Business</p>
                  <p className="font-medium">{orderDetails.customerDetails.businessName}</p>
                </div>
                {orderDetails.paymentId && (
                  <>
                    <div>
                      <p className="text-gray-400">Payment ID</p>
                      <p className="font-medium">{orderDetails.paymentId}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Amount Paid</p>
                      <p className="font-medium">₹{orderDetails.template.price.toFixed(2)}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="border-t border-gray-700 my-6 pt-6">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="font-medium">{orderDetails.template.name}</h4>
                  <p className="text-sm text-gray-400">Template + Customization</p>
                </div>
                <span>₹{orderDetails.template.price.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-700 my-4 pt-4">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>₹{orderDetails.template.price.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700 my-6 pt-6">
              <h3 className="text-lg font-semibold mb-2">Your Requirements</h3>
              <p className="text-gray-300 whitespace-pre-line">
                {orderDetails.customerDetails.requirements}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <button
              onClick={handleDownloadReceipt}
              disabled={isGeneratingPDF}
              className="btn-secondary flex items-center justify-center"
            >
              {isGeneratingPDF ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                <>
                  <FiDownload className="mr-2" /> Download Receipt
                </>
              )}
            </button>
            <Link href="/dashboard" className="btn-primary flex items-center justify-center">
              Go to Dashboard <FiArrowRight className="ml-2" />
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-center text-gray-400"
          >
            Need help? Contact us at{' '}
            <a href="mailto:support@webirent.com" className="text-purple-400 hover:text-purple-300">
              <FiMail className="inline mr-1" /> support@webirent.com
            </a>
          </motion.p>
        </div>
      </div>
    </div>
  );
}