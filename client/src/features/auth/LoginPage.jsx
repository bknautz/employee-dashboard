import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { loginSchema } from './authSchemas';
import { useAuth } from '../../context/useAuth';

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
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Log in</h1>

      <label htmlFor="email">Email</label>
      <input id="email" type="email" {...register('email')} />
      {errors.email && <p>{errors.email.message}</p>}

      <label htmlFor="password">Password</label>
      <input id="password" type="password" {...register('password')} />
      {errors.password && <p>{errors.password.message}</p>}

      {errors.root && <p>{errors.root.message}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Log in'}
      </button>

      <p>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </form>
  );
}

export default LoginPage;
