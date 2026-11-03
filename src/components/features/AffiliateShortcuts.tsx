import { Link } from 'react-router-dom';
import { ChartNoAxesCombined,Link2,Trophy,Gift } from 'lucide-react';
const LINKS=[{label:'Data Center',path:'/affiliate/data',Icon:ChartNoAxesCombined,tone:'sky'},{label:'Convert Link',path:'/affiliate/convert',Icon:Link2,tone:'rose'},{label:'Best Seller',path:'/affiliate?sort=BEST_SELLING',Icon:Trophy,tone:'peach'},{label:'Bonus',path:'/affiliate/bonus',Icon:Gift,tone:'pink'}];
export default function AffiliateShortcuts(){return <nav className="affiliate-shortcuts" aria-label="Creator tools">{LINKS.map(({label,path,Icon,tone})=><Link key={label} to={path}><span className={`affiliate-shortcut-icon ${tone}`}><Icon strokeWidth={1.7}/></span><span>{label}</span></Link>)}</nav>;}
