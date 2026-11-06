import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAdminMutation } from '@/hooks/useAdmin';
import type { StoreSettings } from '@/types/admin';
import AdminBrandUpload from '@/components/forms/AdminBrandUpload';

const schema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(4000),
  logo: z.string().url().or(z.literal('')),
  profileImage: z.string().url().or(z.literal('')),
  contactEmail: z.string().email().or(z.literal('')),
  contactPhone: z.string().max(50),
  announcement: z.string().max(300),
  socialLinks: z.record(z.string().url().or(z.literal(''))),
});

const SOCIAL_FIELDS = ['instagram', 'tiktok', 'facebook', 'youtube', 'x', 'snapchat', 'pinterest'];

export default function AdminStoreForm({ data }: { data: Partial<StoreSettings> }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StoreSettings>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: 'DAH GLOW',
      description: '',
      logo: '',
      profileImage: '',
      contactEmail: '',
      contactPhone: '',
      announcement: '',
      socialLinks: { instagram: '', tiktok: '', facebook: '' },
      ...data,
    },
  });
  const mutation = useAdminMutation();

  return (
    <form
      onSubmit={handleSubmit((settings) => mutation.mutate({ op: 'store-save', settings }))}
      className="admin-grid two"
    >
      <section className="admin-panel">
        <h2>Store identity</h2>
        <label>Store name<input {...register('name')} /></label>
        <label>Description<textarea rows={6} {...register('description')} /></label>
        <label>Announcement<input {...register('announcement')} /></label>
        <AdminBrandUpload
          label="Store logo"
          value={watch('logo')}
          onChange={(url) => setValue('logo', url)}
        />
        <AdminBrandUpload
          label="Store profile image"
          value={watch('profileImage')}
          onChange={(url) => setValue('profileImage', url)}
        />
      </section>
      <section className="admin-panel">
        <h2>Public contact information</h2>
        <label>Email<input type="email" {...register('contactEmail')} /></label>
        <label>Phone<input {...register('contactPhone')} /></label>
        {SOCIAL_FIELDS.map((social) => (
          <label key={social}>
            {social} URL<input {...register(`socialLinks.${social}`)} />
          </label>
        ))}
        <p className="admin-muted">
          These settings are public. They update Dah Glow’s storefront and support context, not
          Shopify’s legal merchant account.
        </p>
        {Object.keys(errors).length > 0 && (
          <p className="admin-error">Check required fields, email and URL formatting.</p>
        )}
        <button className="admin-button" disabled={mutation.isPending}>Save store settings</button>
      </section>
    </form>
  );
}
