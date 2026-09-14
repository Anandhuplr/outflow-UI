export interface AppUser {
  id: number;
  name: string;
  email: string;
  pictureUrl?: string;
  currency: string;
  timezone: string;
}

export interface Category {
  id: number;
  name: string;
  icon?: string;
  color?: string;
  default: boolean;
}

export interface Transaction {
  id: number;
  category: Category;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  transactionDate: string;
  paymentMethod?: string;
  notes?: string;
}

export interface Budget {
  id?: number;
  name: string;
  spent: number;
  limit: number;
  color: string;
}

export interface CategorySpend {
  name: string;
  amount: number;
  percent: number;
  color: string;
  emoji: string;
}

export interface NavItem {
  label: string;
  icon: string;
}

export interface QuickAddAction {
  label: string;
  icon: string;
}