import { ExternalLink, Instagram, Share2 } from 'lucide-react';
import AffiliateLayout from '@/components/layout/AffiliateLayout';
import AffiliateSocialForm from '@/components/forms/AffiliateSocialForm';
import { useAffiliate } from '@/hooks/affiliateWorkspace';

const providers = [
  { id: 'instagram', label: 'Instagram', Icon: Instagram },
  { id: 'tiktok', label: 'TikTok', Icon: Share2 },
  { id: 'facebook', label: 'Facebook', Icon: Share2 },
  { id: 'x', label: 'X', Icon: Share2 },
  { id: 'youtube', label: 'YouTube', Icon: Share2 },
];

export default function AffiliateSocial() {
  const affiliate = useAffiliate();
  const saved = new Map((affiliate.data?.social || []).map(profile => [profile.provider, profile]));
  return (
    <AffiliateLayout title="Social Profiles">
      <div className="affiliate-section-heading"><h1>Social Profiles</h1></div>
      <section className="affiliate-social-list">
        <p className="affiliate-program-note">Add public profile links to your creator profile. Saving a link does not authorize or verify an account.</p>
        {providers.map(({ id, label, Icon }) => {
          const profile = saved.get(id);
          return (
            <article className="affiliate-social-row" key={id}>
              <span className="affiliate-social-brand"><Icon aria-hidden="true" /></span>
              <div>
                <h2>{label}</h2>
                {profile ? (
                  <>
                    <a href={profile.profile_url} target="_blank" rel="noreferrer"><ExternalLink size={16} />View public profile</a>
                    <span className="affiliate-status">{profile.verified ? 'Verified' : 'Not verified'}</span>
                  </>
                ) : <p>No public profile link saved.</p>}
                <AffiliateSocialForm provider={id} url={profile?.profile_url} onSaved={() => undefined} />
              </div>
            </article>
          );
        })}
      </section>
    </AffiliateLayout>
  );
}
