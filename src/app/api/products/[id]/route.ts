import { NextResponse } from 'next/server';
import { adminRtdb } from '@/utils/firebase-admin';
import { deleteProduct } from '@/models/product';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    // Reference to the specific product in the database using admin SDK
    const productRef = adminRtdb.ref(`products/${id}`);
    const snapshot = await productRef.once('value');
    
    if (!snapshot.exists()) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    const product = snapshot.val();
    
    return NextResponse.json({ 
      success: true, 
      data: product 
    });
  } catch (error: any) {
    console.error(`Error fetching product with ID ${params.id}:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch product'
      },
      { status: 500 }
    );
  }
}

// Make sure the DELETE method is properly exported and follows Next.js App Router conventions
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log(`[API] DELETE product request received for ID: ${params.id}`);
  
  try {
    const id = params.id;
    
    console.log(`[API] DELETE product request for ID: ${id}`);
    
    if (!id) {
      console.log(`[API] DELETE product - ID is missing`);
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    // First check if the product exists
    const productRef = adminRtdb.ref(`products/${id}`);
    console.log(`[API] DELETE product - checking if product ${id} exists`);
    const snapshot = await productRef.once('value');
    
    if (!snapshot.exists()) {
      console.log(`[API] DELETE product - product ${id} not found`);
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    console.log(`[API] DELETE product - product ${id} found, attempting to delete`);
    
    // Use direct Firebase admin deletion instead of model function to simplify
    try {
      await adminRtdb.ref(`products/${id}`).remove();
      console.log(`[API] DELETE product - product ${id} deleted successfully`);
    } catch (deleteError: any) {
      console.error(`[API] DELETE product - Error during deletion:`, deleteError);
      throw deleteError;
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Product deleted successfully' 
    });
  } catch (error: any) {
    console.error(`[API] Error deleting product with ID ${params.id}:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to delete product'
      },
      { status: 500 }
    );
  }
} 