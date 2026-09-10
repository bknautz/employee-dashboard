import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { loginSchema } from './authSchemas';
import { useAuth } from '../../context/useAuth';
import { inputClass } from '../../utils/formStyles';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      navigate('/');
    } catch (err) {
      setError('root', {
        message: err.response?.data?.error || 'Login failed',
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight text-fg">Welcome back</h1>
        <p className="mb-8 text-sm text-fg-muted">Log in to your dashboard.</p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-lg border border-border bg-surface p-6"
        >
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-fg">
              Email
            </label>
            <input id="email" type="email" {...register('email')} className={inputClass} />
            {errors.email && <p className="mt-1 text-xs text-warn">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-fg">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register('password')}
              className={inputClass}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-warn">{errors.password.message}</p>
            )}
          </div>

          {errors.root && <p className="text-sm text-warn">{errors.root.message}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-fg-muted">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent hover:text-accent-hover">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
