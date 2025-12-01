"use client";

import { motion } from "framer-motion";

const VIDEOS = [
  {
    id: "v1",
    title: "Wind River Cloud Platform",
     src:"https://www.youtube.com/embed/iXl9F2ZsrZc?si=fw1iwRPvrr-FbL8h",
  },
  {
    id: "v2",
    title: "Live Masterpiece",
    src: "https://www.youtube.com/embed/rdqi0ptAHFs?si=Ww4s2FCB4X5QMNY0",
  },
  {
    id: "v3",
    title: "Convenient Investment",
    src: "https://www.youtube.com/embed/LGHsNaIv5os?si=M9jJRgms36EDFvs3",
  },
];

export default function VideoSection() {
  return (
    <motion.section
            whileInView={{ scale: 1, opacity: 1 }}
            initial={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
      <div className="container">
        <header className="video-head">
          <h3 id="video-section-title">Learn More — Video Guides</h3>
          <p className="lead">
            Short walkthroughs and explanations — watch to understand how our plans work.
          </p>
        </header>

        <div className="video-grid" role="list">
  {VIDEOS.map((v) => (
    <motion.div
      key={v.id}
      whileInView={{ y: 0, opacity: 1 }}
      initial={{ y: "100%", opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="video-wrapper" aria-hidden={false}>
        <iframe
          title={v.title}
          src={v.src}
          frameBorder="0"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
      <div className="video-caption">
        <strong>{v.title}</strong>
      </div>
    </motion.div>
  ))}
</div>

      </div>

      <style jsx>{`
        :root {
          --max-width: 1280px;
          --pad-vertical: 48px;
          --pad-horizontal: 20px;
          --gap: 22px;
          --card-radius: 14px;
          --accent-bg: linear-gradient(180deg, rgba(15, 23, 42, 0.02), rgba(255,255,255,0.02));
        }

        .video-section {
          background: var(--accent-bg);
          padding: var(--pad-vertical) 0;
        }

        .container {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: 0 var(--pad-horizontal);
          box-sizing: border-box;
        }

        .video-head {
          text-align: center;
          margin-bottom: 28px;
          padding: 0 6px;
        }

        .video-head h3 {
          margin: 0;
          color: #c7cfddff;
          font-size: clamp(1.125rem, 1.5vw, 1.5rem);
          font-weight: 800;
          letter-spacing: -0.2px;
        }

        .lead {
          margin: 8px 0 0;
          color: #d3dbe6ff;
          font-size: clamp(0.95rem, 1.1vw, 1rem);
        }

        /* Grid: start single column, then 2, then 3 */
        .video-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--gap);
          align-items: start;
        }

        @media (min-width: 640px) {
          .video-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: calc(var(--gap) + 6px);
          }
        }

        @media (min-width: 1100px) {
          .video-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: calc(var(--gap) + 10px);
          }
        }

        .video-card {
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: #250b0bff;
          border-radius: var(--card-radius);
          padding: 12px;
          border: 1px solid rgba(15, 23, 42, 0.04);
          box-shadow: 0 6px 20px rgba(2, 6, 23, 0.04);
          transition: transform 220ms ease, box-shadow 220ms ease;
        }

        .video-card:focus-within,
        .video-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 28px 64px rgba(2, 6, 23, 0.10);
        }

        /* Responsive iframe wrapper: maintain 16:9 aspect ratio with fallback */
        .video-wrapper {
          position: relative;
          width: 100%;
          border-radius: 10px;
          overflow: hidden;
          background: #000;
        }

        .video-wrapper iframe {
          width: 100%;
          height: 100%;
          border: 0;
          display: block;
          /* prefer aspect-ratio when available */
          aspect-ratio: 16 / 9;
        }

        /* Fallback for browsers that don't support aspect-ratio */
        @supports not (aspect-ratio: 16/9) {
          .video-wrapper {
            height: 0;
            padding-top: 56.25%; /* 16:9 */
          }
          .video-wrapper iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          }
        }

        .video-caption {
          color: #d9e0eeff;
          font-weight: 700;
          font-size: 0.98rem;
          padding: 6px 4px 0;
          word-break: break-word;
        }

        /* Spacing & touch target improvements on small screens */
        @media (max-width: 520px) {
          :root {
            --pad-horizontal: 14px;
            --pad-vertical: 28px;
            --gap: 14px;
          }
          .container {
            padding-left: 14px;
            padding-right: 14px;
          }
          .video-card {
            padding: 10px;
            border-radius: 12px;
          }
          .video-caption {
            font-size: 0.95rem;
          }
        }

        /* Larger paddings for wide screens */
        @media (min-width: 1400px) {
          :root {
            --pad-horizontal: 32px;
            --pad-vertical: 64px;
          }
          .container {
            padding-left: 32px;
            padding-right: 32px;
          }
          .video-card {
            padding: 16px;
          }
        }

        /* Make focus outlines accessible */
        .video-card :focus {
          outline: 3px solid rgba(37, 99, 235, 0.14);
          outline-offset: 4px;
        }
      `}</style>
    </motion.section>
  );
}