import { api } from "../api";
import { cleanParams, toMultipartBody } from "../http";

export type ProductSize = "S" | "M" | "L";

export interface ProductSizeInput {
  name: ProductSize;
  additionalPrice: number;
}

export interface ProductExtraInput {
  name: string;
  additionalPrice: number;
}

export interface ProductFields {
  productName: string;
  categoryId: string;
  description?: string;
  image?: string;
  originalPrice: number;
  discountPrice?: number;
  costPrice?: number;
  sizes?: ProductSizeInput[];
  extras?: ProductExtraInput[];
  status?: boolean;
  taxPercentage?: number;
  point?: number;
  /** Legacy list filter field. Current products use `sizes`. */
  size?: ProductSize;
}

export interface ProductWriteFields {
  productName: string;
  categoryId: string;
  originalPrice: number;
  status: boolean;
  sizes: ProductSizeInput[];
  extras: ProductExtraInput[];
  description?: string;
  discountPrice?: number;
  costPrice?: number;
  taxPercentage?: number;
  point?: number;
}

export interface CreateProductArgs extends ProductWriteFields {
  imageFile: File;
}

export interface UpdateProductArgs extends ProductWriteFields {
  productId: string;
  imageFile?: File | null;
}

export interface ProductCategoryRef {
  _id: string;
  name?: string;
  isActive?: boolean;
}

export interface ProductRecord extends Omit<ProductFields, "categoryId"> {
  _id: string;
  categoryId: string | ProductCategoryRef;
  shopId?: string | { _id: string; name?: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductListArgs {
  page?: number;
  limit?: number;
  searchTerm?: string;
  size?: ProductSize;
  shopId?: string;
}

export interface ProductListPagination {
  total?: number;
  limit?: number;
  page?: number;
  totalPage?: number;
}

export interface ProductListResponse {
  success?: boolean;
  message?: string;
  pagination?: ProductListPagination;
  data?: ProductRecord[];
}

export interface ProductDetailResponse {
  success?: boolean;
  message?: string;
  data?: ProductRecord;
}

export interface ProductMessageResponse {
  success?: boolean;
  message?: string;
}

const productApi = api.injectEndpoints({
  endpoints: (build) => ({
    createProduct: build.mutation<ProductMessageResponse, CreateProductArgs>({
      query: ({ imageFile, ...productFields }) => ({
        url: "/product",
        method: "POST",
        body: toMultipartBody(productFields, imageFile, "image"),
      }),
      invalidatesTags: ["Product"],
    }),
    getAllProducts: build.query<ProductListResponse, ProductListArgs | void>({
      query: (listArgs) => ({
        url: "/product",
        method: "GET",
        params: cleanParams(listArgs ?? undefined),
      }),
      providesTags: ["Product"],
    }),
    getProductById: build.query<ProductDetailResponse, string>({
      query: (productId) => ({
        url: `/product/${productId}`,
        method: "GET",
      }),
      providesTags: ["Product"],
    }),
    updateProduct: build.mutation<ProductMessageResponse, UpdateProductArgs>({
      query: ({ productId, imageFile, ...productFields }) => ({
        url: `/product/${productId}`,
        method: "PATCH",
        body: toMultipartBody(productFields, imageFile, "image"),
      }),
      invalidatesTags: ["Product"],
    }),
    deleteProduct: build.mutation<ProductMessageResponse, string>({
      query: (productId) => ({
        url: `/product/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});

export const {
  useCreateProductMutation,
  useGetAllProductsQuery,
  useGetProductByIdQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
