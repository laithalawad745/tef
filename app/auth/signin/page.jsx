'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      setError('حدث خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" >
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-2xl border border-purple-500/20">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-white mb-2">
            تسجيل الدخول
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
            <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
              البريد الإلكتروني
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="appearance-none relative block w-full px-4 py-3 border border-gray-600 bg-gray-700/50 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              placeholder="أدخل بريدك الإلكتروني"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
              كلمة المرور
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="appearance-none relative block w-full px-4 py-3 border border-gray-600 bg-gray-700/50 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              placeholder="أدخل كلمة المرور"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري تسجيل الدخول...
                </div>
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-sm">
              ليس لديك حساب؟{' '}
              <a href="/auth/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200">
                إنشاء حساب جديد
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}