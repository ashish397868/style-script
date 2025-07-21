import * as Yup from "yup";

export const validationSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  slug: Yup.string()
    .required("Slug is required")
    .matches(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  description: Yup.string().required("Description is required"),
  price: Yup.number().required("Price is required").positive("Price must be positive"),
  images: Yup.array().of(Yup.string().url("Image must be a valid URL")).min(1, "At least one image is required"),
  category: Yup.string().required("Category is required"),
  brand: Yup.string(),
  size: Yup.string(),
  color: Yup.string(),
  tags: Yup.array().of(Yup.string()),
  availableQty: Yup.number().required("Quantity is required").integer("Quantity must be an integer").min(0, "Quantity must be at least 0"),
  isFeatured: Yup.boolean(),
});

export const initialValues = {
  title: "",
  slug: "",
  description: "",
  price: "",
  images: [],
  category: "",
  brand: "",
  size: "",
  color: "",
  tags: [],
  availableQty: "",
  isFeatured: false,
  theme:""
};
