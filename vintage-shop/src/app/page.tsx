import { supabase, Product } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'

async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_available', true)
    .order('created_at', { ascending: false })
  if (error) return []
  return data as Product[]
}

export default async function HomePage() {
  const products = await getProducts()

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-medium text-gray-900">
            Vintage<span className="text-brand-500">Thread</span>
          </h1>
          <nav className="flex gap-6 text-sm text-gray-600">
            <a href="#catalogue" className="hover:text-brand-500 transition-colors">Catalogue</a>
            <a href="#contact" className="hover:text-brand-500 transition-colors">Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white py-20 px-4 text-center border-b border-gray-100">
        <p className="text-sm text-brand-500 font-medium mb-3 tracking-wide uppercase">Mode seconde main</p>
        <h2 className="text-4xl font-medium text-gray-900 mb-4">
          Des pièces vintage<br />soigneusement sélectionnées
        </h2>
        <p className="text-gray-500 max-w-md mx-auto mb-8">
          Chaque vêtement est unique. Trouvez votre prochaine pièce de caractère.
        </p>
        <a href="#catalogue" className="btn-primary inline-block">
          Voir le catalogue
        </a>
      </section>

      {/* Catalogue */}
      <section id="catalogue" className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-medium text-gray-900 mb-8">Catalogue</h2>

        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">Aucun article disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Contact */}
      <section id="contact" className="bg-white border-t border-gray-100 py-16 px-4 text-center">
        <h2 className="text-2xl font-medium text-gray-900 mb-4">Une question ?</h2>
        <p className="text-gray-500 mb-6">Contactez-nous par Instagram ou email.</p>
        <a href="mailto:contact@votresite.com" className="btn-primary inline-block">
          Nous contacter
        </a>
      </section>
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const firstImage = product.images?.[0]

  return (
    <div className="card group cursor-pointer hover:border-brand-500 transition-colors">
      <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
        {firstImage ? (
          <Image
            src={firstImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
            👗
          </div>
        )}
        {!product.is_available && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-900 text-xs font-medium px-3 py-1 rounded-full">
              Vendu
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-brand-500 font-medium">{product.price}€</span>
          <span className="text-xs text-gray-400">{product.size} · {product.decade}s</span>
        </div>
        {product.condition && (
          <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {product.condition}
          </span>
        )}
      </div>
    </div>
  )
}
