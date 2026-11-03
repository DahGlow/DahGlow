import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useAffiliate } from '@/hooks/affiliateWorkspace';
import type { AffiliateProfile } from '@/types/affiliate';

const categories = ['Women', 'Men', 'Kids', 'Home', 'Beauty', 'Shoes', 'Accessories'] as const;
const schema = z.object({
  name: z.string().trim().min(2, 'Use at least 2 characters').max(100),
  categories: z.array(z.string()),
});
type Fields = z.infer<typeof schema>;

export default function AffiliateProfileForm({ profile }: { profile: AffiliateProfile }) {
  const affiliate = useAffiliate();
  const { register, handleSubmit, formState: { errors } } = useForm<Fields>({
    resolver: zodResolver(schema),
    defaultValues: { name: profile.display_name, categories: profile.categories },
  });

  const submit = async (values: Fields) => {
    try {
      await affiliate.save({ op: 'profile-save', ...values });
      toast.success('Profile updated');
    } catch {
      // The shared affiliate mutation reports the API error.
    }
  };

  return (
    <form className="affiliate-form affiliate-profile-form" onSubmit={handleSubmit(submit)}>
      <div className="affiliate-readonly">
        <span>Affiliate ID</span><strong>{profile.affiliate_id}</strong>
        <span>Referral code</span><strong>{profile.referral_code}</strong>
      </div>
      <label htmlFor="affiliate-display-name">Display name</label>
      <input id="affiliate-display-name" maxLength={100} {...register('name')} />
      {errors.name && <p className="affiliate-error" role="alert">{errors.name.message}</p>}
      <fieldset>
        <legend>What do you love to share?</legend>
        <div className="affiliate-category-options">
          {categories.map(category => (
            <label key={category}>
              <input type="checkbox" value={category} {...register('categories')} />
              {category}
            </label>
          ))}
        </div>
      </fieldset>
      <button className="affiliate-primary" disabled={affiliate.busy}>
        {affiliate.busy ? 'Saving…' : 'Save profile'}
      </button>
    </form>
  );
}
