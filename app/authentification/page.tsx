// app/authentification/page.tsx
'use client';

import { useState } from 'react';
import Head from 'next/head';
import Script from 'next/script';

export default function AuthentificationPage() {
  const [active, setActive] = useState(false);

  const handleSignUp = (e: React.MouseEvent) => {
    e.preventDefault();
    setActive(true);
  };

  const handleSignIn = (e: React.MouseEvent) => {
    e.preventDefault();
    setActive(false);
  };

  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </Head>

      {/* Boxicons CDN */}
      <Script src="https://unpkg.com/boxicons@2.1.4/dist/boxicons.js" strategy="afterInteractive" />

      <style>{`
        :root {
          --navy: #071B4A;
          --navy-light: #0F2B6A;
          --gold: #FFB400;
          --gold-light: #FFC933;
          --white: #FFFFFF;
          --off-white: #F8F9FA;
          --text-dark: #1A1A2E;
          --text-gray: #5A6A7A;
          --shadow: 0 8px 30px rgba(7, 27, 74, 0.10);
          --radius: 16px;
          --radius-sm: 10px;
          --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Poppins', sans-serif;
        }

        body {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: #F0F4FF;
          background-image:
            radial-gradient(ellipse at 20% 20%, rgba(255, 180, 0, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(7, 27, 74, 0.04) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(15, 43, 106, 0.03) 0%, transparent 60%);
          padding: 20px;
          margin: 0;
        }

        .container {
          position: relative;
          width: 750px;
          height: 450px;
          border: 2px solid var(--gold);
          box-shadow: var(--shadow);
          overflow: hidden;
          background: var(--white);
          border-radius: var(--radius);
          isolation: isolate;
        }

        /* Shapes always behind */
        .container .curved-shape,
        .container .curved-shape2 {
          pointer-events: none;
          z-index: 1;
        }

        .container .curved-shape {
          position: absolute;
          right: 0;
          top: -5px;
          height: 600px;
          width: 850px;
          background: linear-gradient(45deg, var(--navy), var(--navy-light));
          transform: rotate(10deg) skewY(40deg);
          transform-origin: bottom right;
          transition: 1.5s ease;
          transition-delay: 1.6s;
        }

        .container.active .curved-shape {
          transform: rotate(0deg) skewY(0deg);
          transition-delay: .5s;
        }

        .container .curved-shape2 {
          position: absolute;
          left: 250px;
          top: 100%;
          height: 700px;
          width: 850px;
          background: var(--off-white);
          border-top: 3px solid var(--gold);
          transform: rotate(0deg) skewY(0deg);
          transform-origin: bottom left;
          transition: 1.5s ease;
          transition-delay: .5s;
        }

        .container.active .curved-shape2 {
          transform: rotate(-11deg) skewY(-41deg);
          transition-delay: 1.2s;
        }

        /* FORMS ABOVE EVERYTHING CLICKABLE */
        .container .form-box {
          position: absolute;
          top: 0;
          width: 50%;
          height: 100%;
          display: flex;
          justify-content: center;
          flex-direction: column;
          z-index: 20;
        }

        .form-box.Login {
          left: 0;
          padding: 0 40px;
          z-index: 22;
        }

        .form-box.Register {
          right: 0;
          padding: 0 60px;
          z-index: 21;
        }

        .container.active .form-box.Login {
          z-index: 21;
        }

        .container.active .form-box.Register {
          z-index: 22;
        }

        /* INFO TEXT SHOULD NEVER BLOCK INPUTS */
        .info-content {
          position: absolute;
          top: 0;
          height: 100%;
          width: 50%;
          display: flex;
          justify-content: center;
          flex-direction: column;
          z-index: 5;
          pointer-events: none;
        }

        .info-content.Login {
          right: 0;
          text-align: right;
          padding: 0 40px 60px 150px;
        }

        .info-content.Register {
          left: 0;
          text-align: left;
          padding: 0 150px 60px 38px;
        }

        .info-content h2,
        .info-content p {
          color: var(--white);
        }

        .form-box.Login .animation {
          transform: translateX(0%);
          transition: .7s ease;
          opacity: 1;
          transition-delay: calc(.1s * var(--S));
        }

        .container.active .form-box.Login .animation {
          transform: translateX(-120%);
          opacity: 0;
          transition-delay: calc(.1s * var(--D));
        }

        .form-box.Register .animation {
          transform: translateX(120%);
          transition: .7s ease;
          opacity: 0;
          filter: blur(10px);
          transition-delay: calc(.1s * var(--S));
        }

        .container.active .form-box.Register .animation {
          transform: translateX(0%);
          opacity: 1;
          filter: blur(0px);
          transition-delay: calc(.1s * var(--li));
        }

        .info-content.Login .animation {
          transform: translateX(0);
          transition: .7s ease;
          transition-delay: calc(.1s * var(--S));
          opacity: 1;
          filter: blur(0px);
        }

        .container.active .info-content.Login .animation {
          transform: translateX(120%);
          opacity: 0;
          filter: blur(10px);
          transition-delay: calc(.1s * var(--D));
        }

        .info-content.Register .animation {
          transform: translateX(-120%);
          transition: .7s ease;
          opacity: 0;
          filter: blur(10px);
          transition-delay: calc(.1s * var(--S));
        }

        .container.active .info-content.Register .animation {
          transform: translateX(0%);
          opacity: 1;
          filter: blur(0);
          transition-delay: calc(.1s * var(--li));
        }

        .form-box h2 {
          font-size: 32px;
          text-align: center;
          color: var(--navy);
        }

        .form-box .input-box {
          position: relative;
          width: 100%;
          height: 50px;
          margin-top: 25px;
        }

        .input-box input {
          width: 100%;
          height: 100%;
          background: transparent;
          border: none;
          outline: none;
          font-size: 16px;
          color: var(--text-dark);
          font-weight: 600;
          border-bottom: 2px solid #CDD5DF;
          padding-right: 30px;
          transition: .5s;
          position: relative;
          z-index: 30;
        }

        .input-box input:focus,
        .input-box input:valid {
          border-bottom: 2px solid var(--gold);
        }

        .input-box label {
          position: absolute;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          font-size: 16px;
          color: var(--text-gray);
          transition: .5s;
          pointer-events: none;
          z-index: 31;
        }

        .input-box input:focus ~ label,
        .input-box input:valid ~ label {
          top: -5px;
          color: var(--gold);
          font-weight: 500;
        }

        .input-box box-icon {
          position: absolute;
          top: 50%;
          right: 0;
          font-size: 18px;
          transform: translateY(-50%);
          color: var(--text-gray);
          transition: .5s;
          z-index: 31;
          pointer-events: none;
        }

        .input-box input:focus ~ box-icon,
        .input-box input:valid ~ box-icon {
          color: var(--gold);
        }

        .btn {
          position: relative;
          width: 100%;
          height: 45px;
          background: transparent;
          border-radius: 40px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          border: 2px solid var(--gold);
          overflow: hidden;
          z-index: 30;
          color: var(--navy);
          transition: color 0.4s ease;
        }

        .btn::before {
          content: "";
          position: absolute;
          height: 300%;
          width: 100%;
          background: linear-gradient(var(--white), var(--gold), var(--white), var(--gold-light));
          top: -100%;
          left: 0;
          z-index: -1;
          transition: .5s;
        }

        .btn:hover::before {
          top: 0;
        }

        .btn:hover {
          color: var(--white);
        }

        .regi-link {
          font-size: 14px;
          text-align: center;
          margin: 20px 0 10px;
          color: var(--text-gray);
          position: relative;
          z-index: 30;
        }

        .regi-link p {
          color: var(--text-gray);
        }

        .regi-link a {
          text-decoration: none;
          color: var(--gold);
          font-weight: 600;
          transition: var(--transition);
          cursor: pointer;
          position: relative;
          z-index: 31;
        }

        .regi-link a:hover {
          text-decoration: underline;
          color: var(--navy-light);
        }

        .info-content h2 {
          text-transform: uppercase;
          font-size: 36px;
          line-height: 1.3;
        }

        .info-content p {
          font-size: 16px;
          line-height: 1.6;
        }

        @media (max-width: 800px) {
          body {
            padding: 15px;
            align-items: flex-start;
            padding-top: 30px;
          }

          .container {
            width: 100%;
            max-width: 500px;
            height: auto;
            min-height: 520px;
            border-radius: var(--radius-sm);
          }

          .container .form-box {
            width: 100%;
            height: auto;
            min-height: 520px;
            padding: 30px 25px !important;
            position: absolute;
            top: 0;
            left: 0;
            background: var(--white);
          }

          .form-box.Login {
            display: flex;
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
          }

          .form-box.Register {
            display: flex;
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
          }

          .container.active .form-box.Login {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
          }

          .container.active .form-box.Register {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
          }

          .container .info-content,
          .container .curved-shape,
          .container .curved-shape2 {
            display: none;
          }

          .form-box.Login .animation,
          .container.active .form-box.Login .animation,
          .form-box.Register .animation,
          .container.active .form-box.Register .animation {
            transform: translateX(0);
            opacity: 1;
            filter: blur(0);
            transition: none;
          }
        }

        @media (max-width: 480px) {
          .container {
            min-height: 480px;
          }

          .container .form-box {
            min-height: 480px;
            padding: 25px 20px !important;
          }

          .form-box h2 {
            font-size: 26px;
          }

          .btn {
            height: 42px;
            font-size: 15px;
          }

          .input-box input {
            font-size: 15px;
          }
        }
      `}</style>

      <div className={`container ${active ? 'active' : ''}`} id="authContainer">
        <div className="curved-shape"></div>
        <div className="curved-shape2"></div>

        {/* Login Form */}
        <div className="form-box Login">
          <h2 className="animation" style={{ '--D': 0, '--S': 21 } as React.CSSProperties}>
            Login
          </h2>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="input-box animation" style={{ '--D': 1, '--S': 22 } as React.CSSProperties}>
              <input type="text" required />
              <label>Username</label>
              <box-icon type="solid" name="user"></box-icon>
            </div>

            <div className="input-box animation" style={{ '--D': 2, '--S': 23 } as React.CSSProperties}>
              <input type="password" required />
              <label>Password</label>
              <box-icon name="lock-alt" type="solid"></box-icon>
            </div>

            <div className="input-box animation" style={{ '--D': 3, '--S': 24 } as React.CSSProperties}>
              <button className="btn" type="submit">Login</button>
            </div>

            <div className="regi-link animation" style={{ '--D': 4, '--S': 25 } as React.CSSProperties}>
              <p>
                Don't have an account?
                <br />
                <a href="#" className="SignUpLink" onClick={handleSignUp}>
                  Sign Up
                </a>
              </p>
            </div>
          </form>
        </div>

        {/* Login Info */}
        <div className="info-content Login">
          <h2 className="animation" style={{ '--D': 0, '--S': 20 } as React.CSSProperties}>
            WELCOME BACK!
          </h2>
          <p className="animation" style={{ '--D': 1, '--S': 21 } as React.CSSProperties}>
            We are happy to have you with us again. If you need anything, we are here to help.
          </p>
        </div>

        {/* Register Form */}
        <div className="form-box Register">
          <h2 className="animation" style={{ '--li': 17, '--S': 0 } as React.CSSProperties}>
            Register
          </h2>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="input-box animation" style={{ '--li': 18, '--S': 1 } as React.CSSProperties}>
              <input type="text" required />
              <label>Username</label>
              <box-icon type="solid" name="user"></box-icon>
            </div>

            <div className="input-box animation" style={{ '--li': 19, '--S': 2 } as React.CSSProperties}>
              <input type="email" required />
              <label>Email</label>
              <box-icon name="envelope" type="solid"></box-icon>
            </div>

            <div className="input-box animation" style={{ '--li': 20, '--S': 3 } as React.CSSProperties}>
              <input type="password" required />
              <label>Password</label>
              <box-icon name="lock-alt" type="solid"></box-icon>
            </div>

            <div className="input-box animation" style={{ '--li': 21, '--S': 4 } as React.CSSProperties}>
              <button className="btn" type="submit">Register</button>
            </div>

            <div className="regi-link animation" style={{ '--li': 22, '--S': 5 } as React.CSSProperties}>
              <p>
                Already have an account?
                <br />
                <a href="#" className="SignInLink" onClick={handleSignIn}>
                  Sign In
                </a>
              </p>
            </div>
          </form>
        </div>

        {/* Register Info */}
        <div className="info-content Register">
          <h2 className="animation" style={{ '--li': 17, '--S': 0 } as React.CSSProperties}>
            WELCOME!
          </h2>
          <p className="animation" style={{ '--li': 18, '--S': 1 } as React.CSSProperties}>
            We're delighted to have you here. If you need any assistance, feel free to reach out.
          </p>
        </div>
      </div>
    </>
  );
}