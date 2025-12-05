export interface PageItem {
  id: string;
  title: string;
  level: number;
  order: number;
}

export interface PageEdit {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  description: string;
  content: string;
  level: number;
  order: number;
}
