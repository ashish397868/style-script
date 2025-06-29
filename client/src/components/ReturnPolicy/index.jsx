import React from "react";

const ReturnPolicy = () => (
  <section className="container mx-auto px-4 py-12 max-w-3xl">
    <h1 className="text-3xl font-bold mb-6">Return Policy</h1>
    <p className="mb-4">We want you to be completely satisfied with your purchase. If you are not happy with your order, you can return most items within 30 days of delivery.</p>
    <ul className="list-disc pl-6 mb-4">
      <li>Items must be unused, unwashed, and in original packaging.</li>
      <li>Proof of purchase is required for all returns.</li>
      <li>Some items (like innerwear) may not be eligible for return due to hygiene reasons.</li>
    </ul>
    <p className="mb-4">To initiate a return, please contact our support team at support@stylescript.com.</p>
    <p>Refunds will be processed within 7 business days after we receive your returned item.</p>
  </section>
);

export default ReturnPolicy;
