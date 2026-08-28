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
import About from "./components/About";





export default function Home() {
  return (

      
  <div>
   <HeroSection />
   <About/>
   <ClassesSection />
   <Why/>
    <Video />
   <MethodSection />
  
   <Activities />
   <Avis />
   


<GalleryPage/>
<ContactPage/>
<Footer/>

  </div>


  




 
  );
}