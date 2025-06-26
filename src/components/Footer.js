import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();


  const handleNavigation = (page) => {
    navigate(`/${page}`);
  };
  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-6">
        
        {/* Top section with payment methods */}
        <div className="flex justify-center py-4 border-b border-gray-800">
          <div className="flex items-center space-x-4">
            {/* Payment methods */}
            <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">VISA</div>
            <div className="w-12 h-8 bg-red-600 rounded flex items-center justify-center text-white text-xs font-bold">MC</div>
            <div className="w-12 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">AMEX</div>
            <div className="w-12 h-8 bg-orange-500 rounded flex items-center justify-center text-white text-xs font-bold">DISC</div>
            <div className="w-12 h-8 bg-gray-700 rounded flex items-center justify-center text-white text-xs font-bold">PIX</div>
            <div className="w-12 h-8 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">BNDS</div>
            <div className="w-12 h-8 bg-blue-800 rounded flex items-center justify-center text-white text-xs font-bold">PYPL</div>
            <div className="w-12 h-8 bg-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">NUBN</div>
            <div className="w-12 h-8 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">GPHY</div>
            <div className="w-12 h-8 bg-indigo-600 rounded flex items-center justify-center text-white text-xs font-bold">KLRN</div>
          </div>
        </div>

        {/* Bottom section with links and social */}
        <div className="flex flex-col md:flex-row items-center justify-between py-4 space-y-4 md:space-y-0">
          
          {/* Left side - Copyright and links */}
          <div className="flex flex-wrap items-center space-x-6 text-sm text-gray-400">
            <span>&copy; VANADUS 2025</span>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
            <a href="#" className="hover:text-white transition-colors">Helpdesk</a>
            <a href="#" className="hover:text-white transition-colors">Terms and conditions</a>
            <a href="#" className="hover:text-white transition-colors">Privacy policy</a>
            <a href="#" className="hover:text-white transition-colors">Shipping policy</a>
            <a href="#" className="hover:text-white transition-colors">Discounts</a>
            <a href="#" className="hover:text-white transition-colors">Work for Us</a>
          </div>

          {/* Right side - Social media */}
          <div className="flex items-center space-x-3">
            <a 
              href="#" 
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black hover:bg-gray-200 transition-colors"
              aria-label="Spotify"
            >
              <span className="text-xs font-bold">♪</span>
            </a>
            <a 
              href="#" 
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black hover:bg-gray-200 transition-colors"
              aria-label="Facebook"
            >
              <Facebook size={14} />
            </a>
            <a 
              href="#" 
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black hover:bg-gray-200 transition-colors"
              aria-label="Twitter"
            >
              <Twitter size={14} />
            </a>
            <a 
              href="#" 
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black hover:bg-gray-200 transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={14} />
            </a>
            <a 
              href="#" 
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black hover:bg-gray-200 transition-colors"
              aria-label="YouTube"
            >
              <Youtube size={14} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;