import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Template from '@/models/Template';

// GET endpoint to fetch orders
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: 'Unauthorized - Please log in' },
      { status: 401 }
    );
  }

  try {
    await connectDB();
    
    const orders = await Order.find({ user: session.user.id })
      .populate('template')
      .sort({ createdAt: -1 });

    return NextResponse.json({ orders });
    
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { message: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST endpoint to create orders
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: 'Unauthorized - Please log in' },
      { status: 401 }
    );
  }

  try {
    const { templateId, customerDetails, paymentId } = await request.json();

    if (!templateId || !customerDetails) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    const template = await Template.findById(templateId);
    if (!template) {
      return NextResponse.json(
        { message: 'Template not found' },
        { status: 404 }
      );
    }

    // Generate order number
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const orderNumber = `WR-${year}${month}${day}-${random}`;

    const order = new Order({
      orderNumber,
      user: session.user.id,
      userEmail: session.user.email,
      template: templateId,
      customerDetails,
      totalPrice: template.price,
      status: 'completed',
      paymentId,
    });

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('template')
      .populate('user');

    try {
      const emailResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/send-emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderNumber: order.orderNumber,
          businessName: customerDetails.businessName,
          customerEmail: session.user.email,
          customerName: session.user.name || 'Customer',
          templateName: template.name,
          amount: template.price,
          requirements: customerDetails.requirements
        })
      });

      if (!emailResponse.ok) {
        console.error('Email sending failed:', await emailResponse.json());
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
    }

    return NextResponse.json(
      {
        message: 'Order created successfully',
        order: populatedOrder,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { message: 'Failed to create order' },
      { status: 500 }
    );
  }
}