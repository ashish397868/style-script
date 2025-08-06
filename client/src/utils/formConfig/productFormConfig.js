// formConfig/productFormConfig.js
import * as Yup from "yup";

// Helper function to generate SKU
export function generateSKU(title, size, color) {
  return `${title.slice(0, 3).toUpperCase()}-${size.toUpperCase()}-${color.toUpperCase()}`;
}

export const validationSchema = Yup.object({
  title: Yup.string().required("Title is required").trim(),
  slug: Yup.string()
    .required("Slug is required")
    .matches(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only")
    .trim(),
  description: Yup.string().required("Description is required").trim(),
  images: Yup.array()
    .of(Yup.string().url("Image must be a valid URL")),
  category: Yup.string().required("Category is required").trim(),
  brand: Yup.string().required("Brand is required").trim(),
  theme: Yup.string().trim(),
  tags: Yup.array().of(Yup.string().trim()),
  isFeatured: Yup.boolean(),
  isPublished: Yup.boolean(),
  
  // Variants array validation
  variants: Yup.array()
    .of(
      Yup.object().shape({
        size: Yup.string()
          .required("Size is required")
          .uppercase()
          .trim(),
        color: Yup.string()
          .required("Color is required")
          .uppercase()
          .trim(),
        price: Yup.number()
          .required("Price is required")
          .positive("Price must be positive"),
        availableQty: Yup.number()
          .required("Quantity is required")
          .integer("Quantity must be an integer")
          .min(0, "Quantity must be at least 0"),
        sku: Yup.string()
          .required("SKU is required")
          .trim(),
        images: Yup.array()
          .of(Yup.string().url("Image must be a valid URL"))
      })
    )
    .min(1, "At least one variant is required")
    // Validate unique size+color combinations
    .test(
      "unique-variants",
      "Duplicate variant (size+color combination)",
      function (variants) {
        const seen = new Set();
        for (const variant of variants) {
          const key = `${variant.size}-${variant.color}`.toUpperCase();
          if (seen.has(key)) return false;
          seen.add(key);
        }
        return true;
      }
    )
});

export const initialValues = {
  title: "",
  slug: "",
  description: "",
  images: [],
  category: "",
  brand: "",
  theme: "",
  tags: [],
  isFeatured: false,
  isPublished: false,
  variants: [
    {
      size: "",
      color: "",
      price: "",
      availableQty: "",
      sku: "",
      images: []
    }
  ]
};