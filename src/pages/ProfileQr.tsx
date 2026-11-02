import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/hooks/useAuth';
import PageHeader from '@/components/layout/PageHeader';

export default function ProfileQr(){const {user}=useAuth();return <main className="standard-page account-auth-page"><PageHeader title="My QR Code"/><section className="profile-qr">{user?<><h1>{user.username}</h1><QRCodeSVG value={`dahglow:member:${user.id}`} size={224} level="M" marginSize={4}/><p>DAH GLOW MEMBER</p><small>No email, password, session token or order details are encoded.</small></>:<p>Sign in to see your member QR code.</p>}</section></main>;}
