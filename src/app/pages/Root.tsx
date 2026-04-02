import { Outlet } from "react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ScrollToTop } from "../components/ScrollToTop";

export function Root() {
  return (
    <div className="min-h-screen">
      <ScrollToTop />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
