import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">Sprintlet</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">Agile Ceremonies Made Simple</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Planning Poker Card */}
          <Link href="/poker" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow h-full">
              <div className="text-5xl mb-4">🃏</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Planning Poker
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Collaborative story point estimation with your team in real-time
              </p>
              <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                <li>✓ Real-time voting</li>
                <li>✓ Fibonacci deck</li>
                <li>✓ Team collaboration</li>
                <li>✓ No login required</li>
              </ul>
              <div className="mt-6 text-indigo-600 dark:text-indigo-400 font-medium group-hover:underline">
                Start Session →
              </div>
            </div>
          </Link>

          {/* Capacity Calculator Card */}
          <Link href="/capacity" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow h-full">
              <div className="text-5xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Capacity Calculator
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Calculate your team&apos;s sprint capacity with precision
              </p>
              <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                <li>✓ Multi-location support</li>
                <li>✓ Holiday tracking</li>
                <li>✓ Individual leave tracking</li>
              </ul>
              <div className="mt-6 text-indigo-600 dark:text-indigo-400 font-medium group-hover:underline">
                Calculate Capacity →
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-16 text-center text-gray-500 dark:text-gray-400">
          <p className="text-sm">Simple, fast, and reliable Agile tools for modern teams</p>
        </div>
      </div>
    </div>
  );
}
