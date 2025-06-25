const AccountBanner = ({  }) => {

  return(
        <section className="relative h-96 flex items-center justify-center text-white text-center overflow-hidden">
        <img
            src="/garota-de-cabelo-rosa-em-danca-de-estilo-vanguardista.jpg"
            alt="GIF de fundo"
            className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="z-10 relative">
            <h2 className="text-5xl font-black mb-4">YOUR AESTHETICS, YOUR REBELLION</h2>
            <p className="text-xl mb-6">Dress with attitude. Break the mold.</p>
            <button className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition">
            BUY NOW
            </button>
        </div>
        </section>
    );
};
export default AccountBanner;