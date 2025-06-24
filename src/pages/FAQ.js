import { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Package, Truck, CreditCard, RefreshCw, Shield, Users, Skull, Mail, Phone, Clock } from 'lucide-react';

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState('orders');
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    {
      id: 'orders',
      title: 'Orders & Status',
      icon: Package,
      description: 'Information about your orders and how to track them',
      color: 'from-red-800 to-red-900'
    },
    {
      id: 'shipping',
      title: 'Shipping & Delivery',
      icon: Truck,
      description: 'Details about delivery times, costs, and policies',
      color: 'from-purple-800 to-purple-900'
    },
    {
      id: 'returns',
      title: 'Returns & Exchanges',
      icon: RefreshCw,
      description: 'How to request returns and exchanges',
      color: 'from-red-700 to-purple-800'
    },
    {
      id: 'payment',
      title: 'Payment',
      icon: CreditCard,
      description: 'Payment methods and security',
      color: 'from-purple-700 to-red-800'
    },
    {
      id: 'products',
      title: 'Products',
      icon: Shield,
      description: 'Product quality and care information',
      color: 'from-red-800 to-purple-800'
    },
    {
      id: 'account',
      title: 'Account & Support',
      icon: Users,
      description: 'Manage your account and get help',
      color: 'from-purple-800 to-red-700'
    }
  ];


  const faqData = {
    orders: [
      {
        question: 'How can I track my order?',
        answer: 'After your order is confirmed, you’ll receive an email with a tracking code. You can also track it through your account dashboard under "My Orders". Tracking updates in real time.'
      },
      {
        question: 'How long does it take to process my order?',
        answer: 'Orders are processed within 1-2 business days. During special drops or Black Friday, it may take 3-5 business days. You’ll be notified of any delays.'
      },
      {
        question: 'Can I cancel or change my order?',
        answer: 'Yes, you can cancel or change your order within 2 hours after purchase, as long as it hasn’t been processed yet. Contact us immediately via WhatsApp or email.'
      },
      {
        question: 'What if my order gets lost?',
        answer: 'If your order is lost by the carrier, we’ll contact them to locate it. If it’s not found within 15 days, we’ll resend it for free or issue a full refund.'
      }
    ],
    shipping: [
      {
        question: 'What are the delivery times?',
        answer: 'Southeast: 3-7 business days | South: 5-9 | Northeast: 7-12 | North/Central-West: 8-15. Times may vary during high-demand periods.'
      },
      {
        question: 'Do you offer international shipping?',
        answer: 'We plan to expand to the US and Europe in 2025. Subscribe to our newsletter to stay updated.'
      },
      {
        question: 'How much is shipping?',
        answer: 'FREE shipping on orders over R$199. Below that: PAC R$15-25 | SEDEX R$25-35. Exact cost is calculated at checkout based on your ZIP code.'
      },
      {
        question: 'Can I choose the shipping carrier?',
        answer: 'Yes! We offer PAC (economical) and SEDEX (faster). In some regions, we also use Jadlog and Total Express for better efficiency.'
      }
    ],
    returns: [
      {
        question: 'What is your return and exchange policy?',
        answer: 'You have 30 days from delivery to request a return or exchange. The item must be unused, with tags and in its original packaging. Manufacturing defects are covered for 90 days.'
      },
      {
        question: 'How do I request a return or exchange?',
        answer: 'Log in to your account, go to "My Orders" and click "Request Return/Exchange". Fill in the form with the reason and attach photos if needed. We’ll respond within 24 hours.'
      },
      {
        question: 'Who pays for the return shipping?',
        answer: 'If the issue is a defect, wrong item or mismatch, we cover the shipping. For size exchanges or cancellations, shipping is the customer’s responsibility (R$15-25).'
      },
      {
        question: 'How long does it take to process a return/exchange?',
        answer: 'Once we receive the item, it’s reviewed in 2-3 business days. Exchanges are shipped within 5 days. Refunds are processed within 7 business days to the original payment method.'
      }
    ],
    payment: [
      {
        question: 'What payment methods do you accept?',
        answer: 'Credit cards (Visa, Master, Elo, Hiper) | Debit cards | PIX (5% off) | Bank slip (boleto) | PayPal. We offer up to 12x interest-free installments on credit cards.'
      },
      {
        question: 'Is your website secure?',
        answer: 'Yes! We use 256-bit SSL encryption and are Shopify-certified. Your data is encrypted, and we never store card information. We’re also PCI DSS certified.'
      },
      {
        question: 'Why was my payment declined?',
        answer: 'It may be due to insufficient funds, incorrect data, or bank security blocks. Double-check your info and try again. If it persists, contact your bank or try another method.'
      },
      {
        question: 'When will my credit card be charged?',
        answer: 'Your card is charged immediately after the order is confirmed. If canceled or refunded, it may take 5-15 business days to appear on your statement depending on your bank.'
      }
    ],
    products: [
      {
        question: 'How do I choose the right size?',
        answer: 'Each item has a detailed size chart. We also provide model measurements for reference. When in doubt, go for the larger size — our fit is oversized.'
      },
      {
        question: 'Do your clothes shrink after washing?',
        answer: 'Our pieces are pre-shrunk, but we recommend cold water washing (max 30°C) and air drying. Avoid tumble drying. Following these steps prevents significant shrinkage.'
      },
      {
        question: 'Are the products original VANADUS?',
        answer: 'We currently curate items that match our aesthetic standards. Our exclusive in-house products will launch in 2025. We guarantee full authenticity and quality.'
      },
      {
        question: 'Do you release seasonal collections?',
        answer: 'Yes! We do monthly drops with limited pieces and seasonal collections. Follow us on Instagram @vanadus.oficial and subscribe to our newsletter for exclusive launches.'
      }
    ],
    account: [
      {
        question: 'How do I create an account?',
        answer: 'Click "Sign In" at the top of the site, then "Create Account". Fill in your details and confirm your email. With an account, you can track orders, save favorites, and access exclusive offers.'
      },
      {
        question: 'I forgot my password, how can I recover it?',
        answer: 'On the login page, click "Forgot Password", enter your email, and you’ll receive a link to reset it. Check your spam/junk folder if you don’t see it.'
      },
      {
        question: 'How can I update my account details?',
        answer: 'Log in, go to "My Profile" and click "Edit Info". You can update your address, phone number, email, and password. Don’t forget to save changes.'
      },
      {
        question: 'How can I contact you?',
        answer: 'WhatsApp: +55 (19) 99999-9999 (Mon-Fri 9am–6pm) | Email: atendimento@vanadus.com | Instagram: @vanadus.oficial | We reply within 2 hours during business hours.'
      }
    ]
  };


  const filteredQuestions = faqData[activeCategory]?.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-[#1C1C1C] py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-red-800 to-purple-800 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <Skull className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent mb-4">
            VANADUS FAQ
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            For the bold and untamed - Find answers to your questions about ordering, shipping, and more
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search FAQ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/50 border border-red-800/30 rounded-lg pl-12 pr-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-black/50 backdrop-blur-sm border border-red-800/30 rounded-lg p-6 shadow-2xl sticky top-8">
              <h3 className="text-xl font-bold text-red-400 mb-6 uppercase tracking-wide">
                Categories
              </h3>
              <div className="space-y-3">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        setActiveCategory(category.id);
                        setActiveQuestion(null);
                      }}
                      className={`w-full text-left p-4 rounded-lg transition-all duration-300 border ${
                        activeCategory === category.id
                          ? `bg-gradient-to-r ${category.color} border-red-600 shadow-lg`
                          : 'bg-gray-800/30 border-gray-700 hover:border-red-600/50 hover:bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <IconComponent className={`h-5 w-5 ${
                          activeCategory === category.id ? 'text-white' : 'text-red-400'
                        }`} />
                        <div>
                          <p className={`font-medium text-sm ${
                            activeCategory === category.id ? 'text-white' : 'text-gray-300'
                          }`}>
                            {category.title}
                          </p>
                          <p className={`text-xs ${
                            activeCategory === category.id ? 'text-gray-200' : 'text-gray-500'
                          }`}>
                            {category.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            <div className="bg-black/50 backdrop-blur-sm border border-red-800/30 rounded-lg shadow-2xl">
              <div className="p-6 border-b border-red-800/30">
                <h2 className="text-2xl font-bold text-white">
                  {categories.find(cat => cat.id === activeCategory)?.title}
                </h2>
                <p className="text-gray-400 mt-2">
                  {categories.find(cat => cat.id === activeCategory)?.description}
                </p>
              </div>

              <div className="p-6">
                {filteredQuestions.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">
                     No questions found for "{searchTerm}"
                    </p>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="mt-4 text-red-400 hover:text-red-300 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredQuestions.map((item, index) => (
                      <div
                        key={index}
                        className="border border-gray-700 rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() => setActiveQuestion(
                            activeQuestion === `${activeCategory}-${index}` 
                              ? null 
                              : `${activeCategory}-${index}`
                          )}
                          className="w-full text-left p-4 bg-gray-800/30 hover:bg-gray-800/50 transition-all duration-300 flex items-center justify-between"
                        >
                          <span className="font-medium text-white pr-4">
                            {item.question}
                          </span>
                          {activeQuestion === `${activeCategory}-${index}` ? (
                            <ChevronUp className="h-5 w-5 text-red-400 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-red-400 flex-shrink-0" />
                          )}
                        </button>
                        {activeQuestion === `${activeCategory}-${index}` && (
                          <div className="p-4 bg-gray-900/50 border-t border-gray-700">
                            <p className="text-gray-300 leading-relaxed">
                              {item.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-black/50 backdrop-blur-sm border border-red-800/30 rounded-lg p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">
              Still need help?
            </h3>
            <p className="text-gray-400">
              Our team is ready to help you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-r from-red-800/20 to-purple-800/20 rounded-lg border border-red-600/30">
              <Phone className="h-8 w-8 text-red-400 mx-auto mb-4" />
              <h4 className="font-bold text-white mb-2">WhatsApp</h4>
              <p className="text-gray-300 text-sm mb-3">(19) 99999-9999</p>
              <p className="text-gray-400 text-xs">Mon-Fri: 9am to 6pm</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-r from-purple-800/20 to-red-800/20 rounded-lg border border-purple-600/30">
              <Mail className="h-8 w-8 text-purple-400 mx-auto mb-4" />
              <h4 className="font-bold text-white mb-2">E-mail</h4>
              <p className="text-gray-300 text-sm mb-3">atendimento@vanadus.com</p>
              <p className="text-gray-400 text-xs">Response within 2 hours</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-r from-red-800/20 to-purple-800/20 rounded-lg border border-red-600/30">
              <Clock className="h-8 w-8 text-red-400 mx-auto mb-4" />
              <h4 className="font-bold text-white mb-2">Opening Hours</h4>
              <p className="text-gray-300 text-sm mb-3">Monday to Friday</p>
              <p className="text-gray-400 text-xs">9am to 6pm</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;