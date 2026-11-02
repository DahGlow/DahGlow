import { Link } from 'react-router-dom';
import { AlertCircle,Menu } from 'lucide-react';
import { useCustomerAccount } from '@/hooks/useCustomerAccount';
import { useWallet } from '@/hooks/useWallet';
import { useCatalog } from '@/hooks/useCatalog';
import PageHeader from '@/components/layout/PageHeader';
import WalletOverview from '@/components/features/WalletOverview';
import WalletPaymentServices from '@/components/features/WalletPaymentServices';
import CustomerAccessPrompt from '@/components/features/CustomerAccessPrompt';
import CatalogResults from '@/components/features/CatalogResults';

export default function Wallet(){const account=useCustomerAccount();const wallet=useWallet(account.connected);const catalog=useCatalog({first:12});return <main className="wallet-page"><div className="wallet-top"><PageHeader title="Wallet"/><Link to="/wallet/history" className="icon-button wallet-menu" aria-label="Wallet history"><Menu size={22}/></Link></div><div className="wallet-layout"><div className="wallet-main"><WalletOverview accounts={wallet.error?[]:wallet.data?.accounts||[]} loading={wallet.isLoading} verified={account.connected&&!wallet.error&&!wallet.isLoading}/><CustomerAccessPrompt account={account} feature="store credit"/>{wallet.error&&<section className="wallet-error" role="alert"><AlertCircle size={20}/><div><h2>Balance unavailable</h2><p>{wallet.error.message}</p><button onClick={()=>void wallet.refetch()} className="order-secondary-button">Retry</button></div></section>}</div><WalletPaymentServices/></div><section className="wallet-recommendations"><h2>Find your next favorite</h2><CatalogResults products={catalog.products} loading={catalog.isLoading} error={catalog.error}/></section></main>;}
