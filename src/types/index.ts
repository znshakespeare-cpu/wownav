export interface Tool {
  id: string;
  icon: string;
  name: string;
  url: string;
  description: string;
  tags: string[];
  category: string;
  access: '🟢' | '🟡' | '🔴';
}

export interface Category {
  id: string;
  label: string;
  icon: string;
}
