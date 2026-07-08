'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';
import { ArrowLeft, ArrowRight } from "lucide-react";
export default function ValuesPage() {
  const initialized = useRef(false);

  useEffect(() => {
    const initSlider = () => {
      if (typeof window === 'undefined' || !(window as any).jQuery || initialized.current) {
        return;
      }
      
      initialized.current = true;
      const $ = (window as any).jQuery;
      
    const sickPrimary = {
  autoplay: true,
  autoplaySpeed: 2400,
  slidesToShow: 2,               // default for desktop/tablet
  slidesToScroll: 1,
  speed: 1800,
  cssEase: 'cubic-bezier(.84, 0, .08, .99)',
  asNavFor: '.text-slider',
  centerMode: true,
  prevArrow: $('.prev'),
  nextArrow: $('.next'),
  responsive: [
    {
      breakpoint: 768,           // phones & small tablets
      settings: {
        slidesToShow: 1,
        centerMode: false       // optional, removes the partial side slides
      }
    }
  ]
};

      const sickSecondary = {
        autoplay: true,
        autoplaySpeed: 2400,
        slidesToShow: 1,
        slidesToScroll: 1,
        speed: 1800,
        cssEase: 'cubic-bezier(.84, 0, .08, .99)',
        asNavFor: '.image-slider',
        prevArrow: $('.prev'),
        nextArrow: $('.next')
      };

      $('.image-slider').slick(sickPrimary);
      $('.text-slider').slick(sickSecondary);
    };

    if ((window as any).jQuery && (window as any).jQuery.fn.slick) {
      initSlider();
    } else {
      const checkInterval = setInterval(() => {
        if ((window as any).jQuery && (window as any).jQuery.fn.slick) {
          clearInterval(checkInterval);
          initSlider();
        }
      }, 100);

      return () => clearInterval(checkInterval);
    }
  }, []);

  return (
    <>
      <style jsx>{`
        .values-wrapper {
          width: 100%;
          height: 100vh;
          overflow: hidden;
          background: var(--navy);
          position: relative;
        }

        .values-wrapper :global(.slick-slide.slick-center) {
          transform: scale(1.2);
          transition: transform .8s 1.4s cubic-bezier(.84, 0, .08, .99);
        }

        .values-wrapper :global(.slick-slide) {
          transition: transform .7s cubic-bezier(.84, 0, .08, .99);
        }

      .values-title {
  position: absolute;
  top: 0;
  left: 0;
  transform: none;
  z-index: 3;
  width: 100%;
  background: white;
  color: var(--navy);
  font-size: 24px;
  font-family: "Inter", sans-serif;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-align: center;
  padding: 1rem 2rem;
  margin: 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}

        .image-slider {
          z-index: 0;
          margin: 0 auto;
          padding: 0;
          width: 100%;
          height: 100vh;
        }

        .image-slide {
          height: 100vh;
          margin: 0 auto;
        }

        .slider-control {
          margin: 0%;
          position: absolute;
          z-index: 2;
          bottom: 4%;
          left: 15%;
          transform: translate(-50%, -50%);
          display: flex;
        }

        .values-wrapper button {
          color: var(--white);
          background: none;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, .3);
          font-size: 16px;
          border-radius: 50%;
          margin: .4em;
          display: inline-block;
          cursor: pointer;
          transition: var(--transition);
        }

        .values-wrapper button:hover {
          border-color: var(--amber);
          color: var(--amber);
          box-shadow: 0 0 20px rgba(245, 158, 11, 0.3);
        }

        .values-wrapper button:focus {
          outline: none;
          border-color: var(--amber);
        }

        .block-1 {
          z-index: 1;
          position: absolute;
          height: 100%;
          width: 5%;
          left: 0%;
          top: 0;
          background: var(--navy);
        }

        .block-2 {
          z-index: 1;
          position: absolute;
          height: 100%;
          width: 25%;
          left: 25%;
          top: 0;
          background: var(--navy);
        }

        .block-3 {
          z-index: 1;
          position: absolute;
          height: 100%;
          width: 5%;
          right: 0%;
          top: 0;
          background: var(--navy);
        }

        .overlay {
          z-index: 1;
          position: absolute;
          height: 100%;
          width: 20%;
          left: 5%;
          top: 0;
          background: rgba(13, 27, 62, .65);
        }

        .text-slider-wrapper {
          z-index: 2;
          position: absolute;
          width: 100%;
          top: 30%;
        }

        .text-slider {
          margin: 0%;
          padding: 0%;
          height: 100vh;
        }

        .text-slide h1 {
          color: var(--white);
          font-size: 64px;
          font-family: "Inter";
          font-weight: 400;
          line-height: 110%;
          letter-spacing: -2px;
          padding-left: 10%;
        }

        @media(max-width: 990px) {
          .values-title {
            top: 5%;
            font-size: 18px;
            letter-spacing: 3px;
          }

          .block-2, 
          .overlay {
            display: none;
          }

          .block-1 {
            width: 50%;
          }

          .block-3 {
            width: 12%;
          }

          .slide-slick {
            display: none !important;
          }

          .text-slide h1 {
            font-size: 30px !important;
          }

          .text-slider-wrapper {
            position: absolute;
            top: 50% !important;
          }

          .slider-control {
            left: 22.5%;
          }
        }
        

/* Extra small phones (< 480px) */
@media (max-width: 479px) {
  .values-wrapper {
    height: 70vh;           /* ← was 100vh, now shorter */
  }

  .image-slider,
  .image-slide {
    height: 70vh;           /* match wrapper */
  }

  .values-title {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    padding: 0.6rem 1rem;
    font-size: 16px;
    letter-spacing: 1px;
    background: rgba(13, 27, 62, 0.85);
    color: white;
    z-index: 4;
    text-align: center;
  }

  .block-2,
  .overlay {
    display: none;
  }
  .block-1 {
    width: 4%;
  }
  .block-3 {
    width: 4%;
  }

  .text-slide h1 {
    font-size: 24px !important;
    letter-spacing: 0;
    padding-left: 6%;
    line-height: 125%;
    text-shadow: 0 2px 8px rgba(0,0,0,0.6);
  }
  .text-slider-wrapper {
    top: 45% !important;     /* adjust as needed */
  }
  .slider-control {
    left: 50%;
    bottom: 6%;
    transform: translateX(-50%);
  }
  .values-wrapper button {
    padding: 14px;
  }
}

/* Small phones (480px - 767px) */
@media (min-width: 480px) and (max-width: 767px) {
  .values-wrapper {
    height: 75vh;           /* a little taller for slightly bigger screens */
  }

  .image-slider,
  .image-slide {
    height: 75vh;
  }

  .values-title {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    padding: 0.7rem 1.5rem;
    font-size: 18px;
    letter-spacing: 1.5px;
    background: rgba(13, 27, 62, 0.85);
    color: white;
    z-index: 4;
    text-align: center;
  }

  .block-2,
  .overlay {
    display: none;
  }
  .block-1 {
    width: 5%;
  }
  .block-3 {
    width: 5%;
  }

  .text-slide h1 {
    font-size: 30px !important;
    letter-spacing: -0.5px;
    padding-left: 5%;
    text-shadow: 0 2px 8px rgba(0,0,0,0.6);
  }
  .text-slider-wrapper {
    top: 42% !important;
  }
  .slider-control {
    left: 50%;
    bottom: 6%;
    transform: translateX(-50%);
  }
  .values-wrapper button {
    padding: 16px;
  }
}
/* Tablets (768px - 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .values-title {
    font-size: 22px;
  }
  .block-2,
  .overlay {
    display: none;
  }
  .block-1 {
    width: 40%;
  }
  .block-3 {
    width: 15%;
  }
  .text-slide h1 {
    font-size: 36px !important;
    letter-spacing: -1px;
    padding-left: 5%;
  }
  .text-slider-wrapper {
    top: 40% !important;
  }
  .slider-control {
    left: 20%;
  }
}




/* Landscape orientation on short screens (mobile landscape) */
@media (max-height: 500px) and (orientation: landscape) {
  .values-wrapper {
    height: auto;
    min-height: 100vh;
  }
  .image-slider,
  .image-slide {
    height: 100vh;
  }
  .text-slider-wrapper {
    top: 35% !important;
  }
  .slider-control {
    bottom: 5%;
    left: 15%;
  }
}
          
      `}</style>

      <div className="values-wrapper">
        <Script 
          src="https://code.jquery.com/jquery-3.7.1.min.js"
          strategy="beforeInteractive"
        />
        <Script 
          src="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js"
          strategy="afterInteractive"
        />
        <Script 
          type="module" 
          src="https://unpkg.com/ionicons@7.4.0/dist/ionicons/ionicons.esm.js"
          strategy="afterInteractive"
        />
        <Script 
          src="https://unpkg.com/ionicons@7.4.0/dist/ionicons/ionicons.js"
          strategy="afterInteractive"
        />

        <h2 className="values-title">Our Values</h2>

        <div className="text-slider-wrapper">
          <div className="text-slider">
            <div className="text-slide"><h1>A blessing for <br /> every skin.</h1></div>
            <div className="text-slide"><h1>The perfect mix of <br /> old & new.</h1></div>
            <div className="text-slide"><h1>A journey over borders <br /> & generations.</h1></div>
            <div className="text-slide"><h1>Your are the <br /> stylist.</h1></div>
            <div className="text-slide"><h1>To be on the <br /> forerfront.</h1></div>
          </div>
        </div>

        <div className="slider-control">
     <div className="prev">
  <button type="button">
    <ArrowLeft size={20} />
  </button>
</div>

<div className="next">
  <button type="button">
    <ArrowRight size={20} />
  </button>
</div>
        </div>

        <div className="blocks">
          <div className="block-1"></div>
          <div className="block-2"></div>
          <div className="block-3"></div>
        </div>

        <div className="overlay"></div>

        <div className="image-slider">
          <div className="image-slide" id="one" style={{ background: 'url(https://i.pinimg.com/736x/f4/b0/18/f4b01825d3093ff0e1637c0981ab73f8.jpg) no-repeat 50% 50%', backgroundSize: 'cover' }}></div>
          <div className="image-slide" id="two" style={{ background: 'url(https://i.pinimg.com/1200x/1f/57/48/1f57483641e20b141c989a54cf445d21.jpg) no-repeat 50% 50%', backgroundSize: 'cover' }}></div>
          <div className="image-slide" id="three" style={{ background: 'url(https://i.pinimg.com/736x/f7/5f/cf/f75fcf20afe4fc9cda9bf299278aa403.jpg) no-repeat 50% 50%', backgroundSize: 'cover' }}></div>
          <div className="image-slide" id="four" style={{ background: 'url(https://i.pinimg.com/736x/ab/6d/a1/ab6da10711d0a180e50a0900e5775f78.jpg) no-repeat 50% 50%', backgroundSize: 'cover' }}></div>
          <div className="image-slide" id="five" style={{ background: 'url(https://i.pinimg.com/736x/6d/e3/f6/6de3f6bbcbf1109c4da60e57e10fa25d.jpg) no-repeat 50% 50%', backgroundSize: 'cover' }}></div>
        </div>
      </div>
    </>
  );
}