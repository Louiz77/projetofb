import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Calendar, LogOut, Skull, LightbulbIcon } from 'lucide-react';
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from '../client/firebaseConfig';

const Account = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Observar mudanças no estado de autenticação
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          criado: firebaseUser.metadata.creationTime || "Date",
          email: firebaseUser.email,
          ultimoLogin: firebaseUser.metadata.lastSignInTime || "Date",
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Função de login com Firebase
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      alert("Login realizado com sucesso!");
      window.location.reload();
    } catch (error) {
      alert(`Erro no login: ${error.message}`);
    }
  };

  // Função de cadastro com Firebase
  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, registerData.email, registerData.password);
      alert("Conta criada com sucesso!");
      window.location.reload();
    } catch (error) {
      alert(`Erro no cadastro: ${error.message}`);
    }
  };

  // Função de logout com Firebase
  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Logout realizado com sucesso!");
      window.location.reload();
    } catch (error) {
      alert(`Erro ao sair: ${error.message}`);
    }
  };

  const handleNavigation = (page) => {
    navigate(`/${page}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-[#1C1C1C] py-8 px-4">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-2 border-red-800 border-t-transparent mx-auto mb-4"></div>
                <p className="text-red-200 text-lg font-medium">Carregando...</p>
              </div>
            </div>
          ) : user ? (
            <div className="space-y-8">
              {/* Header com Logout */}
              <div className="bg-black/50 backdrop-blur-sm border border-red-800/30 rounded-lg p-6 shadow-2xl">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-red-800 to-purple-800 p-3 rounded-full">
                      <Skull className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent">
                        VANADUS ACCOUNT
                      </h1>
                      <p className="text-gray-400 text-sm">Forged in Shadow</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="group bg-red-800 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-red-800/50 flex items-center space-x-2 border border-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="font-medium">SAIR</span>
                  </button>
                </div>
              </div>

              {/* Informações do Usuário */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-black/50 backdrop-blur-sm border border-red-800/30 rounded-lg p-6 shadow-2xl">
                  <h2 className="text-xl font-bold text-red-400 mb-6 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    INFORMAÇÕES PESSOAIS
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                      <Mail className="h-4 w-4 text-red-400 mr-3" />
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wide">Email</p>
                        <p className="text-white font-medium">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                      <Calendar className="h-4 w-4 text-purple-400 mr-3" />
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wide">Último Login</p>
                        <p className="text-white font-medium">{formatDate(user.ultimoLogin)}</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                      <Calendar className="h-4 w-4 text-green-400 mr-3" />
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wide">Membro desde</p>
                        <p className="text-white font-medium">{formatDate(user.criado)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-black/50 backdrop-blur-sm border border-red-800/30 rounded-lg p-6 shadow-2xl">
                  <h2 className="text-xl font-bold text-purple-400 mb-6">ESTATÍSTICAS</h2>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-gradient-to-r from-red-800/20 to-purple-800/20 rounded-lg border border-red-600/30">
                      <p className="text-2xl font-bold text-white">0</p>
                      <p className="text-gray-400 text-sm">Pedidos realizados</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-purple-800/20 to-red-800/20 rounded-lg border border-purple-600/30">
                      <p className="text-2xl font-bold text-white">0</p>
                      <p className="text-gray-400 text-sm">Produtos no carrinho</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-red-800/20 to-purple-800/20 rounded-lg border border-red-600/30">
                      <p className="text-2xl font-bold text-white">0</p>
                      <p className="text-gray-400 text-sm">Lista de desejos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              {/* Header do formulário */}
              <div className="text-center mb-8">
                <div className="bg-gradient-to-r from-red-800 to-purple-800 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Skull className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  VANADUS
                </h1>
                <p className="text-gray-400 text-sm mb-6">For the bold and untamed</p>
                <h2 className="text-2xl font-bold text-white">
                  {isLogin ? "ENTRAR" : "CRIAR CONTA"}
                </h2>
              </div>

              <div className="bg-black/50 backdrop-blur-sm border border-red-800/30 rounded-lg p-8 shadow-2xl">
                {isLogin ? (
                  <div onSubmit={handleLogin} className="space-y-6">
                    <div>
                      <label className="block text-red-400 text-sm font-bold mb-2 uppercase tracking-wide">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={loginData.email}
                        onChange={(e) =>
                          setLoginData({ ...loginData, email: e.target.value })
                        }
                        className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300"
                        placeholder="seu@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-red-400 text-sm font-bold mb-2 uppercase tracking-wide">
                        Senha
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={loginData.password}
                          onChange={(e) =>
                            setLoginData({ ...loginData, password: e.target.value })
                          }
                          className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={handleLogin}
                      className="w-full bg-gradient-to-r from-red-800 to-purple-800 hover:from-red-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-red-800/50 border border-red-600 uppercase tracking-wide"
                    >
                      ENTRAR
                    </button>
                  </div>
                ) : (
                  <div onSubmit={handleRegister} className="space-y-6">
                    <div>
                      <label className="block text-red-400 text-sm font-bold mb-2 uppercase tracking-wide">
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        required
                        value={registerData.name}
                        onChange={(e) =>
                          setRegisterData({ ...registerData, name: e.target.value })
                        }
                        className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300"
                        placeholder="Seu nome"
                      />
                    </div>
                    <div>
                      <label className="block text-red-400 text-sm font-bold mb-2 uppercase tracking-wide">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={registerData.email}
                        onChange={(e) =>
                          setRegisterData({ ...registerData, email: e.target.value })
                        }
                        className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300"
                        placeholder="seu@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-red-400 text-sm font-bold mb-2 uppercase tracking-wide">
                        Senha
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={registerData.password}
                          onChange={(e) =>
                            setRegisterData({ ...registerData, password: e.target.value })
                          }
                          className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-red-400 text-sm font-bold mb-2 uppercase tracking-wide">
                        Confirmar Senha
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={registerData.confirmPassword}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={handleRegister}
                      className="w-full bg-gradient-to-r from-red-800 to-purple-800 hover:from-red-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-red-800/50 border border-red-600 uppercase tracking-wide"
                    >
                      CRIAR CONTA
                    </button>
                  </div>
                )}

                <div className="mt-6 text-center">
                  <p className="text-gray-400 text-sm">
                    {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
                    <button
                      type="button"
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-red-400 hover:text-red-300 font-bold transition-colors uppercase tracking-wide"
                    >
                      {isLogin ? "CRIE AGORA" : "FAÇA LOGIN"}
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}
          <div
            onClick={() => handleNavigation("faq")}
            className="group mt-10 bg-red-800 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-red-800/50 flex items-center space-x-2 border border-red-600"
            >
            <LightbulbIcon className="h-4 w-4" />
            <span className="font-medium">FAQ</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;