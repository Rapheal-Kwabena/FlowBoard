import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Trello, Mail, Lock } from 'lucide-react';
import AnimatedButton from '../Layout/AnimatedButton';
import TwoFactorAuthVerify from './TwoFactorAuthVerify';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const { login, loginWithProvider, is2FARequired, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const handleProviderLogin = async (provider: 'google' | 'microsoft') => {
    try {
      setOauthLoading(provider);
      setError('');
      await loginWithProvider(provider);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || `Failed to login with ${provider}`);
    } finally {
      setOauthLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      if (!is2FARequired) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {is2FARequired ? (
          <TwoFactorAuthVerify onSuccess={() => navigate('/dashboard')} />
        ) : (
          <>
            <div className="text-center">
              <div className="flex justify-center">
                <Trello className="w-12 h-12 text-blue-600" />
              </div>
              <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">Welcome to FlowBoard</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Sign in to your account</p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="text-red-600 dark:text-red-400 text-sm text-center">{error}</div>
                  )}

                  <AnimatedButton
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </AnimatedButton>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <AnimatedButton
                      onClick={() => handleProviderLogin('google')}
                      disabled={oauthLoading !== null || authLoading}
                      className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {oauthLoading === 'google' ? (
                        <div className="w-5 h-5 mr-2 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                      ) : (
                        <img src="/google.svg" alt="Google" className="w-5 h-5 mr-2" />
                      )}
                      {oauthLoading === 'google' ? 'Connecting...' : 'Google'}
                    </AnimatedButton>
                    <AnimatedButton
                      onClick={() => handleProviderLogin('microsoft')}
                      disabled={oauthLoading !== null || authLoading}
                      className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {oauthLoading === 'microsoft' ? (
                        <div className="w-5 h-5 mr-2 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                      ) : (
                        <img src="/microsoft.svg" alt="Microsoft" className="w-5 h-5 mr-2" />
                      )}
                      {oauthLoading === 'microsoft' ? 'Connecting...' : 'Microsoft'}
                    </AnimatedButton>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                      Sign up
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginForm;