import Container from "../../components/Container";

const PrivacyPolicy = () => (
  <Container>
    <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
    <p className="mb-4">Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information when you use our website and services.</p>
    <h2 className="text-xl font-semibold mt-6 mb-2">Information We Collect</h2>
    <ul className="list-disc pl-6 mb-4">
      <li>Personal information you provide (such as name, email, address, etc.)</li>
      <li>Order and payment information</li>
      <li>Usage data and cookies</li>
    </ul>
    <h2 className="text-xl font-semibold mt-6 mb-2">How We Use Your Information</h2>
    <ul className="list-disc pl-6 mb-4">
      <li>To process orders and provide services</li>
      <li>To improve our website and customer experience</li>
      <li>To send updates, offers, and marketing communications (you can opt out anytime)</li>
    </ul>
    <h2 className="text-xl font-semibold mt-6 mb-2">Data Security</h2>
    <p className="mb-4">We implement industry-standard security measures to protect your data. However, no method of transmission over the Internet is 100% secure.</p>
    <h2 className="text-xl font-semibold mt-6 mb-2">Contact Us</h2>
    <p>If you have any questions about this Privacy Policy, please contact us at support@example.com.</p>
  </Container>
);

export default PrivacyPolicy;