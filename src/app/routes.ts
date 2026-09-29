import { createBrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import { Home } from "./pages/Home";
import { Menu } from "./pages/Menu";
import { GalleryPage } from "./pages/GalleryPage";
import { Contact } from "./pages/Contact";
import { Catering } from "./pages/Catering";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  // Administrace poledních menu – samostatná stránka bez layoutu webu,
  // načítá se až při otevření /admin (veřejný web tím nezvětšuje).
  {
    path: "/admin",
    lazy: async () => ({ Component: (await import("./admin/AdminApp")).AdminApp }),
  },
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "menu", Component: Menu },
      { path: "galerie", Component: GalleryPage },
      { path: "kontakt", Component: Contact },
      { path: "catering", Component: Catering },
      { path: "*", Component: NotFound },
    ],
  },
]);
