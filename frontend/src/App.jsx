import { BrowserRouter, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Login from './pages/Login';
import { LayoutDashboard, Shield, Bell, Search, UserCircle, Settings, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { Toaster } from 'react-hot-toast';

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  
  const navItems = role === 'admin' 
    ? [{ name: 'Admin Portal', path: '/admin', icon: Shield }]
    : [{ name: 'Dashboard', path: '/', icon: LayoutDashboard }];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-white text-slate-800 flex flex-col hidden md:flex border-r border-slate-200">
      <div className="p-6">
        <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center gap-2">
          <Shield className="text-blue-600" />
          TrustFinance
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                isActive 
                  ? "bg-blue-50 text-blue-700 border border-blue-200" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-200 mt-auto space-y-2">
        <button className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-slate-900 w-full rounded-xl hover:bg-slate-50 transition-colors">
          <Settings size={20} />
          Settings
        </button>
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 w-full rounded-xl transition-colors">
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
}

function Topbar() {
  const role = localStorage.getItem('role');
  
  return (
    <header className="bg-white border-b border-slate-200 h-20 px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center bg-slate-100 rounded-full px-4 py-2 w-96 border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
        <Search className="text-slate-400 mr-2" size={20} />
        <input 
          type="text" 
          placeholder="Search transactions, users, or alerts..." 
          className="bg-transparent border-none outline-none w-full text-slate-700 text-sm"
        />
      </div>
      <div className="flex items-center gap-6">
        <button className="relative text-slate-500 hover:text-slate-700 transition-colors">
          <Bell size={24} />
          <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="flex items-center gap-3 border-l border-slate-200 pl-6 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors capitalize">{role} Account</p>
          </div>
          <UserCircle size={40} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
        </div>
      </div>
    </header>
  );
}

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to={role === 'admin' ? '/admin' : '/'} replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto flex flex-col">
        <Topbar />
        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute allowedRole="user">
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRole="admin">
                <Admin />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
