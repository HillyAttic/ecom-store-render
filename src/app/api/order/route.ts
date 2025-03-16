import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { formatCurrency } from '@/utils/currency';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { orderService } from '@/services/orderService';

// Create a transporter once instead of on every request
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'fashionforeverdashboard@gmail.com',
    pass: 'izgd ympq flku ovea'
  }
});

// Validate the request body
const validateOrderData = (data: any) => {
  const { billingInfo, cartItems, shippingMethod, paymentMethod, total } = data;
  
  if (!billingInfo || !cartItems || !shippingMethod || !paymentMethod || total === undefined) {
    return false;
  }
  
  if (!billingInfo.firstName || !billingInfo.lastName || !billingInfo.email || !billingInfo.phone) {
    return false;
  }
  
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return false;
  }
  
  return true;
};

export async function POST(request: Request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to place an order.' },
        { status: 401 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    
    // Validate the request data
    if (!validateOrderData(body)) {
      return NextResponse.json(
        { error: 'Invalid order data. Please check your information and try again.' },
        { status: 400 }
      );
    }
    
    const { billingInfo, cartItems, shippingMethod, paymentMethod, total, subtotal, shippingCost, discountAmount } = body;

    // Format cart items for email
    const cartItemsList = cartItems.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">x${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${formatCurrency(item.price * item.quantity)}</td>
      </tr>
    `).join('');

    // Create formatted address for order
    const shippingAddress = {
      // Match both field naming formats for maximum compatibility
      fullName: `${billingInfo.firstName} ${billingInfo.lastName}`,
      firstName: billingInfo.firstName,
      lastName: billingInfo.lastName,
      street: billingInfo.streetAddress,
      streetAddress: billingInfo.streetAddress,
      addressLine1: billingInfo.streetAddress,
      addressLine2: billingInfo.apartment || '',
      apartment: billingInfo.apartment || '',
      city: billingInfo.city,
      state: billingInfo.state,
      zipCode: billingInfo.zipCode,
      postalCode: billingInfo.zipCode,
      country: billingInfo.country || 'US',
      phone: billingInfo.phone
    };

    // Prepare order data for the database
    const orderData = {
      userId: session.user.id, // Ensure this is a string
      items: cartItems.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || '/images/placeholder.png'
      })),
      shippingAddress,
      paymentMethod,
      shippingMethod,
      totalAmount: total,
      subtotal,
      shippingCost,
      discountAmount: discountAmount || 0,
      customerEmail: billingInfo.email,
      status: 'pending'
    };

    console.log(`API: Creating new order for user ${session.user.id}`);
    
    // Save the order to the database
    const createdOrder = await orderService.createOrder(orderData);
    console.log(`API: Order created successfully with ID ${createdOrder.id}`);

    // Email content
    const mailOptions = {
      from: '"Fashion Forever Orders" <fashionforeverdashboard@gmail.com>',
      to: 'fashionforeverdashboard@gmail.com',
      subject: `New Order from ${billingInfo.firstName} ${billingInfo.lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a365d; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">New Order Received - Fashion Forever</h1>
          
          <h2 style="color: #2d3748;">Customer Information</h2>
          <p><strong>Name:</strong> ${billingInfo.firstName} ${billingInfo.lastName}</p>
          <p><strong>Email:</strong> ${billingInfo.email}</p>
          <p><strong>Phone:</strong> ${billingInfo.phone}</p>
          
          <h2 style="color: #2d3748;">Shipping Address</h2>
          <p>${billingInfo.streetAddress}</p>
          ${billingInfo.apartment ? `<p>Apt/Suite: ${billingInfo.apartment}</p>` : ''}
          <p>${billingInfo.city}, ${billingInfo.state} ${billingInfo.zipCode}</p>
          
          <h2 style="color: #2d3748;">Order Details</h2>
          <p><strong>Order ID:</strong> ${createdOrder.id}</p>
          <p><strong>Payment Method:</strong> ${paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit Card'}</p>
          <p><strong>Shipping Method:</strong> ${shippingMethod === 'express' ? 'Express Shipping' : 'Standard Shipping'}</p>
          
          <h2 style="color: #2d3748;">Order Summary</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f7fafc;">
                <th style="padding: 10px; text-align: left;">Product</th>
                <th style="padding: 10px; text-align: left;">Quantity</th>
                <th style="padding: 10px; text-align: left;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${cartItemsList}
            </tbody>
          </table>
          
          <div style="margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 10px;">
            <p><strong>Subtotal:</strong> ${formatCurrency(subtotal)}</p>
            <p><strong>Shipping:</strong> ${formatCurrency(shippingCost)}</p>
            ${discountAmount > 0 ? `<p><strong>Discount:</strong> -${formatCurrency(discountAmount)}</p>` : ''}
            <p style="font-size: 1.2em; color: #2d3748;"><strong>Total:</strong> ${formatCurrency(total)}</p>
          </div>
        </div>
      `,
      text: `
        New Order Received - Fashion Forever
        
        Customer Information:
        Name: ${billingInfo.firstName} ${billingInfo.lastName}
        Email: ${billingInfo.email}
        Phone: ${billingInfo.phone}
        
        Shipping Address:
        ${billingInfo.streetAddress}
        ${billingInfo.apartment ? `Apt/Suite: ${billingInfo.apartment}` : ''}
        ${billingInfo.city}, ${billingInfo.state} ${billingInfo.zipCode}
        
        Order Details:
        Order ID: ${createdOrder.id}
        Payment Method: ${paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit Card'}
        Shipping Method: ${shippingMethod === 'express' ? 'Express Shipping' : 'Standard Shipping'}
        
        Order Summary:
        ${cartItems.map(item => `${item.name} x${item.quantity} - ${formatCurrency(item.price * item.quantity)}`).join('\n')}
        
        Subtotal: ${formatCurrency(subtotal)}
        Shipping: ${formatCurrency(shippingCost)}
        ${discountAmount > 0 ? `Discount: -${formatCurrency(discountAmount)}` : ''}
        Total: ${formatCurrency(total)}
      `
    };

    // Send the email with retry logic
    let retries = 3;
    let emailSent = false;
    
    while (retries > 0 && !emailSent) {
      try {
        await transporter.sendMail(mailOptions);
        emailSent = true;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Order placed successfully!',
        data: {
          orderId: createdOrder.id
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Order submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process your order. Please try again later.' },
      { status: 500 }
    );
  }
} 