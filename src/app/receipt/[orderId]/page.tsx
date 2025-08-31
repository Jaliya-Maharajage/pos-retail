// "use client";

// //import { prisma } from "@/lib/prisma"; 
// //import Receipt80mm from "@/components/receipt/Receipt80mm";

// export default async function ReceiptPage({ params }: { params: { orderId: string } }) {
//   // Await params before using
//   const { orderId } = params;
//   const order = await prisma.order.findUnique({
//     where: { id: orderId },
//     include: { items: { include: { product: true } }, customer: true },
//   });

//   if (!order) {
//     return <div>Order not found.</div>;
//   }

//   return (
//     <div className="p-4">
//       <h1>Receipt for Order {order.id}</h1>
//       {/* Render order details here */}
//       <div>Customer: {order.customer?.fullName}</div>
//       <div>Total Amount: {order.totalAmount}</div>
//       {/* List items */}
//       <ul>
//         {order.items.map((item) => (
//           <li key={item.id}>
//             {item.product.name} - {item.quantity} x {item.price}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }