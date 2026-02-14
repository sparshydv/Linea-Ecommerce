import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

const GoogleLoginButton = ({ onSuccess, onError }: GoogleLoginButtonProps) => {
  const { loginWithGoogle } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  const login = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async ({ code }) => {
      try {
        setIsLoading(true);
        await loginWithGoogle(code);
        onSuccess?.();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Google sign-in failed';
        onError?.(message);
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      onError?.('Google sign-in failed');
    },
  });

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full rounded-none h-12"
      onClick={() => login()}
      disabled={isLoading}
    >
      {isLoading ? 'Connecting...' : 'Continue with Google'}
    </Button>
  );
};

export default GoogleLoginButton;
