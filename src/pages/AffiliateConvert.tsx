import AffiliateLayout from '@/components/layout/AffiliateLayout';
import AffiliateConvertForm from '@/components/forms/AffiliateConvertForm';

export default function AffiliateConvert() {
  return (
    <AffiliateLayout title="Convert Link">
      <div className="affiliate-section-heading"><h1>Convert a Link</h1></div>
      <AffiliateConvertForm />
    </AffiliateLayout>
  );
}
