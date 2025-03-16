import { adminRtdb, rtdbHelpers } from '@/utils/firebase-admin';
import admin from 'firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    console.log('Importing fabric products into Firebase Realtime Database...');
    
    // Fabric products data
    const fabricProducts = [
      {
        "id": 1,
        "name": "Premium Banarasi Silk",
        "price": 100,
        "originalPrice": 2499.99,
        "image": "https://fabricdekho.com/cdn/shop/products/O-01384.jpg?v=1661358613",
        "category": "Silk",
        "subcategory": "Banarasi",
        "rating": 4.8,
        "isNew": true,
        "description": "Luxurious silk fabric for premium garments and accessories",
        "tags": [
          "silk",
          "premium",
          "luxury",
          "fabric",
          "soft",
          "smooth"
        ]
      },
      {
        "id": 2,
        "name": "Organic Khadi Cotton",
        "price": 100,
        "originalPrice": 1799.99,
        "image": "https://thesustainableangle.org/wp-content/uploads/2020/07/P1160502-2.jpg",
        "category": "Cotton",
        "subcategory": "Khadi",
        "rating": 4.6,
        "description": "Breathable cotton blend perfect for casual wear and everyday clothing",
        "tags": [
          "cotton",
          "blend",
          "breathable",
          "casual",
          "everyday",
          "material"
        ]
      },
      {
        "id": 3,
        "name": "Chanderi Fabric",
        "price": 100,
        "originalPrice": 2999.99,
        "image": "https://ffab.com/cdn/shop/files/20926-170-404.jpg?v=1701854943&width=2000",
        "category": "Traditional",
        "subcategory": "Chanderi",
        "rating": 4.7,
        "isSale": true,
        "description": "Lightweight Chanderi fabric with gold and silver zari work",
        "tags": [
          "chanderi",
          "lightweight",
          "zari",
          "traditional",
          "indian",
          "ethnic"
        ]
      },
      {
        "id": 4,
        "name": "Pure Linen Collection",
        "price": 100,
        "originalPrice": 2799.99,
        "image": "https://images.unsplash.com/photo-1528459105426-b9548367069b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        "category": "Linen",
        "subcategory": "Pure Linen",
        "rating": 4.5,
        "isNew": true,
        "description": "Natural linen fabric ideal for summer clothing and home textiles",
        "tags": [
          "linen",
          "natural",
          "summer",
          "breathable",
          "collection",
          "eco-friendly"
        ]
      },
      {
        "id": 5,
        "name": "Georgette Material",
        "price": 100,
        "originalPrice": 1599.99,
        "image": "https://image.made-in-china.com/2f0j00lirbsgpcOEku/100d-Chiffon-Plain-Georgette-Fabric-Woven-Polyester-Tulle-Dress-Garment-Lining-Fabric.jpg",
        "category": "Georgette",
        "subcategory": "Georgette",
        "rating": 4.3,
        "description": "Lightweight and flowy georgette fabric for elegant dresses and sarees",
        "tags": [
          "georgette",
          "lightweight",
          "flowy",
          "elegant",
          "dress",
          "saree",
          "material"
        ]
      },
      {
        "id": 6,
        "name": "Chiffon Fabric",
        "price": 100,
        "originalPrice": 1499.99,
        "image": "https://www.tradeuno.com/cdn/shop/products/image_ee004f8f-f8ac-453c-a510-a8ac9f06e6d3.jpg?v=1678528197&width=1946",
        "category": "Chiffon",
        "subcategory": "Chiffon",
        "rating": 4.4,
        "isSale": true,
        "description": "Lightweight and sheer chiffon fabric for elegant dresses and scarves",
        "tags": [
          "chiffon",
          "lightweight",
          "sheer",
          "elegant",
          "dress",
          "material"
        ]
      },
      {
        "id": 7,
        "name": "Brocade Fabric hi working",
        "price": 100,
        "originalPrice": 2999.99,
        "image": "https://fabricfactory.in/cdn/shop/files/7ea55c9e-de67-4843-a443-fa1dcb79bdc5.jpg?v=1695723447",
        "category": "Traditional",
        "subcategory": "Brocade",
        "rating": 4.9,
        "description": "Rich brocade fabric with raised metallic patterns for festive wear",
        "tags": [
          "brocade",
          "rich",
          "metallic",
          "pattern",
          "festive",
          "fabric",
          "indian"
        ]
      },
      {
        "id": 8,
        "name": "Designer Jacquard Fabric",
        "price": 100,
        "originalPrice": 2999.99,
        "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyX1Q1zP4cpRq9P33p-DZ-HCPyW8CGz0xt3w&s",
        "category": "Jacquard",
        "subcategory": "Designer",
        "rating": 4.8,
        "isNew": true,
        "description": "Textured jacquard fabric with intricate woven patterns",
        "tags": [
          "jacquard",
          "textured",
          "pattern",
          "woven",
          "intricate",
          "fabric"
        ]
      },
      {
        "id": 9,
        "name": "Velvet Fabric",
        "price": 100,
        "originalPrice": 2499.99,
        "image": "https://i.etsystatic.com/5286882/r/il/3cb9b6/1589587649/il_fullxfull.1589587649_96xx.jpg",
        "category": "Velvet",
        "subcategory": "Velvet",
        "rating": 4.7,
        "description": "Luxurious velvet fabric for premium upholstery and fashion",
        "tags": [
          "velvet",
          "luxurious",
          "premium",
          "soft",
          "upholstery",
          "fashion"
        ]
      },
      {
        "id": 10,
        "name": "Rayon Fabric",
        "price": 100,
        "originalPrice": 1299.99,
        "image": "https://images.unsplash.com/photo-1528459105426-b9548367069b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        "category": "Rayon",
        "subcategory": "Rayon",
        "rating": 4.2,
        "description": "Soft and flowy rayon fabric for comfortable everyday wear",
        "tags": [
          "rayon",
          "soft",
          "flowy",
          "comfortable",
          "everyday",
          "fabric"
        ]
      },
      {
        "id": 11,
        "name": "javascript",
        "price": 100,
        "originalPrice": 3423,
        "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiBpP3cQnJNnN9anuEvtJ4t1t6d5xQl9UNgQ&s",
        "category": "electronic",
        "subcategory": "smartphone",
        "rating": 5,
        "isNew": true,
        "isSale": false,
        "description": "nothing just testing",
        "tags": [
          "bestseller"
        ]
      },
      {
        "id": 12,
        "name": "javascript",
        "price": 1000,
        "originalPrice": 232323,
        "image": "https://www.infoworld.com/wp-content/uploads/2024/06/shutterstock_1361674454-100939444-orig.jpg?quality=50&strip=all",
        "category": "electronic",
        "subcategory": "smartphone",
        "rating": 5,
        "isNew": true,
        "isSale": true,
        "description": "testing ",
        "tags": [
          "bestseller"
        ]
      },
      {
        "id": 13,
        "name": "javascript",
        "price": 199,
        "originalPrice": 800000,
        "image": "https://www.infoworld.com/wp-content/uploads/2024/06/shutterstock_1361674454-100939444-orig.jpg?quality=50&strip=all",
        "category": "electronic",
        "subcategory": "smartphone",
        "rating": 5,
        "isNew": false,
        "isSale": false,
        "description": "oiuoiu",
        "tags": [
          "bestseller"
        ]
      },
      {
        "id": 14,
        "name": "javascript",
        "price": 100,
        "originalPrice": 10000,
        "image": "https://www.infoworld.com/wp-content/uploads/2024/06/shutterstock_1361674454-100939444-orig.jpg?quality=50&strip=all",
        "category": "Electronic",
        "subcategory": "Smartphone",
        "rating": 5,
        "isNew": false,
        "isSale": false,
        "description": "testing",
        "tags": [
          "Bestseller"
        ]
      },
      {
        "id": 15,
        "name": "javascript",
        "price": 100,
        "originalPrice": 10000,
        "image": "https://www.infoworld.com/wp-content/uploads/2024/06/shutterstock_1361674454-100939444-orig.jpg?quality=50&strip=all",
        "category": "Electronic",
        "subcategory": "Smartphone",
        "rating": 5,
        "isNew": true,
        "isSale": true,
        "description": "testing 1",
        "tags": [
          "Bestseller"
        ]
      }
    ];
    
    // Clear existing products first
    await adminRtdb.ref('products').remove();
    console.log('Cleared existing products');
    
    // Add new fabric products
    const productResults = [];
    for (const product of fabricProducts) {
      // Use the product's ID as the key in Firebase
      await adminRtdb.ref(`products/${product.id}`).set({
        ...product,
        updatedAt: admin.database.ServerValue.TIMESTAMP,
        createdAt: admin.database.ServerValue.TIMESTAMP
      });
      
      productResults.push(product);
      console.log(`Created product with ID: ${product.id}`);
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Fabric products imported successfully into Firebase Realtime Database',
      count: productResults.length
    });
  } catch (error) {
    console.error('Error importing fabric products:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to import fabric products',
      error: error.message
    });
  }
} 