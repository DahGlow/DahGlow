import type { ReactNode } from 'react';
import { Dialog,DialogContent,DialogTitle,DialogDescription } from '@/components/ui/dialog';
interface Props {open:boolean;onClose:()=>void;title:string;children:ReactNode;}
export default function InfoModal({open,onClose,title,children}:Props){return <Dialog open={open} onOpenChange={value=>!value&&onClose()}><DialogContent className="glow-modal"><DialogTitle className="text-2xl font-semibold">{title}</DialogTitle><DialogDescription className="sr-only">Dah Glow information</DialogDescription><div className="modal-body">{children}</div></DialogContent></Dialog>;}
