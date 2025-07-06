const AccountBanner = ({  }) => {

  return(
        <section className="relative h-64 sm:h-80 md:h-96 flex items-center justify-center text-white text-center overflow-hidden">
        <img
            src="/garota-de-cabelo-rosa-em-danca-de-estilo-vanguardista.jpg"
            alt="GIF de fundo"
            className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        {/* Overlay para melhor contraste */}
        <div className="absolute inset-0 bg-black/30"></div>
        
        <div className="z-10 relative px-4 sm:px-6 md:px-8 max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-2 sm:mb-3 md:mb-4 leading-tight">
                YOUR AESTHETICS, YOUR REBELLION
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-5 md:mb-6 opacity-90">
                Dress with attitude. Break the mold.
            </p>
            <button className="bg-white text-black px-6 sm:px-7 md:px-8 py-2.5 sm:py-3 rounded-full font-bold hover:bg-gray-200 transition-all duration-300 text-sm sm:text-base hover:scale-105 active:scale-95">
                BUY NOW
            </button>
        </div>
        </section>
    );
};
export default AccountBanner;