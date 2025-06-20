export default function EmployerDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-purple-950 dark:via-gray-900 dark:to-purple-900">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Employer Dashboard
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 text-center">
          Post jobs, find talented teens, and manage your hiring process.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-12">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-purple-600 dark:text-purple-400">
              Post a Job
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Create job listings for one-time tasks and projects.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-purple-600 dark:text-purple-400">
              Manage Applications
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Review and manage applications from teens.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-purple-600 dark:text-purple-400">
              Payment System
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Secure payment processing for completed tasks.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 