import WatermelonDbTest from '@/components/tests/watermelon/WatermelonDbTest';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/tests/watermelon')({
  component: WatermelonDbTest,
});

export default function WatermelonTestPage() {
  return <WatermelonDbTest />;
}
