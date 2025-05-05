import { AdminNotification } from '@/components/emails/AdminNotification';
import { CustomerConfirmation } from '@/components/emails/CustomerConfirmation';
import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { orderNumber, businessName, customerEmail, customerName, templateName, amount, requirements } = await request.json();

    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set');
    }

    // Validate required fields
    if (!orderNumber || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send to admin
    const adminResult = await resend.emails.send({
      from: 'Croo <onboarding@resend.dev>',
      to: [process.env.ADMIN_EMAIL || 'aryan16062004@gmail.com'],
      subject: `New Order: ${orderNumber}`,
      react: AdminNotification({ 
        orderNumber, 
        businessName, 
        customerEmail, 
        templateName, 
        amount, 
        requirements 
      }),
    });

    // Send to customer
    const customerResult = await resend.emails.send({
      from: 'Croo <support@resend.dev>',
      to: [customerEmail],
      subject: `Your Order #${orderNumber}`,
      react: CustomerConfirmation({
        firstName: customerName?.split(' ')[0] || 'Customer',
        orderNumber,
        templateName,
        amount
      }),
    });

    return NextResponse.json({ 
      success: true,
      adminResult,
      customerResult
    });

  } catch (error: any) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { 
        error: "Email sending failed",
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, 
      { status: 500 }
    );
  }
}