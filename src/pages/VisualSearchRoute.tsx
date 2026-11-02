import { useAuth } from '@/hooks/useAuth';
import VisualSearch from '@/pages/VisualSearch';

export default function VisualSearchRoute(){const {user}=useAuth();return <VisualSearch key={user?.id||'guest'}/>;}
