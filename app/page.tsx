import Activities from "./components/Activities";
import Avis from "./components/Avis";
import ClassesSection from "./components/ClassesSection";

import HeroSection from "./components/HeroSection";
import MethodSection from "./components/MethodSection";
import Why from "./components/Why";
import Video from "./components/Video";
import GalleryPage from "./gallery/page";
import SectionDivider from "./SectionDivider";
import Footer from "./components/Footer";
import ValuesPage from "./values/page";
import ContactPage from "./contact/page";





export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-6">
         {/* Background decorative elements */}
      <div className="gradient-bg"></div>
      <div className="particles-container" id="particles"></div>
      
      {/* Floating shapes */}
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
        <div className="shape shape-5"></div>
        <div className="shape shape-6"></div>
      </div>

      {/* Central Orb */}
      <div className="bg-orb" id="centralOrb">
        <div className="orb-core"></div>
        <div className="orb-ring ring-1"></div>
        <div className="orb-ring ring-2"></div>
        <div className="orb-ring ring-3"></div>
      </div>

  


  
   <HeroSection />
   

<ClassesSection />

<ValuesPage/>
<MethodSection />

<Video />

<Activities />
<Why/>

<Avis />


<GalleryPage/>
<ContactPage/>
<Footer/>


    </main>
  );
}