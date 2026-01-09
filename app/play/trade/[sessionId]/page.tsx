import TradeSessionPage from './client-view';
export async function generateStaticParams() { return [{ sessionId: 'null' }]; }
export default function Page() { return <TradeSessionPage />; }
