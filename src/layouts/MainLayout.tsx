import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AiAssistant } from '@/components/common/AiAssistant';
import { GlobalDock } from '@/components/common/GlobalDock';

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-ds-background text-ds-foreground transition-colors duration-ds-normal">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <AiAssistant />
      <GlobalDock />
    </div>
  );
}
