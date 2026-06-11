import { Outlet } from 'react-router-dom';
import Header from './Header';
import BackToTop from './BackToTop';

export default function Layout() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-16">
        <Outlet />
      </main>
      <BackToTop />
    </div>
  );
}
