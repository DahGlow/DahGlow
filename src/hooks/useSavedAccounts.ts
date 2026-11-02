import { useEffect,useState } from 'react';
import { toast } from 'sonner';
import { listAccounts,type SavedAccount } from '@/lib/accountVault';
export function useSavedAccounts(){const [accounts,setAccounts]=useState<SavedAccount[]>([]);const [loading,setLoading]=useState(true);useEffect(()=>{let active=true;const refresh=()=>void listAccounts().then(list=>{if(active){setAccounts(list);setLoading(false);}}).catch(()=>{if(active){setLoading(false);toast.error('Your browser could not open saved accounts. Use regular sign in.');}});refresh();window.addEventListener('dg-accounts-updated',refresh);return()=>{active=false;window.removeEventListener('dg-accounts-updated',refresh);};},[]);return {accounts,loading};}
