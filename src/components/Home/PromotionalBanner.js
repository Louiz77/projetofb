const PromotionalBanner = ({  }) => {

  return(
      <section className="py-24 bg-[#F3ECE7] text-black">
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
          <button className="mt-8 bg-black/20 text-black-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-[#4B014E] transition-colors">
            CREATE ACCOUNT NOW
          </button>
        </div>
      </section>
    );
};
export default PromotionalBanner;