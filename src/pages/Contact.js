import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import emailjs from 'emailjs-com';
import { Send, Mail, Phone, MapPin, Clock, Instagram, Skull, Paperclip, CheckCircle, AlertCircle } from 'lucide-react';

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: '',
    files: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const subjectOptions = [
    { value: '', label: 'Select a subject' },
    { value: 'pedido', label: 'Order inquiries' },
    { value: 'produto', label: 'Product information' },
    { value: 'troca', label: 'Return or exchange' },
    { value: 'pagamento', label: 'Payment issues' },
    { value: 'entrega', label: 'Shipping questions' },
    { value: 'sugestao', label: 'Suggestions' },
    { value: 'parceria', label: 'Partnerships & collaborations' },
    { value: 'outro', label: 'Other topics' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      files: files
    }));
  };

  const handleNavigation = (page) => {
    navigate(`/${page}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const templateParams = {
        from_name: formData.fullName,
        from_email: formData.email,
        subject: formData.subject,
        message: [formData.message, "", formData.fullName, "", formData.email],
        to_email: 'vanadusco@gmail.com',
      };

      await emailjs.send(
        'service_6tklno8',
        'template_2vz1vnm',
        templateParams,
        'e2mKhZm5a6Rsr-_03'
      );

      setFormData({
        fullName: '',
        email: '',
        subject: '',
        message: '',
        files: [],
      });

      const fileInput = document.getElementById('file-input');
      if (fileInput) fileInput.value = '';

      setSubmitStatus('success');
    } catch (error) {
      console.error('Failed to send message:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-red-800 to-purple-800 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <Skull className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent mb-4">
            CONTACT US
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            For the bold and untamed — We're here to help with any questions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-black/50 backdrop-blur-sm border border-red-800/30 rounded-lg p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-red-400 mb-6 uppercase tracking-wide">
                Contact Information
              </h3>

              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-red-800/20 p-3 rounded-lg">
                    <Mail className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Email</h4>
                    <p className="text-gray-300 text-sm">vanadusco@gmail.com</p>
                    <p className="text-gray-500 text-xs">Response within 24h</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-purple-800/20 p-3 rounded-lg">
                    <Phone className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">WhatsApp</h4>
                    <p className="text-gray-300 text-sm">(19) 99999-9999</p>
                    <p className="text-gray-500 text-xs">Mon–Fri: 9am to 6pm</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-red-800/20 p-3 rounded-lg">
                    <Instagram className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Instagram</h4>
                    <p className="text-gray-300 text-sm">@vanadus.oficial</p>
                    <p className="text-gray-500 text-xs">DMs always open</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-purple-800/20 p-3 rounded-lg">
                    <Clock className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Hours</h4>
                    <p className="text-gray-300 text-sm">Monday to Friday</p>
                    <p className="text-gray-500 text-xs">9am to 6pm (Brasília time)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black/50 backdrop-blur-sm border border-red-800/30 rounded-lg p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-purple-400 mb-4 uppercase tracking-wide">
                Quick Tip
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                To speed up support, have your order number or relevant info ready. This helps us resolve your issue faster.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-black/50 backdrop-blur-sm border border-red-800/30 rounded-lg shadow-2xl">
              <div className="p-6 border-b border-red-800/30">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Send Us a Message
                </h2>
                <p className="text-gray-400">
                  Fill out the form below and we'll get back to you as soon as possible
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-red-400 text-sm font-bold mb-2 uppercase tracking-wide">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300"
                    placeholder="Your full name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-red-400 text-sm font-bold mb-2 uppercase tracking-wide">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300"
                    placeholder="your@email.com"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-red-400 text-sm font-bold mb-2 uppercase tracking-wide">
                    Subject *
                  </label>
                  <select
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300"
                  >
                    {subjectOptions.map((option) => (
                      <option key={option.value} value={option.value} className="bg-gray-800">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-red-400 text-sm font-bold mb-2 uppercase tracking-wide">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="6"
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 resize-none"
                    placeholder="Describe your issue or message in detail..."
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-red-400 text-sm font-bold mb-2 uppercase tracking-wide">
                    Attach Files
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="file-input"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx"
                    />
                    <label
                      htmlFor="file-input"
                      className="flex items-center justify-center w-full bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-lg px-4 py-6 text-gray-400 hover:border-red-500 hover:text-red-400 transition-all duration-300 cursor-pointer"
                    >
                      <Paperclip className="h-5 w-5 mr-2" />
                      <span>Click to attach files (max. 10MB)</span>
                    </label>
                  </div>
                  {formData.files.length > 0 && (
                    <div className="mt-2 text-sm text-gray-400">
                      {formData.files.length} file(s) selected
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Accepted formats: JPG, PNG, PDF, DOC, DOCX. Max size: 10MB
                  </p>
                </div>

                {/* Submit Status */}
                {submitStatus === 'success' && (
                  <div className="flex items-center space-x-2 text-green-400 bg-green-400/10 border border-green-400/30 rounded-lg p-3">
                    <CheckCircle className="h-5 w-5" />
                    <span>Message sent successfully! We’ll reply soon.</span>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="flex items-center space-x-2 text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg p-3">
                    <AlertCircle className="h-5 w-5" />
                    <span>Error sending message. Please try again or use another contact method.</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-red-800 to-purple-800 hover:from-red-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-red-800/50 border border-red-600 uppercase tracking-wide flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>

                {/* Privacy Notice */}
                <p className="text-xs text-gray-500 text-center">
                  This site is protected by reCAPTCHA and the{' '}
                  <span className="text-red-400 hover:text-red-300 cursor-pointer">Privacy Policy</span>
                  {' '}and{' '}
                  <span className="text-red-400 hover:text-red-300 cursor-pointer">Terms of Service</span>
                  {' '}apply.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Link */}
        <div className="mt-12 text-center">
          <div className="bg-black/50 backdrop-blur-sm border border-red-800/30 rounded-lg p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">
              Didn't find what you were looking for?
            </h3>
            <p className="text-gray-400 mb-6">
              Check our FAQ section for quick answers
            </p>
            <button 
              onClick={() => handleNavigation("faq")}
              className="bg-gradient-to-r from-purple-800 to-red-800 hover:from-purple-700 hover:to-red-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-800/50 border border-purple-600 uppercase tracking-wide">
              View FAQ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;