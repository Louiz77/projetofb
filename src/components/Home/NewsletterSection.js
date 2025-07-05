import { useState } from "react";

const NewsletterSection = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Inscrição realizada:", email);
    setEmail('');
  };

  return (
    <section className="py-5 bg-black text-white">
      <div className="container mx-auto px-4 md:px-6 xl:px-8 3xl:px-10 4xl:px-12 5xl:px-16 max-w-screen-xl 3xl:max-w-screen-2xl 4xl:max-w-2k 5xl:max-w-4k text-center">
        <h2 className="text-2xl font-bold mb-2">JOIN OUR COMMUNITY</h2>
        <p className="text-xl mb-8">Get exclusive releases and dark promotions</p>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="w-full bg-black/50 border border-white/30 px-6 py-4 mb-4 focus:border-white"
              required
            />
            <button
              type="submit"
              className="absolute right-0 top-0 bg-red-600 text-white px-6 py-4 hover:bg-red-700 transition-colors"
            >
              SUBSCRIBE
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default NewsletterSection;