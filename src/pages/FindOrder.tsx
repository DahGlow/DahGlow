import { useState } from 'react';
import { FileText,Phone,Mail,CreditCard,ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/layout/PageHeader';
import BottomSheet from '@/components/features/BottomSheet';
import FindOrderForm from '@/components/forms/FindOrderForm';

export default function FindOrder(){const [open,setOpen]=useState(false);return <main className="standard-page find-order-page"><PageHeader title="Find Order"/><p>Select one of the following ways to find your order.</p><div className="find-order-options"><button onClick={()=>setOpen(true)}><FileText/><span>Provide <strong>Order/Tracking Number</strong> to find order</span><ChevronRight/></button><button onClick={()=>toast.info('Phone number lookup will be available soon.')}><Phone/><span>Provide <strong>Phone Number</strong> to find order</span><ChevronRight/></button><button onClick={()=>toast.info('Email address lookup will be available soon.')}><Mail/><span>Provide <strong>Email Address</strong> to find order</span><ChevronRight/></button><button onClick={()=>toast.info('Payment information lookup will be available soon. Never submit card details here.')}><CreditCard/><span>Provide <strong>Payment information</strong> to find order</span><ChevronRight/></button></div><BottomSheet open={open} onClose={()=>setOpen(false)} title="Find Order"><FindOrderForm/></BottomSheet></main>;}
