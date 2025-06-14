import { useState } from "react";

const Account = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [user, setUser] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    setUser({ name: "João Silva", email: loginData.email });
    alert("Login realizado com sucesso!");
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }
    setUser({ name: registerData.name, email: registerData.email });
    alert("Conta criada com sucesso!");
  };

  const handleLogout = () => {
    setUser(null);
    alert("Logout realizado com sucesso!");
  };

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {user ? (
            <div>
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-3xl font-bold">Minha Conta</h1>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Sair
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Informações Pessoais</h2>
                    <div className="space-y-2">
                      <p><strong>Nome:</strong> {user.name}</p>
                      <p><strong>Email:</strong> {user.email}</p>
                      <p><strong>Membro desde:</strong> Janeiro 2024</p>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Estatísticas</h2>
                    <div className="space-y-2">
                      <p><strong>Pedidos realizados:</strong> 12</p>
                      <p><strong>Produtos no carrinho:</strong> 3</p>
                      <p><strong>Produtos na lista de desejos:</strong> 5</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-3xl font-bold mb-8 text-center">
                {isLogin ? "Entrar" : "Criar Conta"}
              </h1>
              {isLogin ? (
                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      required
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData({ ...loginData, email: e.target.value })
                      }
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Senha</label>
                    <input
                      type="password"
                      required
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Entrar
                  </button>
                  <p className="text-center text-sm text-gray-600 mt-4">
                    Não tem conta?{" "}
                    <button
                      onClick={() => setIsLogin(false)}
                      className="text-blue-600 hover:underline"
                    >
                      Crie agora
                    </button>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nome Completo</label>
                    <input
                      type="text"
                      required
                      value={registerData.name}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, name: e.target.value })
                      }
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      required
                      value={registerData.email}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, email: e.target.value })
                      }
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Senha</label>
                    <input
                      type="password"
                      required
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, password: e.target.value })
                      }
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Confirm Password</label>
                    <input
                      type="password"
                      required
                      value={registerData.confirmPassword}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create account
                  </button>
                  <p className="text-center text-sm text-gray-600 mt-4">
                    Já tem conta?{" "}
                    <button
                      onClick={() => setIsLogin(true)}
                      className="text-blue-600 hover:underline"
                    >
                      Faça login
                    </button>
                  </p>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;