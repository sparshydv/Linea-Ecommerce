import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/context/CartContext';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useCart();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setLocalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!formData.email || !formData.password) {
      setLocalError('Email and password are required');
      return;
    }

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setLocalError((err as any).message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md mx-auto px-6">
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-light text-foreground mb-2">Welcome Back</h1>
              <p className="text-muted-foreground">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {(error || localError) && (
                <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {error || localError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-light">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="rounded-none"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-light">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="•••••••"
                  className="rounded-none"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full rounded-none h-12"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {googleEnabled && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="h-px flex-1 bg-border" />
                  <span>or</span>
                  <span className="h-px flex-1 bg-border" />
                </div>
                <GoogleLoginButton
                  onSuccess={() => navigate('/')}
                  onError={message => setLocalError(message)}
                />
              </div>
            )}

            <div className="text-center">
              <p className="text-muted-foreground text-sm">
                Don't have an account?{' '}
                <Link to="/auth/register" className="text-foreground hover:underline font-light">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
