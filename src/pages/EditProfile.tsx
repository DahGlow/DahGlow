import { Link } from 'react-router-dom';
import { ChevronRight,QrCode } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import PageHeader from '@/components/layout/PageHeader';
export default function EditProfile(){const {user}=useAuth();return <main className="settings-page"><PageHeader title="Edit Profile"/>{user?<><section className="settings-section"><div className="settings-row"><Link to="/account/profile/username"><span>Nickname</span><span className="settings-value">{user.username}</span><ChevronRight size={20}/></Link></div><div className="settings-row"><Link to="/account/profile/qr"><span>My QR Code</span><QrCode size={22}/><ChevronRight size={20}/></Link></div></section><p className="profile-privacy">Your account email and orders remain private. Your QR code contains only your Dah Glow member ID.</p></>:<Link to="/login" className="primary-button">Sign in to edit your profile</Link>}</main>;}
