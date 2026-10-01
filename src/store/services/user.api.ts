import { api } from "../api";
import { cleanParams } from "../http";

export interface UserRecord {
  _id: string;
  name: string;
  phone?: string;
  birthDate?: string | null;
  image?: string | null;
  isVerified?: boolean;
  isActive?: boolean;
  isBanned?: boolean;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserListArgs {
  searchTerm?: string;
  isActive?: boolean;
  isBanned?: boolean;
  isVerified?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface UserListPagination {
  total?: number;
  limit?: number;
  page?: number;
  totalPage?: number;
}

export interface UserListResponse {
  success?: boolean;
  message?: string;
  pagination?: UserListPagination;
  data?: UserRecord[];
}

export interface UserDetailResponse {
  success?: boolean;
  message?: string;
  data?: UserRecord;
}

export interface UpdateProfileArgs {
  name: string;
  phone: string;
  birthDate: string;
}

function toProfileFormData(profileFields: UpdateProfileArgs) {
  const body = new FormData();
  body.append("name", profileFields.name);
  body.append("phone", profileFields.phone);
  body.append("birthDate", profileFields.birthDate);
  return body;
}

const userApi = api.injectEndpoints({
  endpoints: (build) => ({
    getUserList: build.query<UserListResponse, UserListArgs | void>({
      query: (listArgs) => ({
        url: "/dashboard/user-list",
        method: "GET",
        params: cleanParams(listArgs ?? undefined),
      }),
      providesTags: ["User"],
    }),
    getUserById: build.query<UserDetailResponse, string>({
      query: (userId) => ({
        url: `/dashboard/user-list/${userId}`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    suspendUser: build.mutation<UserDetailResponse, string>({
      query: (userId) => ({
        url: `/dashboard/user-list/${userId}/suspend`,
        method: "PATCH",
      }),
      invalidatesTags: ["User"],
    }),
    getProfile: build.query<UserDetailResponse, void>({
      query: () => ({
        url: "/user/profile",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    updateProfile: build.mutation<UserDetailResponse, UpdateProfileArgs>({
      query: (profileFields) => ({
        url: "/user/profile",
        method: "PATCH",
        body: toProfileFormData(profileFields),
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetUserListQuery,
  useGetUserByIdQuery,
  useSuspendUserMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} = userApi;
