import { Link } from 'react-router-dom';

export const menuItems = [
  { label: 'Sweatshirts', href: '/category/sweatshirts', component: Link },
  { label: 'Hoodies', href: '/category/hoodies', component: Link },
  { label: 'Zipper Hoodies', href: '/category/zipper-hoodies', component: Link },
];

export const tshirtItems = [
  { label: 'T-Shirts', href: '/category/tshirts', component: Link },
  { label: 'Polo TShirts', href: '/category/polotshirts', component: Link },
  { label: 'Oversized Tshirts', href: '/category/oversizedtshirts', component: Link },
];

export const shopLinks = [
  { label: "Sweatshirts", path: "/category/sweatshirts" },
  { label: "Hoodies", path: "/category/hoodies" },
  { label: "Zipper Hoodies", path: "/category/zipperhoodies" },
];