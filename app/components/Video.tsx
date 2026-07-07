'use client';

import { useEffect, useState, useRef } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

interface VideoProps {
  heading?: string;
  subheading?: string;
  backgroundImage?: string;
  videoSrc?: string;
}

const Video: React.FC<VideoProps> = ({
  heading = 'Empowering Minds, Building Tomorrow',
  subheading = 'A community dedicated to learning and excellence',
  backgroundImage = '/kids.jpg',
  videoSrc = '/kids.mp4'
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setIsMounted(true);
    
    AOS.init({
      once: false,
      mirror: true,
      duration: 1000,
      easing: 'ease-in-out',
    });

    setTimeout(() => {
      AOS.refresh();
    }, 200);

    // Ensure section is visible
    if (sectionRef.current) {
      sectionRef.current.style.visibility = 'visible';
      sectionRef.current.style.opacity = '1';
      sectionRef.current.style.display = 'flex';
    }
  }, []);

  const openVideoModal = () => {
    setShowVideo(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  const closeVideoModal = () => {
    setShowVideo(false);
    // Restore body scroll
    document.body.style.overflow = 'unset';
  };

  if (!isMounted) {
    return (
      <div style={{ 
        height: '100vh', 
        width: '100%', 
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <>
      <section 
        ref={sectionRef}
        className="hero-section"
        style={{
          position: 'relative',
          zIndex: 10, // Ensure it's above other elements
        }}
      >
        {/* Background Image */}
        <div className="background-container">
          <div className="background-image"></div>
          <div className="overlay"></div>
        </div>

        {/* Content */}
        <div className="content-container">
          <div className="content-wrapper" data-aos="fade-left" data-aos-duration="1000">
            <h1 className="hero-title">{heading}</h1>
            <p className="hero-subtitle">{subheading}</p>
          </div>

          <button
            onClick={openVideoModal}
            className="play-btn"
            data-aos="fade-left"
            data-aos-delay="300"
            data-aos-duration="1000"
            aria-label="Play video"
          >
            <div className="play-icon"></div>
          </button>
        </div>
      </section>

      {/* Video Modal */}
      {showVideo && (
        <div className="modal-overlay" onClick={closeVideoModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeVideoModal}>×</button>
            <video 
              src={videoSrc}
              controls
              autoPlay
              className="video-element"
            />
          </div>
        </div>
      )}

      <style jsx>{`
        .hero-section {
          position: relative !important;
          width: 100% !important;
          height: 100vh !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          overflow: hidden !important;
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          visibility: visible !important;
          opacity: 1 !important;
          z-index: 10 !important;
          margin: 0 !important;
          padding: 0 !important;
          flex-shrink: 0 !important;
        }

        .background-container {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          z-index: 1 !important;
        }

        .background-image {
          width: 100%;
          height: 100%;
          background-image: url(${backgroundImage});
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.4) 0%,
            rgba(0, 0, 0, 0.6) 100%
          );
          z-index: 2;
        }

        .content-container {
          position: relative !important;
          z-index: 3 !important;
          text-align: center;
          padding: 20px;
          max-width: 1200px;
          width: 100%;
          display: flex !important;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          visibility: visible !important;
          opacity: 1 !important;
        }

        .content-wrapper {
          margin-bottom: 40px;
          visibility: visible !important;
          opacity: 1 !important;
        }

        .hero-title {
          font-size: clamp(32px, 6vw, 56px);
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 20px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
          letter-spacing: -0.02em;
          color: #ffffff !important;
          opacity: 1 !important;
          visibility: visible !important;
          font-family: 'Poppins', sans-serif;
          display: block !important;
        }

        .hero-subtitle {
          font-size: clamp(16px, 3vw, 20px);
          font-weight: 300;
          line-height: 1.5;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
          color: #ffffff !important;
          opacity: 1 !important;
          visibility: visible !important;
          max-width: 600px;
          margin: 0 auto;
          font-family: 'Poppins', sans-serif;
          display: block !important;
        }

        .play-btn {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 3px solid rgba(255, 255, 255, 0.9);
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex !important;
          align-items: center;
          justify-content: center;
          padding: 0;
          margin: 0 auto;
          pointer-events: auto;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
          visibility: visible !important;
          opacity: 1 !important;
        }

        .play-btn:hover {
          transform: scale(1.1);
          background: rgba(255, 255, 255, 0.35);
          border-color: #ffffff;
          box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
        }

        .play-icon {
          width: 0;
          height: 0;
          border-left: 28px solid #ffffff;
          border-top: 18px solid transparent;
          border-bottom: 18px solid transparent;
          margin-left: 8px;
          filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.3));
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999 !important;
          backdrop-filter: blur(5px);
        }

        .modal-content {
          position: relative;
          width: 90%;
          max-width: 1000px;
          aspect-ratio: 16/9;
        }

        .modal-close {
          position: absolute;
          top: -40px;
          right: -40px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: white;
          border: none;
          font-size: 28px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
          transition: all 0.3s ease;
          z-index: 10000;
          line-height: 1;
          padding: 0;
        }

        .modal-close:hover {
          transform: scale(1.1);
          background: #f0f0f0;
        }

        .video-element {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 8px;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 36px;
          }

          .hero-subtitle {
            font-size: 16px;
            padding: 0 20px;
          }

          .play-btn {
            width: 90px;
            height: 90px;
          }

          .play-icon {
            border-left: 22px solid #ffffff;
            border-top: 14px solid transparent;
            border-bottom: 14px solid transparent;
            margin-left: 6px;
          }

          .modal-close {
            top: -30px;
            right: 0;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 28px;
          }
          
          .hero-subtitle {
            font-size: 14px;
          }

          .play-btn {
            width: 80px;
            height: 80px;
          }

          .play-icon {
            border-left: 18px solid #ffffff;
            border-top: 12px solid transparent;
            border-bottom: 12px solid transparent;
            margin-left: 5px;
          }
        }
      `}</style>
    </>
  );
};

export default Video;