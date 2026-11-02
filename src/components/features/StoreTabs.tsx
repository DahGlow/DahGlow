
interface Props {tab:string;onChange:(tab:string)=>void;}
export default function StoreTabs({tab,onChange}:Props){return <nav className="store-tabs vendor-tabs" aria-label="Store sections">{['home','items','new','promo','review'].map(t=><button key={t} className={`${tab===t?'active':''} ${t==='new'?'new-tab':''}`} onClick={()=>onChange(t)}>{t==='new'?'✦ New':t[0].toUpperCase()+t.slice(1)}</button>)}</nav>;}
