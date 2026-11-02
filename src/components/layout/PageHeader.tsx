import { useNavigate,Link } from 'react-router-dom';
import { ChevronLeft,Heart } from 'lucide-react';
interface Props { title:string; heart?:boolean; }
export default function PageHeader({title,heart=false}:Props){const navigate=useNavigate();return <div className="page-header"><button className="icon-button" aria-label="Go back" onClick={()=>navigate(-1)}><ChevronLeft/></button><h1>{title}</h1>{heart?<Link to="/wishlist" className="icon-button" aria-label="Wishlist"><Heart/></Link>:<span className="header-spacer"/>}</div>;}
