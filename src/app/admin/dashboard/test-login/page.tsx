import TestLogin from '../../login/test-login';

export default function TestLoginPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Firebase Test Login</h1>
      <div className="max-w-md mx-auto">
        <TestLogin />
      </div>
    </div>
  );
} 