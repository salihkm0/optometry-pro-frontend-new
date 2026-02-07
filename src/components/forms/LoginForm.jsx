import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Phone } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';

export default function LoginForm({ onSubmit, isLoading }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email');

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    defaultValues: {
      email: '',
      phone: '',
      password: ''
    }
  });

  const handleMethodChange = (method) => {
    setLoginMethod(method);
    if (method === 'email') {
      setValue('phone', '');
    } else {
      setValue('email', '');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex rounded-md shadow-sm mb-4">
        <button
          type="button"
          onClick={() => handleMethodChange('email')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-md transition-colors ${
            loginMethod === 'email'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Mail className="inline-block w-4 h-4 mr-2" />
          Email
        </button>
      </div>

        <Input
          label="Email address"
          type="email"
          leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
          error={errors.email?.message}
          required
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          })}
        />
       ) 
     

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
            Forgot your password?
          </a>
        </div>
      </div>

      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full"
      >
        Sign in
      </Button>
    </form>
  );
}