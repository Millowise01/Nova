import { MainLayout } from "@/components/layouts";
import { HomeScreen } from "@/features/home/components/home-screen";

export default function HomePage() {
  return (
    <MainLayout>
      <HomeScreen />
    </MainLayout>
  );
}