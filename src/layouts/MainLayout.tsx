import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header will go here in Phase 3 */}
      <header className="p-4 border-b border-gray-200">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold">Website Header Placeholder</h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4">
        <Outlet />
      </main>

      {/* Footer will go here in Phase 3 */}
      <footer className="p-4 border-t border-gray-200 mt-auto">
        <div className="container mx-auto">
          <p>Website Footer Placeholder</p>
        </div>
      </footer>
    </div>
  );
}
