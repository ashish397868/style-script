import Container from "../Container";

const ContactUs = () => (
  <Container>
    <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
    <p className="mb-4">We'd love to hear from you! Please reach out with any questions, feedback, or support needs.</p>
    <ul className="mb-4">
      <li><strong>Email:</strong> support@stylescript.com</li>
      <li><strong>Phone:</strong> +91-1234567890</li>
      <li><strong>Address:</strong> Nehru Park, Connaught Place, Delhi, India</li>
    </ul>
    <p>Or use our contact form and we’ll get back to you as soon as possible.</p>
  </Container>
);

export default ContactUs;