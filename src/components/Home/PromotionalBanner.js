const PromotionalBanner = ({  }) => {

  return(
      <section className="relative h-96 flex items-center justify-center py-24 bg-[#1C1C1C] text-white text-center overflow-hidden">
        <img
            src="/garota-de-cabelo-rosa-em-danca-de-estilo-vanguardista.jpg"
            alt="GIF de fundo"
            className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">VANADUS</h2>
          <p className="text-xl mb-8">Unlock exclusive discounts by creating your account</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="bg-black/20 backdrop-blur-sm px-6 py-3 rounded-full">
              <span className="font-semibold">✨ First purchase coupon</span>
            </div>
            <div className="bg-black/20 backdrop-blur-sm px-6 py-3 rounded-full">
              <span className="font-semibold">💎 Exclusive discounts</span>
            </div>
          </div>
          <button className="mt-8 bg-black/20 text-black-600 px-8 py-4 font-bold text-lg hover:bg-[#4B014E] transition-colors">
            Discover
          </button>
        </div>
      </section>
    );
};
export default PromotionalBanner;