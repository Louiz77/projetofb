const GenderSplitBanner = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-purple-900 to-red-900">
        <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Gótico */}
            <div className="group relative overflow-hidden rounded-3xl cursor-pointer transform hover:scale-105 transition-all duration-500">
                <img
                src="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&h=600&fit=crop"
                alt="Estilo Gótico"
                className="w-full h-96 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    <div className="absolute bottom-8 left-8 text-white">
                        <h3 className="text-4xl font-black mb-2">GOTHIC</h3>
                        <p className="text-lg opacity-90">Darkness & Elegance</p>
                    </div>
                </div>

            {/* Streetwear */}
            <div className="group relative overflow-hidden rounded-3xl cursor-pointer transform hover:scale-105 transition-all duration-500">
                <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop"
                alt="Estilo Streetwear"
                className="w-full h-96 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    <div className="absolute bottom-8 left-8 text-white">
                        <h3 className="text-4xl font-black mb-2">STREETWEAR</h3>
                        <p className="text-lg opacity-90">Urban & Rebellious</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
};

export default GenderSplitBanner;