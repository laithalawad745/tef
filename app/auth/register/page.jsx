'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';

export default function Register() {
  const { t, isRTL } = useLanguage();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    botToken: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.register.errors.passwordMismatch'));
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          botToken: formData.botToken
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(t('auth.register.success'));
        router.push('/auth/signin');
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError(t('auth.register.errors.general'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#1a0a33'}}>
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-2xl border border-purple-500/20">
        <div>
          <h2 className={`text-center text-3xl font-extrabold text-white mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('auth.register.title')}
          </h2>
          <div className="w-44 h-1 bg-gradient-to-r from-purple-600 to-blue-500 mx-auto rounded-full"></div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg backdrop-blur-sm">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="email" className={`block text-sm font-medium text-gray-200 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('auth.register.email')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              dir={isRTL ? 'rtl' : 'ltr'}
              className="appearance-none relative block w-full px-4 py-3 border border-gray-600 bg-gray-700/50 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              placeholder={t('auth.register.emailPlaceholder')}
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label htmlFor="botToken" className={`block text-sm font-medium text-gray-200 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('auth.register.botToken')}
            </label>
            <input
              id="botToken"
              name="botToken"
              type="text"
              required
              dir="ltr"
              className="appearance-none relative block w-full px-4 py-3 border border-gray-600 bg-gray-700/50 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
              value={formData.botToken}
              onChange={(e) => setFormData({...formData, botToken: e.target.value})}
            />
            <p className={`text-xs text-gray-400 mt-2 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('auth.register.botTokenHelp')}
            </p>
          </div>
          
          <div>
            <label htmlFor="password" className={`block text-sm font-medium text-gray-200 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('auth.register.password')}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              dir={isRTL ? 'rtl' : 'ltr'}
              className="appearance-none relative block w-full px-4 py-3 border border-gray-600 bg-gray-700/50 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              placeholder={t('auth.register.passwordPlaceholder')}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className={`block text-sm font-medium text-gray-200 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('auth.register.confirmPassword')}
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              dir={isRTL ? 'rtl' : 'ltr'}
              className="appearance-none relative block w-full px-4 py-3 border border-gray-600 bg-gray-700/50 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              placeholder={t('auth.register.confirmPasswordPlaceholder')}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
            >
              {loading ? (
                <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <svg className={`animate-spin ${isRTL ? 'mr-3 ml-0' : '-ml-1 mr-3'} h-5 w-5 text-white`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('auth.register.submitting')}
                </div>
              ) : (
                t('auth.register.submit')
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-sm">
              {t('auth.register.haveAccount')}{' '}
              <Link href="/auth/signin" className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200">
                {t('auth.register.signin')}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}