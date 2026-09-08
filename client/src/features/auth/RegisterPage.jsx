import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { registerSchema } from './authSchemas';
import { useAuth } from '../../context/useAuth';

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
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Register</h1>

      <label htmlFor="name">Name</label>
      <input id="name" type="text" {...register('name')} />
      {errors.name && <p>{errors.name.message}</p>}

      <label htmlFor="email">Email</label>
      <input id="email" type="email" {...register('email')} />
      {errors.email && <p>{errors.email.message}</p>}

      <label htmlFor="password">Password</label>
      <input id="password" type="password" {...register('password')} />
      {errors.password && <p>{errors.password.message}</p>}

      <label htmlFor="role">Role</label>
      <select id="role" {...register('role')}>
        <option value="employee">Employee</option>
        <option value="manager">Manager</option>
        <option value="admin">Admin</option>
      </select>
      {errors.role && <p>{errors.role.message}</p>}

      {errors.root && <p>{errors.root.message}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Registering...' : 'Register'}
      </button>

      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </form>
  );
}

export default RegisterPage;
