export type Category = 'gaming' | 'business' | 'student' | 'design' | 'office' | 'budget' | 'other'
export type Condition = 'new' | 'used'
export type ProductStatus = 'pending' | 'approved' | 'rejected' | 'sold'

export interface Product {
  id: string
  title: string
  brand: string | null
  cpu: string | null
  ram_gb: number | null
  storage: string | null
  gpu: string | null
  screen_size: number | null
  condition: Condition
  price: number
  currency: string
  images: string[]
  description: string | null
  category: Category
  tags: string[]
  in_stock: boolean
  source: 'shop' | 'user_listing'
  seller_telegram_id: number | null
  seller_contact: string | null
  status: ProductStatus
  views: number
  created_at: string
}

export interface Banner {
  id: string
  image_url: string
  title: string | null
  subtitle: string | null
  link_url: string | null
  is_active: boolean
  sort_order: number
}

export interface TgUserInfo {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
}
