export interface Product {
  id: string
  title: string
  description: string
  price: number
  category: string
  size: string
  condition: 'excellent' | 'good' | 'fair' | 'poor'
  era: string
  image_url: string
  image_alt: string
  created_at: string
  updated_at: string
}

export interface CreateProductInput {
  title: string
  description: string
  price: number
  category: string
  size: string
  condition: 'excellent' | 'good' | 'fair' | 'poor'
  era: string
  image_url: string
  image_alt: string
}
