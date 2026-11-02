import { useState } from 'react';
import { toast } from 'sonner';
import { uploadBranding } from '@/lib/adminUploads';
interface Props{label:string;value:string;onChange:(url:string)=>void;}
export default function AdminBrandUpload({label,value,onChange}:Props){const [busy,setBusy]=useState(false);const upload=async(file?:File)=>{if(!file)return;setBusy(true);try{onChange(await uploadBranding(file));toast.success('Image uploaded. Save settings to apply it.');}catch(error){toast.error(error instanceof Error?error.message:'Image upload failed');}finally{setBusy(false);}};return <label className="admin-brand-upload">{label}{value&&<img src={value} alt={label}/>}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e=>void upload(e.target.files?.[0])}/>{busy&&<span>Uploading image…</span>}</label>;}
