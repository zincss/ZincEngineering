import CarDetail from './client-view';

export async function generateStaticParams() {
  return [{ id: 'null' }];
}

export default function Page() {
  return <CarDetail />;
}