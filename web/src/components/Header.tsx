import { Eye } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-8 w-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Bogle's Eye</h1>
        </div>
        <div className="text-sm text-gray-500">
          Low-cost Index Fund Tracker
        </div>
      </div>
    </header>
  );
}
