import { Link } from 'react-router-dom';

export const menuItems = [
  { label: 'Sweatshirts', href: '/products/sweatshirts', component: Link },
  { label: 'Hoodies', href: '/products/hoodies', component: Link },
  { label: 'Zipper Hoodies', href: '/products/zipper-hoodies', component: Link },
];

export const productItems = [
  { label: 'T-Shirts', href: '/products/tshirts', component: Link },
  { label: 'Polo TShirts', href: '/products/polotshirts', component: Link },
  { label: 'Oversized Tshirts', href: '/products/oversizedtshirts', component: Link },
];

export const adminItems = [
  { label: 'Dashboard', href: '/admin', component: Link },
  { label: 'Products', href: '/admin/products', component: Link },
  { label: 'Orders', href: '/admin/orders', component: Link },
  { label: 'Users', href: '/admin/users', component: Link },
];
