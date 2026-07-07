"use client";

import { useEffect, useRef } from "react";
import Swiper from "swiper";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "./avis.css";

// Import Swiper modules
import { EffectCoverflow, Pagination, Autoplay } from "swiper/modules";

export default function Avis() {
  const swiperRef = useRef<HTMLDivElement>(null);
  const swiperInstance = useRef<Swiper | null>(null);

  useEffect(() => {
    if (swiperRef.current && !swiperInstance.current) {
      swiperInstance.current = new Swiper(swiperRef.current, {
        modules: [EffectCoverflow, Pagination, Autoplay],
        effect: "coverflow",
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: "auto",
        loop: true,
        coverflowEffect: {
          rotate: 20,
          stretch: 0,
          depth: 350,
          modifier: 1,
          slideShadows: true,
        },
        autoplay: {
          delay: 2000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        },
        speed: 1200,
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
        },
      });
    }

    // Cleanup
    return () => {
      if (swiperInstance.current) {
        swiperInstance.current.destroy();
        swiperInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="avissection">
          <div className="avislider">
      <div className="swiper swiper-containeravis" ref={swiperRef}>
        <div className="swiper-wrapper">
          {/* Slide 1 */}
          <div className="swiper-slide">
            <div className="pictureavis">
              <img
                src="https://i.pinimg.com/1200x/98/63/c0/9863c01b89d985e2a4e4db7b384cdc35.jpg"
                alt=""
              />
            </div>
            <div className="detailavis">
              <h3>Mme Amel Ben Salah</h3>
              <span>"Mon enfant a beaucoup progressé depuis son inscription. L’équipe pédagogique est attentive et l’environnement scolaire est motivant et sécurisé."</span>
            </div>
          </div>

          {/* Slide 2 */}
          <div className="swiper-slide">
            <div className="pictureavis">
              <img
                src="https://i.pinimg.com/1200x/87/9e/c7/879ec74aaeb5de8460a768dacb93901c.jpg"
                alt=""
              />
            </div>
            <div className="detailavis">
              <h3>M. Hatem Trabelsi</h3>
              <span>"Une école sérieuse qui accorde autant d’importance à la réussite scolaire qu’au développement personnel des élèves."</span>
            </div>
          </div>

          {/* Slide 3 */}
          <div className="swiper-slide">
            <div className="pictureavis">
              <img
                src="https://i.pinimg.com/736x/27/ce/97/27ce97e3c612a6767881b0d1ed77ee09.jpg"
                alt=""
              />
            </div>
            <div className="detailavis">
              <h3>Yasmine Gharbi — Élève</h3>
              <span>"J’aime apprendre dans cette école parce que les professeurs expliquent bien et nous encouragent toujours à donner le meilleur de nous-mêmes."</span>
            </div>
          </div>

          {/* Slide 4 */}
          <div className="swiper-slide">
            <div className="pictureavis">
              <img
                src="https://i.pinimg.com/1200x/e9/a6/fc/e9a6fcf8e3514f9c9790f2dc125c8150.jpg"
                alt=""
              />
            </div>
            <div className="detailavis">
              <h3>Mme Olfa Jaziri</h3>
              <span>"Les activités éducatives et culturelles proposées permettent aux enfants de développer leur confiance et leur créativité."</span>
            </div>
          </div>

          {/* Slide 5 */}
          <div className="swiper-slide">
            <div className="pictureavis">
              <img
                src="https://i.pinimg.com/1200x/69/28/0b/69280b98698c70bb7eb7bab7007c9b4e.jpg"
                alt=""
              />
            </div>
            <div className="detailavis">
              <h3>Ahmed Ben Ahmed — Élève</h3>
              <span>"L’ambiance à l’école est agréable et les cours sont modernes. Cela me motive à travailler davantage chaque jour."</span>
            </div>
          </div>

          {/* Slide 6 */}
          <div className="swiper-slide">
            <div className="pictureavis">
              <img
                src="https://i.pinimg.com/1200x/7f/5e/94/7f5e94d8652d6a3b2b5dafd3c8cb8218.jpg"
                alt=""
              />
            </div>
            <div className="detailavis">
              <h3>Mme Sonia Khelifi</h3>
              <span>"Je recommande vivement cette école pour son encadrement de qualité, son organisation et son engagement envers la réussite des élèves."</span>
            </div>
          </div>
        </div>

        <div className="swiper-pagination"></div>
      </div>
    </div>
    </div>
  
  );
}