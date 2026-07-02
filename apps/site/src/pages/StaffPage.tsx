import { PageHeader } from '@/components/layout/PageHeader';
import { StaffAccessRack } from '@/sections/StaffAccessRack';

export default function StaffPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <PageHeader code="02" title="Staff" subtitle="Celles et ceux qui font tourner la structure en coulisses." />
      <StaffAccessRack />
    </div>
  );
}
