'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

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
        slidesToShow: 2,
        slidesToScroll: 1,
        speed: 1800,
        cssEase: 'cubic-bezier(.84, 0, .08, .99)',
        asNavFor: '.text-slider',
        centerMode: true,
        prevArrow: $('.prev'),
        nextArrow: $('.next')
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
          top: 8%;
          left: 50%;
          transform: translateX(-50%);
          z-index: 3;
          color: var(--white);
          font-size: 24px;
          font-family: "Inter";
          font-weight: 500;
          letter-spacing: 4px;
          text-transform: uppercase;
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
          <div className="prev"><button type="button"><ion-icon name="arrow-back"></ion-icon></button></div>
          <div className="next"><button type="button"><ion-icon name="arrow-forward"></ion-icon></button></div>
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