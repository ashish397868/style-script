import React from "react";

const TermsAndConditions = () => (
  <section className="container mx-auto px-4 py-12 max-w-3xl">
    <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
    <p className="mb-4">By using our website and services, you agree to the following terms and conditions. Please read them carefully.</p>
    <h2 className="text-xl font-semibold mt-6 mb-2">Use of Service</h2>
    <ul className="list-disc pl-6 mb-4">
      <li>You must be at least 18 years old or have parental consent to use our services.</li>
      <li>Do not misuse our services or attempt to disrupt our website.</li>
    </ul>
    <h2 className="text-xl font-semibold mt-6 mb-2">Orders and Payments</h2>
    <ul className="list-disc pl-6 mb-4">
      <li>All orders are subject to acceptance and availability.</li>
      <li>Prices and product details may change without notice.</li>
    </ul>
    <h2 className="text-xl font-semibold mt-6 mb-2">Intellectual Property</h2>
    <p className="mb-4">All content on this website is the property of the company and may not be used without permission.</p>
    <h2 className="text-xl font-semibold mt-6 mb-2">Contact Us</h2>
    <p>If you have any questions about these Terms and Conditions, please contact us at support@example.com.</p>
  </section>
);

export default TermsAndConditions;
