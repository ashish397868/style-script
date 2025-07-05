import Container from "../Container";

const ShippingPolicy = () => (
  <Container>
    <h1 className="text-3xl font-bold mb-6">Shipping Policy</h1>
    <p className="mb-4">We offer fast and reliable shipping across India. Orders are typically processed within 1-2 business days.</p>
    <ul className="list-disc pl-6 mb-4">
      <li>Free shipping on orders over ₹999.</li>
      <li>Standard delivery time is 3-7 business days depending on your location.</li>
      <li>Tracking information will be provided once your order is shipped.</li>
    </ul>
    <p>If you have any questions about shipping, please contact us at support@stylescript.com.</p>
  </Container>
);

export default ShippingPolicy;