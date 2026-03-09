import { createBrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import { Home } from "./pages/Home";
import { Menu } from "./pages/Menu";
import { GalleryPage } from "./pages/GalleryPage";
import { Contact } from "./pages/Contact";
import { Catering } from "./pages/Catering";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
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
