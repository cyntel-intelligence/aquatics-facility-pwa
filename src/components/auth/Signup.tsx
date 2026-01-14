import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Waves } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

export const Signup = () => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const { displayName, email, password, confirmPassword } = formData;

    if (!displayName || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await signup(email, password, displayName);
      toast.success('Account created successfully! Please wait for admin approval.');
      navigate('/dashboard');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email is already in use');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password is too weak');
      } else {
        toast.error(error.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-primary-100 p-3 rounded-full mb-4">
              <Waves className="h-10 w-10 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-600 mt-2">Join your aquatics team</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              type="text"
              name="displayName"
              label="Full Name"
              value={formData.displayName}
              onChange={handleChange}
              placeholder="John Doe"
              required
              autoComplete="name"
            />

            <Input
              type="email"
              name="email"
              label="Email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />

            <Input
              type="password"
              name="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              helperText="At least 6 characters"
            />

            <Input
              type="password"
              name="confirmPassword"
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />

            <Button type="submit" loading={loading} className="w-full">
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-white text-sm mt-6">
          © 2026 Aquatics Facility Manager
        </p>
      </div>
    </div>
  );
};
