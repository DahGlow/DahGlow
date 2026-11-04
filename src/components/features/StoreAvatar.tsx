import { useState } from 'react';

interface Props {url?:string;name:string;className?:string;}

export default function StoreAvatar({url,name,className=''}:Props){const [failedUrl,setFailedUrl]=useState('');const initials=name.split(/\s+/).filter(Boolean).map(word=>word[0]).slice(0,2).join('').toUpperCase();return <span className={`real-store-avatar ${className}`} role="img" aria-label={`${name} store logo`}>{url&&failedUrl!==url?<img src={url} alt="" loading="lazy" onError={()=>setFailedUrl(url)}/>:<strong aria-hidden="true">{initials}</strong>}</span>;}
