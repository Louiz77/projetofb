import { Facebook, Instagram, Twitter } from "lucide-react";
const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">VANADUS</h3>
            <p className="text-gray-400 mb-4">
              Fundada em 2025, a VANADUS oferece produtos de qualidade com a melhor experiência de compra online.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Links Úteis</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Sobre Nós
                </a>
              </li>
              <li>
                <a href="contact" className="text-gray-400 hover:text-white">
                  Contato
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Políticas de Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Termos de Uso
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Contato</h3>
            <p className="text-gray-400 mb-2">suporte@VANADUS.com.br</p>
            <p className="text-gray-400">(11) 98765-4321</p>
            <p className="text-gray-400">Av. Paulista, 1234 - São Paulo, SP</p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Newsletter</h3>
            <p className="text-gray-400 mb-4">
              Inscreva-se para receber ofertas exclusivas e novidades.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Seu email"
                className="w-full px-4 py-2 rounded-l-lg border border-gray-700 bg-gray-900 text-white focus:outline-none"
              />
              <button className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors">
                Inscrever
              </button>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; 2025 VANADUS. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;