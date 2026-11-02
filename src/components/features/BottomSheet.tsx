import { Dialog,DialogContent,DialogTitle,DialogDescription } from '@/components/features/GlowDialog';
import type { ReactNode } from 'react';

interface Props{open:boolean;onClose:()=>void;title:string;children:ReactNode;}
export default function BottomSheet({open,onClose,title,children}:Props){return <Dialog open={open} onOpenChange={onClose}><DialogContent className="dah-bottom-sheet"><div className="sheet-handle"/><DialogTitle className="sheet-title">{title}</DialogTitle><DialogDescription className="sr-only">View details and close to return to the page.</DialogDescription><div className="sheet-body">{children}</div></DialogContent></Dialog>;}
