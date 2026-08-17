import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { 
  Home, 
  Heart, 
  Droplets, 
  Building2, 
  Users, 
  MessageCircle, 
  HandHeart,
  AlertTriangle,
  MessageSquare 
} from 'lucide-react';
import Dock from '@/components/Dock';
import { ROUTES } from '@/constants/routes';

export function GlobalDock() {
  const navigate = useNavigate();
  const location = useLocation();

  // Listen for AI Assistant toggle events
  useEffect(() => {
    const handleToggleAI = () => {
      // Dispatch a click event on the AI Assistant button
      const aiButton = document.querySelector('[aria-label="Open AI Assistant"]') as HTMLButtonElement;
      if (aiButton) {
        aiButton.click();
      }
    };

    window.addEventListener('toggleAiAssistant', handleToggleAI);
    return () => window.removeEventListener('toggleAiAssistant', handleToggleAI);
  }, []);

  const dockItems = [
    {
      icon: <Home size={20} />,
      label: 'Home',
      isActive: location.pathname === '/',
      onClick: () => navigate('/'),
    },
    {
      icon: <AlertTriangle size={19} />,
      label: 'Emergency Help',
      isActive: location.pathname === ROUTES.EMERGENCY,
      onClick: () => navigate(ROUTES.EMERGENCY),
    },
    {
      icon: <Droplets size={19} />,
      label: 'Blood Donation',
      isActive: location.pathname === ROUTES.BLOOD_DONATION,
      onClick: () => navigate(ROUTES.BLOOD_DONATION),
    },
    {
      icon: <Building2 size={19} />,
      label: 'Find NGOs',
      isActive: location.pathname === ROUTES.ORGANIZATIONS,
      onClick: () => navigate(ROUTES.ORGANIZATIONS),
    },
    {
      icon: <Users size={19} />,
      label: 'Volunteers',
      isActive: location.pathname === ROUTES.VOLUNTEERS,
      onClick: () => navigate(ROUTES.VOLUNTEERS),
    },
    {
      icon: <MessageSquare size={19} />,
      label: 'Community',
      isActive: location.pathname === ROUTES.COMMUNITY,
      onClick: () => navigate(ROUTES.COMMUNITY),
    },
    {
      icon: <MessageCircle size={19} />,
      label: 'AI Assistant',
      isActive: false, // AI assistant doesn't have a route, it's a floating component
      onClick: () => {
        // Toggle AI Assistant - dispatch the event
        const event = new CustomEvent('toggleAiAssistant');
        window.dispatchEvent(event);
      },
    },
    {
      icon: <HandHeart size={20} />,
      label: 'Donate Now',
      isActive: location.pathname === ROUTES.DONATE,
      onClick: () => navigate(ROUTES.DONATE || '/donate'),
    },
  ];

  return (
    <Dock 
      items={dockItems}
      panelHeight={72}
      baseItemSize={50}
      magnification={70}
      distance={130}
      position="bottom"
    />
  );
}

export default GlobalDock;