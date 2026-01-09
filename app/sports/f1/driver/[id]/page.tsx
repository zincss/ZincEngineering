import DriverPageClient from './driver-page-client';
export async function generateStaticParams() { return [{ id: 'null' }]; }
export default function Page() { return <DriverPageClient />; }
