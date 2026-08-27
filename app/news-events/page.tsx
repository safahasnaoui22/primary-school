'use client';

import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

type NewsCategory = 'All' | 'Announcement' | 'Achievement' | 'Policy';

interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  category: Exclude<NewsCategory, 'All'>;
  slug: string;
}

interface EventItem {
  id: number;
  title: string;
  day: string;
  month: string;
  time: string;
  location: string;
}

const news: NewsItem[] = [
  {
    id: 1,
    title: 'Enrollment for next year opens March 1st',
    excerpt: 'Returning families get priority placement through February. New applications open to the public shortly after.',
    date: 'Jul 2, 2026',
    category: 'Announcement',
    slug: 'enrollment-opens',
  },
  {
    id: 2,
    title: 'Grade 4 wins regional science fair',
    excerpt: 'Our students took first place with a project on water filtration, competing against 14 schools in the district.',
    date: 'Jun 28, 2026',
    category: 'Achievement',
    slug: 'science-fair-win',
  },
  {
    id: 3,
    title: 'Updated pickup and drop-off procedure',
    excerpt: 'Starting next term, all pickups route through the east gate to reduce congestion on Main Street.',
    date: 'Jun 20, 2026',
    category: 'Policy',
    slug: 'pickup-procedure-update',
  },
  {
    id: 4,
    title: 'Summer reading list now available',
    excerpt: 'Teachers have posted grade-level reading lists in the parent portal to keep kids sharp over the break.',
    date: 'Jun 15, 2026',
    category: 'Announcement',
    slug: 'summer-reading-list',
  },
  {
    id: 5,
    title: 'Two teachers recognized at district awards',
    excerpt: 'Mrs. Owens and Mr. Ibrahim were honored for excellence in early-childhood education this month.',
    date: 'Jun 10, 2026',
    category: 'Achievement',
    slug: 'teacher-awards',
  },
];

const events: EventItem[] = [
  { id: 1, title: 'Sports Day', day: '12', month: 'Jul', time: '9:00 AM', location: 'Main field' },
  { id: 2, title: 'Parent-teacher conferences', day: '18', month: 'Jul', time: '2:00 – 6:00 PM', location: 'Classrooms' },
  { id: 3, title: 'Summer arts showcase', day: '25', month: 'Jul', time: '4:30 PM', location: 'Auditorium' },
  { id: 4, title: 'New family orientation', day: '02', month: 'Aug', time: '10:00 AM', location: 'Main hall' },
  { id: 5, title: 'First day of term', day: '18', month: 'Aug', time: '8:00 AM', location: 'All campuses' },
];

const categories: NewsCategory[] = ['All', 'Announcement', 'Achievement', 'Policy'];

const categoryColor: Record<Exclude<NewsCategory, 'All'>, string> = {
  Announcement: '#FFB400',
  Achievement: '#4C7C59',
  Policy: '#071B4A',
};

