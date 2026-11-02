import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useCustomerAccount } from '@/hooks/useCustomerAccount';
interface Props {account:ReturnType<typeof useCustomerAccount>;feature:string;}
export default function CustomerAccessPrompt({account,feature}:Props){if(account.user&&account.connected)return null;return <section className="customer-access-prompt"><ShieldCheck size={24}/><h2>{account.user?'Connect your Shopify account':'Your account, protected'}</h2><p>{account.isLoading?'Checking account connection…':`Sign in ${account.user?'to Shopify':'to Dah Glow'} to view your own ${feature}.`}</p>{account.error&&<p role="alert">The Shopify connection could not be checked. Please try again.</p>}{account.user?<button className="primary-button" disabled={account.isLoading} onClick={account.connect}>Connect Shopify account</button>:<Link to="/login" className="primary-button">Sign in</Link>}</section>;}
