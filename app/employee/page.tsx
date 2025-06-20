export default function EmployeeDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-green-950 dark:via-gray-900 dark:to-green-900">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Employee Dashboard
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 text-center">
          Find jobs, apply for opportunities, and earn money from one-time tasks.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-12">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-green-600 dark:text-green-400">
              Browse Jobs
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Find local one-time jobs that match your skills and schedule.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-green-600 dark:text-green-400">
              My Applications
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Track your job applications and manage interviews.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-green-600 dark:text-green-400">
              Earnings
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              View your earnings and payment history.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 