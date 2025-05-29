import Navigation from "@/components/Navigation";
import AuthWrapper from "@/components/AuthWrapper";

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="flex items-center justify-center flex-wrap max-w-7xl mx-auto pt-24 p-4">
        <AuthWrapper />
      </main>
    </>
  );
}