import { createContext,useContext,type ReactNode } from 'react';
import { useQuery,useQueryClient,useMutation } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { clearProductCache } from '@/lib/productCache';
import { invoke } from '@/lib/shopify';
import type { AdminSession } from '@/types/admin';

interface Context{session:AdminSession;segment:string;}
const AdminContext=createContext<Context>(null!);
export function AdminProvider({children,session,segment}:{children:ReactNode;session:AdminSession;segment:string}){return <AdminContext.Provider value={{session,segment}}>{children}</AdminContext.Provider>;}
export const useAdmin=()=>useContext(AdminContext);
export function useAdminEntry(){const {user,loading}=useAuth();const {segment}=useParams();const query=useQuery({queryKey:['admin-entry',user?.id,segment],queryFn:()=>invoke<AdminSession>('dah-glow-admin',{op:'session',segment}),enabled:!!user&&!loading,retry:false,gcTime:0,staleTime:0,refetchInterval:30000});return {...query,authLoading:loading,user,segment:segment||''};}
export function useAdminData<T>(op:string,input:Record<string,unknown>={},poll=false,enabled=true){const {user}=useAuth();return useQuery({queryKey:['admin-data',user?.id,op,input],queryFn:()=>invoke<T>('dah-glow-admin',{op,...input}),enabled:!!user&&enabled,gcTime:0,staleTime:0,retry:false,refetchInterval:poll?30000:false});}
export function useAdminMutation(){const client=useQueryClient();return useMutation({mutationFn:(body:Record<string,unknown>)=>invoke<Record<string,unknown>>('dah-glow-admin',body),onSuccess:(data)=>{clearProductCache();void client.invalidateQueries({queryKey:['public-store-settings']});void client.invalidateQueries({queryKey:['admin-data']});void client.invalidateQueries({queryKey:['shopify']});toast.success(typeof data.message==='string'?data.message:'Changes saved');},onError:(error:Error)=>toast.error(error.message)});}
