import { Facebook, Instagram, Twitter, Youtube, Music } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  const handleNavigation = (page) => {
    navigate(`/${page}`);
  };

  const paymentMethods = [
    { name: 'VISA', color: 'bg-blue-600' },
    { name: 'MC', color: 'bg-red-600' },
    { name: 'AMEX', color: 'bg-blue-500' },
    { name: 'DISC', color: 'bg-orange-500' },
    { name: 'PIX', color: 'bg-emerald-600' },
    { name: 'BNDS', color: 'bg-red-500' },
    { name: 'PYPL', color: 'bg-blue-800' },
    { name: 'NUBN', color: 'bg-purple-600' }
  ];

  const footerLinks = [
    { name: 'Contact', path: 'contact' },
    { name: 'Helpdesk', path: 'helpdesk' },
    { name: 'Terms', path: 'terms' },
    { name: 'Privacy', path: 'privacy' },
    { name: 'Shipping', path: 'shipping' },
    { name: 'About Us', path: 'vanadus' },
    { name: 'FAQ', path: 'FAQ' }
  ];

  const socialLinks = [
    { Icon: Music, label: 'Spotify', href: '#' },
    { Icon: Facebook, label: 'Facebook', href: '#' },
    { Icon: Twitter, label: 'Twitter', href: '#' },
    { Icon: Instagram, label: 'Instagram', href: '#' },
    { Icon: Youtube, label: 'YouTube', href: '#' }
  ];

  return (
    <footer className="bg-gradient-to-b from-[#1C1C1C] to-black text-white border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Payment Methods Section */}
        <div className="py-6 border-b border-gray-800/50">
          <div className="text-center mb-4">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
              Payment Methods
            </h3>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-3">
            {paymentMethods.map((method, index) => (
              <div
                key={index}
                className={`${method.color} w-14 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-lg hover:scale-105 transition-transform duration-200`}
              >
                {method.name}
              </div>
            ))}
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            
            {/* Brand Section */}
            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#1C1C1C] to-[#4B014E] bg-clip-text text-transparent">
                VANADUS
              </h2>
              <p className="text-gray-400 text-sm mt-2">
                &copy; 2025 All rights reserved
              </p>
            </div>

            {/* Navigation Links */}
            <div className="text-center">
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                {footerLinks.map((link, index) => (
                  <button
                    key={index}
                    onClick={() => handleNavigation(link.path)}
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-200 hover:underline underline-offset-4"
                  >
                    {link.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Social Media */}
            <div className="text-center lg:text-right">
              <p className="text-gray-400 text-sm mb-3">Follow Us</p>
              <div className="flex justify-center lg:justify-end items-center gap-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="w-10 h-10 rounded-full bg-gray-800 hover:bg-white flex items-center justify-center text-white hover:text-black transition-all duration-300 hover:scale-110 hover:shadow-lg"
                    aria-label={social.label}
                  >
                    <social.Icon size={16} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-4 border-t border-gray-800/50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-xs text-gray-500">
              Made with ♥ by VANADUS Team
            </div>
            <div className="text-xs text-gray-500">
              <span className="hidden sm:inline">🌍 Shipping worldwide • </span>
              <span>💳 Secure payments • </span>
              <span>📞 24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;