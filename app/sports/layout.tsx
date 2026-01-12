import SportsShell from '@/app/components/SportsShell';

export default function SportsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SportsShell>
      {children}
    </SportsShell>
  );
}
