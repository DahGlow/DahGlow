import { Link, NavLink } from 'react-router-dom';
import {
  ChartNoAxesCombined,
  CircleUserRound,
  Compass,
  House,
  PackageOpen,
  Share2,
  UsersRound,
} from 'lucide-react';
import { useAffiliate } from '@/hooks/affiliateWorkspace';
import { affiliateReferralUrl, shareAffiliateLink } from '@/lib/affiliate';

const links = [
  { to: '/affiliate', label: 'Overview', Icon: House, end: true },
  { to: '/affiliate/items', label: 'My Picks', Icon: PackageOpen },
  { to: '/affiliate/data', label: 'Data Center', Icon: ChartNoAxesCombined },
  { to: '/affiliate/boost', label: 'Discover', Icon: Compass },
  { to: '/affiliate/social', label: 'Social profiles', Icon: UsersRound },
  { to: '/affiliate/account', label: 'My Account', Icon: CircleUserRound },
];

export default function AffiliateLayout({
  title,
  children,
  hero = false,
}: {
  title: string;
  children: React.ReactNode;
  hero?: boolean;
}) {
  const affiliate = useAffiliate();
  const share = () => {
    const code = affiliate.data?.profile.referral_code;
    if (code) void shareAffiliateLink(affiliateReferralUrl(code));
  };

  if (affiliate.isLoading) {
    return (
      <main className="affiliate-shell" aria-busy="true">
        <p className="affiliate-loading" role="status">Loading your affiliate workspace…</p>
      </main>
    );
  }

  if (!affiliate.user) {
    return (
      <main className="affiliate-shell">
        <header className="affiliate-header">
          <div className="affiliate-header-inner">
            <Link className="affiliate-brand" to="/">DAH GLOW</Link>
          </div>
        </header>
        <section className="affiliate-empty">
          <h1>Sign in to your creator space</h1>
          <p>Your picks, referral links, and earnings are available after you sign in.</p>
          <Link className="affiliate-primary" to="/login">Sign in</Link>
        </section>
      </main>
    );
  }

  if (affiliate.error) {
    return (
      <main className="affiliate-shell">
        <p className="affiliate-error" role="alert">
          Your affiliate workspace could not load: {affiliate.error.message}
        </p>
      </main>
    );
  }

  return (
    <div className={`affiliate-shell${hero ? ' affiliate-shell-hero' : ''}`}>
      <header className="affiliate-header">
        <div className="affiliate-header-inner">
          <Link className="affiliate-brand" to="/">DAH GLOW</Link>
          <div className="affiliate-header-actions">
            <Link className="icon-button" to="/affiliate/account" aria-label="My affiliate account">
              <CircleUserRound />
            </Link>
          </div>
        </div>
      </header>
      <div className="affiliate-body">
        <aside className="affiliate-sidebar" aria-label="Creator navigation">
          <Link className="affiliate-store-link" to="/affiliate">
            DAH GLOW
            <span>CREATOR SPACE</span>
          </Link>
          {links.map(({ to, label, Icon, end }) => (
            <NavLink key={to} to={to} end={end}>
              <Icon />
              {label}
            </NavLink>
          ))}
          <div className="affiliate-sidebar-note">
            <strong>Share what you love</strong>
            <p>Tracked orders and published program rules determine any eligible earnings.</p>
          </div>
        </aside>
        <main className="affiliate-main" aria-label={title}>{children}</main>
      </div>
      <nav className="affiliate-bottom-nav" aria-label="Creator tools">
        <NavLink to="/affiliate" end><House /><span>Home</span></NavLink>
        <NavLink to="/affiliate/items"><PackageOpen /><span>My Picks</span></NavLink>
        <button className="affiliate-share-nav" disabled={!affiliate.data} onClick={share}>
          <Share2 /><span>Share my link</span>
        </button>
        <NavLink to="/affiliate/data"><ChartNoAxesCombined /><span>Data</span></NavLink>
      </nav>
    </div>
  );
}
