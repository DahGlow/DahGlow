
import { Link } from 'react-router-dom';
import type { CustomerMessage } from '@/hooks/useMessages';
interface Props {message:CustomerMessage;onRead:()=>void;}
export default function MessageEntry({message:m,onRead}:Props){const href=m.href?.startsWith('/us/user/')?m.href:null;return <article className={`message-entry ${m.read_at?'read':''}`}><span className="message-read-dot" aria-label={m.read_at?'Read':'Unread'}/><div><h2>{m.title}</h2><p>{m.body}</p><time dateTime={m.created_at}>{new Date(m.created_at).toLocaleString()}</time>{href&&<Link to={href} onClick={onRead}>View details</Link>}{!m.read_at&&<button onClick={onRead}>Mark as read</button>}</div></article>;}
