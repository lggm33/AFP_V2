// Main Dashboard Component
import { useAuth } from '@/stores/authStore';

export function Dashboard() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">💰</span>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">AFP Finance</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {user?.user_metadata?.avatar_url && (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                  />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {user?.user_metadata?.full_name || user?.email}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to your Financial Dashboard!
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Your AI-powered personal finance management system is ready.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-3xl">💸</span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Transactions</h3>
                      <p className="text-sm text-gray-500">AI-powered email analysis</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-3xl">📊</span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Budget</h3>
                      <p className="text-sm text-gray-500">Smart budget tracking</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-3xl">📧</span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Email Accounts</h3>
                      <p className="text-sm text-gray-500">Connect your banks</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  🎉 <strong>Authentication successful!</strong> You're now logged in with Google.
                  Next steps: Connect your email accounts to start analyzing transactions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
