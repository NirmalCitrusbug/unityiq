
export interface Brand {
  _id: string;
  name: string;
}

export interface LocationDetails {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface Store {
  _id: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  brandId: Brand;
  locationId: LocationDetails;
  geofenceRadius: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface StoreResponse {
  status: number;
  message: string;
  data: Store;
}
