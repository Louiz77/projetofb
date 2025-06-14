import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";

const Contact = () => {
  const [contactData, setContactData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Mensagem enviada com sucesso!");
    setContactData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Contato</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome *</label>
                  <input
                    type="text"
                    required
                    value={contactData.name}
                    onChange={(e) =>
                      setContactData({ ...contactData, name: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={contactData.email}
                    onChange={(e) =>
                      setContactData({ ...contactData, email: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Assunto *</label>
                  <input
                    type="text"
                    required
                    value={contactData.subject}
                    onChange={(e) =>
                      setContactData({ ...contactData, subject: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Mensagem *</label>
                  <textarea
                    rows="5"
                    required
                    value={contactData.message}
                    onChange={(e) =>
                      setContactData({ ...contactData, message: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Enviar Mensagem
                </button>
              </form>
            </div>
            {/* Contact Info */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Informações de Contato</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1 mr-3 text-blue-600">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="font-medium">Email:</p>
                    <p className="text-gray-600">suporte@VANADUS.com.br</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1 mr-3 text-blue-600">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="font-medium">Telefone:</p>
                    <p className="text-gray-600">(11) 98765-4321</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1 mr-3 text-blue-600">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="font-medium">Endereço:</p>
                    <p className="text-gray-600">Av. Paulista, 1234 - São Paulo, SP</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;