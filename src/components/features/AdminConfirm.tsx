import { Dialog,DialogContent,DialogTitle,DialogDescription } from '@/components/features/GlowDialog';

interface Props{open:boolean;title:string;description:string;busy:boolean;onClose:()=>void;onConfirm:()=>void;}
export default function AdminConfirm({open,title,description,busy,onClose,onConfirm}:Props){return <Dialog open={open} onOpenChange={onClose}><DialogContent className="admin-confirm"><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription><div className="admin-actions"><button className="admin-button secondary" disabled={busy} onClick={onClose}>Cancel</button><button className="admin-button" disabled={busy} onClick={onConfirm}>{busy?'Saving…':'Confirm change'}</button></div></DialogContent></Dialog>;}
