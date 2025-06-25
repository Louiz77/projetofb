import { useState } from "react";

const NewsletterSection = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Inscrição realizada:", email);
    setEmail('');
  };

  return (
    <section className="py-20 bg-black text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-6">JOIN OUR COMMUNITY</h2>
        <p className="text-xl mb-8">Get exclusive releases and dark promotions</p>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="w-full bg-black/50 border border-white/30 rounded-full px-6 py-4 mb-4 focus:border-white"
              required
            />
            <button
              type="submit"
              className="absolute right-0 top-0 bg-red-600 text-white px-6 py-4 rounded-full hover:bg-red-700 transition-colors"
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