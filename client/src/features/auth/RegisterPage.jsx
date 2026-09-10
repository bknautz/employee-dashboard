import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { registerSchema } from './authSchemas';
import { useAuth } from '../../context/useAuth';
import { inputClass } from '../../utils/formStyles';

function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'employee' },
  });

  const onSubmit = async (data) => {
    try {
      await registerUser(data.name, data.email, data.password, data.role);
      navigate('/');
    } catch (err) {
      setError('root', {
        message: err.response?.data?.error || 'Registration failed',
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight text-fg">Create an account</h1>
        <p className="mb-8 text-sm text-fg-muted">Set up your dashboard access.</p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-lg border border-border bg-surface p-6"
        >
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-fg">
              Name
            </label>
            <input id="name" type="text" {...register('name')} className={inputClass} />
            {errors.name && <p className="mt-1 text-xs text-warn">{errors.name.message}</p>}
          </div>

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

          <div>
            <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-fg">
              Role
            </label>
            <select id="role" {...register('role')} className={inputClass}>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && <p className="mt-1 text-xs text-warn">{errors.role.message}</p>}
          </div>

          {errors.root && <p className="text-sm text-warn">{errors.root.message}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-fg-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:text-accent-hover">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
