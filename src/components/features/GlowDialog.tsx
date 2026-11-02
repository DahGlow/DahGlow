// Radix-backed shadcn-style wrapper; this project has no installed local ui/dialog file.
import { forwardRef,type ElementRef,type ComponentPropsWithoutRef } from 'react';
import * as Primitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export const Dialog=Primitive.Root;
export const DialogTitle=Primitive.Title;
export const DialogDescription=Primitive.Description;
export const DialogContent=forwardRef<ElementRef<typeof Primitive.Content>,ComponentPropsWithoutRef<typeof Primitive.Content>>(({className='',children,...props},ref)=><Primitive.Portal><Primitive.Overlay className="glow-dialog-overlay"/><Primitive.Content ref={ref} className={`glow-dialog-content ${className}`} {...props}>{children}<Primitive.Close className="dialog-close icon-button" aria-label="Close"><X size={22}/></Primitive.Close></Primitive.Content></Primitive.Portal>);
DialogContent.displayName='DialogContent';
