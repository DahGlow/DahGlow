import { useEffect, useState } from 'react';
import type { CategoryVisual } from '@/constants/categoryVisuals';

const ROTATION_INTERVAL=3*60*60*1000;

interface Props {
  visual:CategoryVisual;
  alt:string;
  loading?:'eager'|'lazy';
}

export default function CategoryVisualImage({visual,alt,loading='lazy'}:Props){
  const [showFallback,setShowFallback]=useState(false);
  const [failed,setFailed]=useState(false);
  useEffect(()=>{
    if(!visual.rotateImage||!visual.fallbackImage)return;
    const timer=window.setInterval(()=>setShowFallback(current=>!current),ROTATION_INTERVAL);
    return ()=>window.clearInterval(timer);
  },[visual]);
  const primary=showFallback&&visual.fallbackImage?visual.fallbackImage:visual.image;
  useEffect(()=>setFailed(false),[primary]);
  const fallback=primary===visual.image?visual.fallbackImage:visual.image;
  return <img
    src={failed&&fallback?fallback:primary}
    alt={alt}
    loading={loading}
    onError={()=>{if(fallback&&fallback!==primary)setFailed(true);}}
  />;
}
