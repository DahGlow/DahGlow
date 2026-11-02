import { useEffect } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import ScanUpload from '@/components/features/ScanUpload';
import ScanProgress from '@/components/features/ScanProgress';
import ScanResults from '@/components/features/ScanResults';
import { useProductScan } from '@/hooks/useProductScan';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function VisualSearch(){const scan=useProductScan();const navigate=useNavigate(),location=useLocation();const busy=['preparing','recognizing','matching'].includes(scan.stage);usePageMeta('Visual Search — Dah Glow','Find similar Dah Glow products from your own photo.');useEffect(()=>{if(scan.stage==='done')navigate('/scan-product/results',{replace:true});},[scan.stage,navigate]);const again=()=>{scan.cancel();navigate('/scan-product',{replace:true});};return <main className={`visual-search-page ${busy?'is-scanning':''}`}>{!busy&&<PageHeader title={scan.result?'Scan results':'Visual search'}/>} {busy?<ScanProgress image={scan.image} stage={scan.stage} onCancel={again}/>:scan.result?<ScanResults image={scan.image} result={scan.result} onAgain={again}/>:<>{location.pathname.endsWith('/results')&&scan.stage==='idle'&&<p className="scan-refresh-note">For privacy, scan results are not saved after refresh. Upload an image to start again.</p>}{scan.error&&<div className="scan-error" role="alert"><AlertCircle/><h2>This scan could not finish</h2><p>{scan.error}</p><button className="order-secondary-button" onClick={()=>void scan.retry()}>Retry this image</button></div>}<ScanUpload onImage={file=>void scan.scan(file)}/></>}</main>;}