export default function NewsEventsPage() {
  const [filter, setFilter] = useState<NewsCategory>('All');
  const visibleNews = filter === 'All' ? news : news.filter((n) => n.category === filter);

  return (
    <>
      <Head>
        <title>News & Events</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap"
          rel="stylesheet"
        />
      </Head>

      <style>{`
        .ne-page {
          --navy: #071B4A;
          --gold: #FFB400;
          --green: #4C7C59;
          --paper: #FDFBF6;
          --bg: #F4F5F8;
          --text-gray: #5A6A7A;
          font-family: 'Inter', sans-serif;
          background: var(--bg);
          min-height: 100vh;
          padding: 64px 24px 80px;
        }

        .ne-hero {
          text-align: center;
          max-width: 560px;
          margin: 0 auto 48px;
        }

        .ne-hero .eyebrow {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--navy);
          opacity: 0.65;
        }

        .ne-hero h1 {
          font-family: 'Fraunces', serif;
          font-weight: 600;
          font-size: clamp(30px, 4.5vw, 46px);
          color: var(--navy);
          margin: 8px 0 10px;
        }

        .ne-hero p {
          color: var(--text-gray);
          font-size: 15px;
        }

        .ne-layout {
          max-width: 1080px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 320px;
          gap: 48px;
          align-items: start;
        }

        .ne-section-title {
          font-family: 'Fraunces', serif;
          font-size: 20px;
          color: var(--navy);
          margin: 0 0 16px;
        }

        .news-filters {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .news-filter-btn {
          font-size: 13px;
          font-weight: 600;
          padding: 7px 14px;
          border-radius: 16px;
          border: 1px solid rgba(7,27,74,0.15);
          background: var(--paper);
          color: var(--navy);
          cursor: pointer;
        }

        .news-filter-btn.active {
          background: var(--navy);
          color: #fff;
          border-color: var(--navy);
        }

        .news-filter-btn:focus-visible {
          outline: 2px solid var(--navy);
          outline-offset: 2px;
        }

        .news-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .news-card {
          background: var(--paper);
          border-radius: 10px;
          padding: 20px 22px;
          box-shadow: 0 3px 10px rgba(7,27,74,0.06);
          border-left: 4px solid var(--accent, var(--navy));
        }

        .news-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .news-date {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: var(--text-gray);
          letter-spacing: 0.5px;
        }

        .news-tag {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 9px;
          border-radius: 10px;
          color: #fff;
          background: var(--accent, var(--navy));
        }

        .news-card h3 {
          font-family: 'Fraunces', serif;
          font-size: 18px;
          font-weight: 600;
          color: var(--navy);
          margin: 0 0 8px;
        }

        .news-card p {
          font-size: 14px;
          color: var(--text-gray);
          line-height: 1.6;
          margin: 0 0 10px;
        }

        .news-card a {
          font-size: 13px;
          font-weight: 600;
          color: var(--navy);
          text-decoration: none;
          border-bottom: 1px solid var(--gold);
        }

        .events-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .event-card {
          display: flex;
          background: var(--paper);
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 3px 10px rgba(7,27,74,0.06);
        }

        .event-date-block {
          width: 68px;
          flex-shrink: 0;
          background: var(--navy);
          color: #fff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 12px 0;
          position: relative;
        }

        .event-date-block .month {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          letter-spacing: 1.5px;
          color: var(--gold);
          text-transform: uppercase;
        }

        .event-date-block .day {
          font-family: 'Fraunces', serif;
          font-size: 26px;
          font-weight: 600;
          line-height: 1.1;
        }

        .event-date-block::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 6px;
          background-image: radial-gradient(circle, var(--bg) 2px, transparent 2.5px);
          background-size: 10px 10px;
          background-position: 0 -3px;
        }

        .event-info {
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 3px;
        }

        .event-info h4 {
          font-family: 'Fraunces', serif;
          font-size: 15px;
          font-weight: 600;
          color: var(--navy);
          margin: 0;
        }

        .event-info span {
          font-size: 12px;
          color: var(--text-gray);
        }

        @media (max-width: 860px) {
          .ne-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="ne-page">
        <div className="ne-hero">
          <span className="eyebrow">Stay in the loop</span>
          <h1>News &amp; events</h1>
          <p>What's happening around school this term, and what's coming up next.</p>
        </div>

        <div className="ne-layout">
          <section aria-label="News">
            <h2 className="ne-section-title">Latest news</h2>

            <div className="news-filters" role="tablist" aria-label="Filter news by category">
              {categories.map((cat) => (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={filter === cat}
                  className={`news-filter-btn ${filter === cat ? 'active' : ''}`}
                  onClick={() => setFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="news-list">
              {visibleNews.map((item) => (
                <article
                  key={item.id}
                  className="news-card"
                  style={{ '--accent': categoryColor[item.category] } as React.CSSProperties}
                >
                  <div className="news-card-top">
                    <span className="news-date">{item.date}</span>
                    <span className="news-tag" style={{ background: categoryColor[item.category] }}>
                      {item.category}
                    </span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.excerpt}</p>
                  <Link href={`/news-events/${item.slug}`}>Read more →</Link>
                </article>
              ))}
              {visibleNews.length === 0 && (
                <p style={{ color: '#5A6A7A', fontSize: 14 }}>No news in this category yet.</p>
              )}
            </div>
          </section>

          <aside aria-label="Upcoming events">
            <h2 className="ne-section-title">Upcoming events</h2>
            <div className="events-list">
              {events.map((ev) => (
                <div className="event-card" key={ev.id}>
                  <div className="event-date-block">
                    <span className="month">{ev.month}</span>
                    <span className="day">{ev.day}</span>
                  </div>
                  <div className="event-info">
                    <h4>{ev.title}</h4>
                    <span>{ev.time}</span>
                    <span>{ev.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}