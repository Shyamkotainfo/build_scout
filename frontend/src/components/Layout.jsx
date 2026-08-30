import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { HealthProvider } from '../contexts/HealthContext';
import { DataProvider } from '../contexts/DataContext';

const Layout = () => {
  return (
    <HealthProvider>
      <DataProvider>
        <div className="flex h-screen overflow-hidden bg-[var(--bs-bg-secondary)]">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Navbar />
            <main className="flex-1 overflow-y-auto bg-[var(--bs-bg-secondary)] p-6">
              <Outlet />
            </main>
          </div>
        </div>
      </DataProvider>
    </HealthProvider>
  );
};

export default Layout;
