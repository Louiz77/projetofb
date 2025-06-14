import { useState } from "react";
import { ShoppingCart, Trash2 } from "lucide-react";

const Cart = ({ cart, onRemoveItem, onCheckout }) => {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Carrinho de Compras</h1>
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart size={80} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-6">Seu carrinho está vazio</p>
            <button
              onClick={() => window.history.back()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continuar Comprando
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <p className="text-gray-500">R$ {item.price.toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Order Summary */}
            <div>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="font-bold text-lg mb-4">Resumo do Pedido</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>R$ {cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frete</span>
                    <span>Grátis</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>R$ {cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={onCheckout}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors mt-6"
                >
                  Finalizar Compra
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;