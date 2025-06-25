const KitsSection = ({ }) => {
    const kits = [
    { id: 1, name: "Gothic Couple Kit", price: 599, originalPrice: 799, image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop", gender: "couple" },
    { id: 2, name: "Dark Prince Kit", price: 449, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop", gender: "male" },
    { id: 3, name: "Shadow Queen Kit", price: 519, image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=400&fit=crop", gender: "female" }
    ];
    
  return(
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4 bg-gradient-to-r from-purple-400 to-red-400 bg-clip-text text-transparent">
              EXCLUSIVE KITS
            </h2>
            <p className="text-xl text-gray-300">Perfect combinations for rebellious couples</p>
          </div>

          {/* Hero Banner dos Kits */}
          <div className="mb-16 relative overflow-hidden rounded-3xl">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop"
              alt="Kits promocionais"
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/80 to-red-600/80" />
            <div className="absolute inset-0 flex items-center justify-center text-center">
              <div>
                <h3 className="text-4xl font-black mb-4">KITS WITH 30% OFF</h3>
                <button className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors">
                  BUY NOW!
                </button>
              </div>
            </div>
          </div>

          {/* Kits Masculinos */}
          <div className="mb-12">
            <h3 className="text-3xl font-bold mb-8 text-center">KITS MALE</h3>
            <div className="flex gap-6 overflow-x-auto pb-4">
              {kits.filter(kit => kit.gender === 'male').map((kit) => (
                <div key={kit.id} className="min-w-80 bg-gray-900 rounded-2xl overflow-hidden group cursor-pointer">
                  <img
                    src={kit.image}
                    alt={kit.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="p-6">
                    <h4 className="text-xl font-bold mb-2">{kit.name}</h4>
                    <div className="flex items-center gap-2 mb-4">
                      {kit.originalPrice && (
                        <span className="text-gray-500 line-through">$ {kit.originalPrice}</span>
                      )}
                      <span className="text-2xl font-bold text-purple-400">$ {kit.price}</span>
                    </div>
                    <button className="w-full bg-gradient-to-r from-purple-600 to-red-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-red-700 transition-colors">
                      BUY KIT
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Kits Femininos */}
          <div>
            <h3 className="text-3xl font-bold mb-8 text-center">KITS FEMALES</h3>
            <div className="flex gap-6 overflow-x-auto pb-4">
              {kits.filter(kit => kit.gender === 'female').map((kit) => (
                <div key={kit.id} className="min-w-80 bg-gray-900 rounded-2xl overflow-hidden group cursor-pointer">
                  <img
                    src={kit.image}
                    alt={kit.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="p-6">
                    <h4 className="text-xl font-bold mb-2">{kit.name}</h4>
                    <div className="flex items-center gap-2 mb-4">
                      {kit.originalPrice && (
                        <span className="text-gray-500 line-through">$ {kit.originalPrice}</span>
                      )}
                      <span className="text-2xl font-bold text-purple-400">$ {kit.price}</span>
                    </div>
                    <button className="w-full bg-gradient-to-r from-purple-600 to-red-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-red-700 transition-colors">
                      BUY KIT
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
};
export default KitsSection;