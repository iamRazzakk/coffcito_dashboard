import { api } from "../api";
import { readList, toMultipartBody } from "../http";

export interface CategoryRecord {
  _id: string;
  name: string;
  isActive?: boolean;
}

export interface CreateCategoryArgs {
  name: string;
  imageFile?: File | null;
}

export interface UpdateCategoryArgs extends CreateCategoryArgs {
  id: string;
}

export interface CategoryMessageResponse {
  success?: boolean;
  message?: string;
  data?: CategoryRecord;
}

function normalizeCategory(raw: unknown): CategoryRecord | null {
  if (!raw || typeof raw !== "object") return null;

  const row = raw as Record<string, unknown>;
  const id = String(row._id ?? row.id ?? "").trim();
  if (!id) return null;

  const name = String(row.name ?? row.categoryName ?? "").trim();
  return {
    _id: id,
    name: name || "Category",
    isActive: typeof row.isActive === "boolean" ? row.isActive : undefined,
  };
}

function readCategories(payload: unknown): CategoryRecord[] {
  return readList<unknown>(payload)
    .items.map(normalizeCategory)
    .filter((item): item is CategoryRecord => item !== null);
}

const categoryApi = api.injectEndpoints({
  endpoints: (build) => ({
    createCategory: build.mutation<CategoryMessageResponse, CreateCategoryArgs>({
      query: ({ name, imageFile }) => ({
        url: "/category",
        method: "POST",
        body: toMultipartBody({ name }, imageFile, "image"),
      }),
      invalidatesTags: ["Category"],
    }),
    getAllCategories: build.query<CategoryRecord[], void>({
      query: () => ({
        url: "/category",
        method: "GET",
      }),
      transformResponse: (response: unknown) => readCategories(response),
      providesTags: ["Category"],
    }),
    getCategoryById: build.query<CategoryRecord | undefined, string>({
      query: (id) => ({
        url: `/category/${id}`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => {
        if (response && typeof response === "object" && "data" in response) {
          return normalizeCategory((response as { data?: unknown }).data) ?? undefined;
        }
        return normalizeCategory(response) ?? undefined;
      },
      providesTags: ["Category"],
    }),
    updateCategory: build.mutation<CategoryMessageResponse, UpdateCategoryArgs>({
      query: ({ id, ...data }) => ({
        url: `/category/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),
    deleteCategory: build.mutation<CategoryMessageResponse, string>({
      query: (id) => ({
        url: `/category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),
  }),
});

export const {
  useCreateCategoryMutation,
  useGetAllCategoriesQuery,
  useGetCategoryByIdQuery,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
