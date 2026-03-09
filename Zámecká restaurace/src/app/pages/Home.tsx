import { Hero } from "../components/Hero";
import { WeeklyMenu } from "../components/WeeklyMenu";
import { About } from "../components/About";
import { MenuPreview } from "../components/MenuPreview";
import { Reviews } from "../components/Reviews";
import { Gallery } from "../components/Gallery";
import { Information } from "../components/Information";
import { ReservationCTA } from "../components/ReservationCTA";

export function Home() {
  return (
    <>
      <Hero />
      <WeeklyMenu />
      <About />
      <MenuPreview />
      <Reviews />
      <Gallery />
      <Information />
      <ReservationCTA />
    </>
  );
}
