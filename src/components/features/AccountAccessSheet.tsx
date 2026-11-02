import { Link } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';
import BottomSheet from '@/components/features/BottomSheet';

interface Props{open:boolean;onClose:()=>void;}
export default function AccountAccessSheet({open,onClose}:Props){return <BottomSheet title="Can’t access your account?" open={open} onClose={onClose}><div className="account-access-options"><section><h2><LockKeyhole size={22}/>Forgot Password</h2><p>Verify your email with a code, then set and confirm a new password.</p><Link to="/account/reset-password" className="primary-button" onClick={onClose}>Reset Password</Link></section><section><h2><LockKeyhole size={22}/>Recover Account</h2><p>Recover access using your email. Order lookup requires matching email and a verification code.</p><Link to="/account/recovery" className="order-secondary-button" onClick={onClose}>Recover Account</Link></section></div></BottomSheet>;}
