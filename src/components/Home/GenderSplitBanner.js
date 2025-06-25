const GenderSplitBanner = () => {
  return (
    <section className="bg-gradient-to-br from-gray-900 via-purple-900 to-red-900">
        <div className="grid md:grid-cols-2 gap-0 h-50">
            {/* Gótico */}
            <div className="group relative overflow-hidden cursor-pointer transform hover:scale-100 transition-all duration-500">
                <img
                    src="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&h=600&fit=crop"
                    alt="Estilo Gótico"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-center items-center text-white z-10">
                    <h3 className="text-6xl font-black mb-4 tracking-widest drop-shadow-lg">GOTHIC</h3>
                    <p className="text-xl opacity-90 drop-shadow-md tracking-wide">Darkness & Elegance</p>
                    <button className="mt-6 px-8 py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold tracking-wider hover:bg-white/30 transition-all duration-300">
                        SHOP ACCESSORIES
                    </button>
                </div>
            </div>

            {/* Streetwear */}
            <div className="group relative overflow-hidden cursor-pointer transform hover:scale-100 transition-all duration-500">
                <img
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop"
                    alt="Estilo Streetwear"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-center items-center text-white z-10">
                    <h3 className="text-6xl font-black mb-4 tracking-widest drop-shadow-lg">STREETWEAR</h3>
                    <p className="text-xl opacity-90 drop-shadow-md tracking-wide">Urban & Rebellious</p>
                    <button className="mt-6 px-8 py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold tracking-wider hover:bg-white/30 transition-all duration-300">
                        SHOP GRAPHIC PRINTS
                    </button>
                </div>
            </div>
        </div>
    </section>
  );
};

export default GenderSplitBanner;