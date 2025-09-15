export interface Permission {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export interface Role {
  _id: string;
  name: string;
  permissions: {
    users: Permission;
    roles: Permission;
    brands: Permission;
    locations: Permission;
    stores: Permission;
  };
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  storeIds: string[];
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  __v?: number;
}

export interface AuthResponse {
  status: number;
  message: string;
  data: {
    user: User;
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (pin: string) => Promise<void>;
  logout: () => void;
  checkPermission: (
    module: keyof Role["permissions"],
    action: keyof Permission
  ) => boolean;
}
