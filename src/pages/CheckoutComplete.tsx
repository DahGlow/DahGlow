import { Link } from 'react-router-dom';
import { CircleAlert, LoaderCircle, RefreshCw, Truck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCustomerAccount, useCustomerOrders } from '@/hooks/useCustomerAccount';
import PageHeader from '@/components/layout/PageHeader';
import OrderCard from '@/components/features/OrderCard';

export default function CheckoutComplete() {
  const { user, loading } = useAuth();
  const account = useCustomerAccount();
  const orders = useCustomerOrders(account.connected, 5000);
  const latestOrder = orders.orders[0];

  return (
    <main className="standard-page checkout-complete-page">
      <PageHeader title="Your order" />
      {loading ? (
        <p className="catalog-empty" role="status"><LoaderCircle size={20} /> Checking your Dah Glow account…</p>
      ) : !user ? (
        <section className="customer-access-prompt">
          <h1>Return to your order</h1>
          <p>Sign in to Dah Glow, then connect the Shopify customer account used at checkout to fetch your order and tracking.</p>
          <Link className="primary-button" to="/login?returnTo=%2Fcheckout%2Fcomplete">Sign in to continue</Link>
        </section>
      ) : account.isLoading ? (
        <p className="catalog-empty" role="status"><LoaderCircle size={20} /> Checking your Shopify customer connection…</p>
      ) : !account.connected ? (
        <section className="customer-access-prompt">
          <Truck size={24} />
          <h1>Fetch your order from Shopify</h1>
          <p>
            Connect the Shopify customer account used at checkout. Dah Glow will then retrieve your order status
            and carrier tracking directly from Shopify.
          </p>
          {account.error && <p role="alert">{account.error.message}</p>}
          <button className="primary-button" onClick={account.connect} disabled={account.isLoading}>
            {account.requiresReauth ? 'Reconnect Shopify account' : 'Connect Shopify account'}
          </button>
        </section>
      ) : (
        <section className="checkout-order-result">
          {orders.isLoading && !latestOrder && (
            <p className="catalog-empty" role="status"><LoaderCircle size={20} /> Fetching your latest Shopify orders…</p>
          )}
          {orders.error && (
            <div className="order-error" role="alert">
              <CircleAlert size={20} />
              <p>{orders.error.message}</p>
              <button className="order-secondary-button" onClick={() => void orders.refetch()}>Try again</button>
            </div>
          )}
          {latestOrder && (
            <>
              <div className="receipt-success">
                <Truck size={48} />
                <h1>Latest Shopify order</h1>
                <p>
                  Shopify currently reports order {latestOrder.name} as {latestOrder.financialStatus.replace(/_/g, ' ').toLowerCase()}.
                  Check the order details if this is not the checkout you just completed.
                </p>
              </div>
              <OrderCard order={latestOrder} />
              <Link className="order-secondary-button" to={`/us/user/orders/track/${encodeURIComponent(latestOrder.id)}`}>
                Fetch live tracking details
              </Link>
            </>
          )}
          {!orders.isLoading && !orders.error && !latestOrder && (
            <section className="customer-access-prompt">
              <h1>No Shopify order found yet</h1>
              <p>Shopify may still be processing the checkout. This page checks your account again automatically.</p>
              <button className="order-secondary-button" onClick={() => void orders.refetch()} disabled={orders.isFetching}>
                <RefreshCw size={17} />{orders.isFetching ? 'Refreshing…' : 'Refresh Shopify orders'}
              </button>
            </section>
          )}
        </section>
      )}
      <p className="fine-print">
        Order and payment statuses are shown only after they are returned by Shopify. This page displays the latest
        order in your Shopify account; carrier scans appear when Shopify or the carrier provides them.
      </p>
    </main>
  );
}
