"use client";

import Image from "next/image";
import "./Activities.css";

export default function Activities() {
  return (
    <div className="container">
      <header className="main-header clearfix">
        <h1 className="h1activities">
          our activities
        </h1>
      </header>

      <div className="content clearfix">
        {/* CUBE 1 */}
        <div className="cube-container">
          <div className="photo-cube">
            <Image
              className="front"
              src="https://i.pinimg.com/1200x/42/ae/c8/42aec8f6d99b6eb58b982d5f82c860b2.jpg"
              alt="Earth view"
              width={300}
              height={280}
            />

            <div className="back photo-desc">
              <h3>Earth from Space</h3>
              <p>
                Aenean lacinia bibendum nulla sed consectetur. Fusce dapibus,
                tellus ac cursus commodo.
              </p>
              <a href="#" className="button">
                download
              </a>
            </div>

            <Image
              className="left"
              src="https://i.pinimg.com/1200x/59/63/0e/59630e6a631b0c095492bf4864cdaf62.jpg"
              alt="Astronaut"
              width={300}
              height={280}
            />

            <Image
              className="right"
              src="https://i.pinimg.com/736x/1b/58/e5/1b58e5d758977246f819b59abfbd6eb4.jpg"
              alt="Rocket"
              width={300}
              height={280}
            />
          </div>
        </div>

        {/* CUBE 2 */}
        <div className="cube-container">
          <div className="photo-cube">
            <Image
              className="front"
              src="https://i.pinimg.com/736x/1b/f0/ea/1bf0ea1852209e3cd86caea85a382941.jpg"
              alt="Nebula"
              width={300}
              height={280}
            />

            <div className="back photo-desc">
              <h3>Space Images</h3>
              <p>
                Aenean lacinia bibendum nulla sed consectetur. Fusce dapibus,
                tellus ac cursus commodo.
              </p>
              <a href="#" className="button">
                download
              </a>
            </div>

            <Image
              className="left"
              src="https://i.pinimg.com/736x/aa/05/ff/aa05ff3ee00176c2ba2e19d4ab6e1ad9.jpg"
              alt="Planet"
              width={300}
              height={280}
            />

            <Image
              className="right"
              src="https://i.pinimg.com/736x/c4/20/ef/c420efd1b8c50a2215eba9c2459a80c5.jpg"
              alt="Observatory"
              width={300}
              height={280}
            />
          </div>
        </div>

        {/* CUBE 3 */}
        <div className="cube-container">
          <div className="photo-cube">
            <Image
              className="front"
              src="https://i.pinimg.com/736x/9a/21/c3/9a21c3754431d5a54c479fdc8618cf2a.jpg"
              alt="Galaxy"
              width={300}
              height={280}
            />

            <div className="back photo-desc">
              <h3>The Milky Way</h3>
              <p>
                Aenean lacinia bibendum nulla sed consectetur. Fusce dapibus,
                tellus ac cursus commodo.
              </p>
              <a href="#" className="button">
                download
              </a>
            </div>

            <Image
              className="left"
              src="https://i.pinimg.com/736x/14/6e/a7/146ea71b5ea7b5e421809e60b713bdad.jpg"
              alt="Star field"
              width={300}
              height={280}
            />

            <Image
              className="right"
              src="https://i.pinimg.com/736x/db/e9/1a/dbe91aa9a5a686f6fa428e442e14c8d7.jpg"
              alt="Aurora"
              width={300}
              height={280}
            />
          </div>
        </div>
      </div>
    </div>
  );
}