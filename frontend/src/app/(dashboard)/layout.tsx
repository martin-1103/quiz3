'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, BookOpen, Brain, BarChart3, Settings, LogOut, Menu, X } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    
    setUser(JSON.parse(userData));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Question Banks', href: '/dashboard/question-banks', icon: BookOpen },
    { name: 'AI Assistant', href: '/dashboard/ai-assistant', icon: Brain },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent navigation={navigation} pathname={pathname} user={user} onLogout={handleLogout} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent navigation={navigation} pathname={pathname} user={user} onLogout={handleLogout} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <button
              type="button"
              className="lg:hidden -ml-2 p-2 text-gray-400 hover:text-gray-500"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user.name || user.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ navigation, pathname, user, onLogout }: any) {
  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="flex items-center h-16 px-4 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-900">Quiz Platform</h1>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item: any) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-blue-100 text-blue-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 ${
                  isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3 w-full">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.name || user.email}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {user.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
