import { Link } from 'react-router-dom';

export const menuItems = [
  { label: 'Home', href: '/', component: Link },
  { label: 'About', href: '/about', component: Link },
  { label: 'Contact', href: '/contact', component: Link },
];

export const productItems = [
  { label: 'All Products', href: '/products', component: Link },
  { label: 'T-Shirts', href: '/products/t-shirts', component: Link },
  { label: 'Hoodies', href: '/products/hoodies', component: Link },
  { label: 'Pants', href: '/products/pants', component: Link },
  { label: 'Accessories', href: '/products/accessories', component: Link },
];

export const adminItems = [
  { label: 'Dashboard', href: '/admin', component: Link },
  { label: 'Products', href: '/admin/products', component: Link },
  { label: 'Orders', href: '/admin/orders', component: Link },
  { label: 'Users', href: '/admin/users', component: Link },
];
