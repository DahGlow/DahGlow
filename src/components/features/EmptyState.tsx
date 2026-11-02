import { Link } from 'react-router-dom';
import { ShoppingBag,Heart } from 'lucide-react';
import { useShop } from '@/hooks/useShop';
interface Props {title:string;description:string;heart?:boolean;}
export default function EmptyState({title,description,heart=false}:Props){const {t}=useShop();return <div className="empty-state"><div className="empty-illustration">{heart?<Heart size={48} strokeWidth={1}/>:<ShoppingBag size={48} strokeWidth={1}/>}<span>✧</span></div><h2>{t(title)}</h2><p>{t(description)}</p><Link className="primary-button" to="/">{t('Start shopping')}</Link></div>;}
