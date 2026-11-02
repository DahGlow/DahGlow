import { createContext,useContext,useState,useEffect,useRef,type ReactNode } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/api';
import { mapUser,exchangeCodeOnce } from '@/lib/auth';
import type { AuthUser } from '@/types/shop';
interface AuthContextType { user:AuthUser|null; loading:boolean; signIn:(email:string,password:string)=>Promise<boolean>; sendOtp:(email:string)=>Promise<boolean>; verify:(email:string,otp:string,password:string)=>Promise<boolean>; logout:()=>Promise<void>; social:(provider:'google'|'apple')=>Promise<void>; callback:(code:string)=>Promise<string|null>; }
const AuthContext=createContext<AuthContextType>(null!);
export function AuthProvider({children}:{children:ReactNode}) {
const [user,setUser]=useState<AuthUser|null>(null); const [loading,setLoading]=useState(true); const popupRef=useRef<Window|null>(null);
useEffect(()=>{let mounted=true; supabase.auth.getSession().then(({data,error})=>{if(!mounted)return; if(error)toast.error(error.message); if(data.session)setUser(mapUser(data.session.user)); setLoading(false);});
const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{if(!mounted)return; if(event==='SIGNED_IN'||event==='TOKEN_REFRESHED'){if(session)setUser(mapUser(session.user));setLoading(false);} else if(event==='SIGNED_OUT'){setUser(null);setLoading(false);} });
const message=(event:MessageEvent)=>{if(event.data?.type==='OAUTH_CODE'&&typeof event.data.code==='string'){void exchangeCodeOnce(event.data.code).then(error=>{if(error)toast.error(error);});} if(event.data?.type==='OAUTH_ERROR'&&typeof event.data.message==='string')toast.error(event.data.message);}; window.addEventListener('message',message);
return ()=>{mounted=false;subscription.unsubscribe();window.removeEventListener('message',message);popupRef.current?.close();};},[]);
const signIn=async(email:string,password:string)=>{const {error}=await supabase.auth.signInWithPassword({email,password});if(error){toast.error(error.message);return false;}return true;};
const sendOtp=async(email:string)=>{const {error}=await supabase.auth.signInWithOtp({email,options:{shouldCreateUser:true}});if(error){toast.error(error.message);return false;}toast.success('A 4-digit verification code has been sent to your email.');return true;};
const verify=async(email:string,otp:string,password:string)=>{const {error}=await supabase.auth.verifyOtp({email,token:otp,type:'email'});if(error){toast.error(error.message);return false;}const {data,error:updateError}=await supabase.auth.updateUser({password});if(updateError){toast.error(updateError.message);return false;}if(data.user)setUser(mapUser(data.user));return true;};
const logout=async()=>{const {error}=await supabase.auth.signOut();if(error)toast.error(error.message);};
const social=async(provider:'google'|'apple')=>{let iframe=false;try{iframe=window.self!==window.top;}catch{iframe=true;}
const width=520,height=720;const popup=iframe?window.open('about:blank','onspace-oauth',`popup=yes,width=${width},height=${height},left=${Math.round(Math.max(0,window.screenX+(window.outerWidth-width)/2))},top=${Math.round(Math.max(0,window.screenY+(window.outerHeight-height)/2))}`):null;
if(iframe&&!popup){toast.error('登录弹窗被浏览器阻止，请允许弹窗后重试。');return;}popupRef.current=popup;
const {data,error}=await supabase.auth.signInWithOAuth({provider,options:{redirectTo:`${window.location.origin}/auth/callback`,skipBrowserRedirect:true}});
if(error||!data.url){popup?.close();toast.error('Unable to start login. Enable this provider in Cloud → Users → Auth Settings.');return;}if(popup)popup.location.assign(data.url);else window.location.assign(data.url);};
return <AuthContext.Provider value={{user,loading,signIn,sendOtp,verify,logout,social,callback:exchangeCodeOnce}}>{children}</AuthContext.Provider>;
}
export const useAuth=()=>useContext(AuthContext);
