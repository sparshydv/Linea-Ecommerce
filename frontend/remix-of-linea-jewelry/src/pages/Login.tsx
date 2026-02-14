import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/context/CartContext';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import heroImage from '@/assets/hero-image.png';

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
    <div className="min-h-screen bg-background grid md:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-md space-y-8">
          <div>
            <Link to="/" className="text-2xl font-light text-foreground hover:opacity-80 transition-opacity">
              LINEA
            </Link>
          </div>

          <div>
            <h1 className="text-3xl font-normal text-foreground mb-2">Login account</h1>
            <p className="text-muted-foreground font-light">Welcome back, login to continue.</p>
          </div>

          <div className="space-y-4">
            {googleEnabled && (
              <>
                <GoogleLoginButton
                  onSuccess={() => navigate('/')}
                  onError={message => setLocalError(message)}
                />
                
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="h-px flex-1 bg-border" />
                  <span className="font-light">OR</span>
                  <span className="h-px flex-1 bg-border" />
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {(error || localError) && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm font-light">
                  {error || localError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-light">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  className="h-11 font-light"
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
                  placeholder="Input your password"
                  className="h-11 font-light"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 font-normal"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login Account'}
              </Button>
            </form>

            <div className="text-center pt-2">
              <p className="text-sm font-light text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/auth/register" className="text-foreground hover:underline">
                  Sign-up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden md:block relative">
        <img 
          src={heroImage} 
          alt="LINEA Jewelry Collection" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light mb-4 drop-shadow-lg">
              Discover timeless
            </h2>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light drop-shadow-lg">
              elegance
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
