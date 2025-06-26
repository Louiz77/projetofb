const GridProduct = ({ mockProducts }) => {

  return(
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            {/* Banner de destaque */}
            <div className="lg:col-span-1">
              <div className="relative overflow-hidden group cursor-pointer">
                <img
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=800&fit=crop"
                  alt="Acessórios exclusivos"
                  className="w-full h-96 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 text-white">
                  <h3 className="text-3xl font-bold mb-2">ACCESSORIES</h3>
                  <p className="text-lg opacity-90">Complete your look</p>
                </div>
              </div>
            </div>

            {/* Grid de produtos */}
            <div className="lg:col-span-2 space-y-8">
              {/* Primeira fileira - Acessórios */}
              <div>
                <h3 className="text-2xl font-bold mb-6">ACCESSORIES</h3>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {mockProducts.slice(0, 4).map((product) => (
                    <div key={product.id} className="min-w-48 bg-white overflow-hidden shadow-lg hover:shadow-xl transition-shadow group">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="p-1">
                        <h4 className="font-semibold text-sm mb-2">{product.name}</h4>
                        <span className="text-l font-bold text-purple-600">$ {product.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Segunda fileira - Bolsas */}
              <div>
                <h3 className="text-2xl font-bold mb-6">BAGS</h3>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {mockProducts.slice(2, 6).map((product) => (
                    <div key={product.id} className="min-w-48 bg-white overflow-hidden shadow-lg hover:shadow-xl transition-shadow group">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="p-1">
                        <h4 className="font-semibold text-sm mb-2">{product.name}</h4>
                        <span className="text-l font-bold text-purple-600">$ {product.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
};
export default GridProduct;