
import Activities from "./components/Activities";
import Avis from "./components/Avis";
import ClassesSection from "./components/ClassesSection";
import HeroSection from "./components/HeroSection";
import MethodSection from "./components/MethodSection";
import Why from "./components/Why";
import Video from "./components/Video";
import Footer from "./components/Footer";
import About from "./components/About";

// Existing route page components
import GalleryPage from "./gallery/page";
import ContactPage from "./contact/page";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <About />
      <ClassesSection />
      <Why />
      <Video />
      <MethodSection />
      <Activities />
      <Avis />
      <GalleryPage />
      <ContactPage />
      <Footer />
    </main>
  );
}
