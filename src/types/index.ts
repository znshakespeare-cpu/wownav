export interface Tool {
  id: string;
  icon: string;
  name: string;
  url: string;
  description: string;
  tags: string[];
  category: string;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
}
