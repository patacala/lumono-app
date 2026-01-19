export interface Permission {
  id: string;
  name: string;
  description?: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  version: number;
}

