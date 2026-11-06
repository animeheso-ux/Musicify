import React from "react";
import "./DefaultPage.css";

// Use the same blossom background + logo as your login page.
// e.g. import bg from "./assets/cherry-blossom.jpg";

const HIGHLIGHTS = [
  {
    title: "Pick a mood",
    text: "Find songs for calm, focus, or dancing.",
  },
  {
    title: "Download in one click",
    text: "Save songs straight to your device.",
  },
  {
    title: "Listen anywhere",
    text: "Play your downloads offline, any time.",
  },
];

/**
 * The page visitors see before they log in.
 *
 * With React Router:
 *   <Route path="/" element={<DefaultPage />} />
 */
export default function DefaultPage({
  loginHref = "/login",
  signupHref = "/Sign",
  aboutHref = "/about",
}) {
  return (
    <div className="landing-page">

      <main className="landing-content">
        <section className="landing-hero">
          <h1 className="landing-tagline">Download music that lifts the soul!</h1>
          <p className="landing-subtext">
            Browse songs by mood, download them in one click, and keep them to
            play anywhere.
          </p>

          <a className="landing-button" href={signupHref}>
            Sign up
          </a>
          <a className="landing-link" href={loginHref}>
            Already have an account? Login
          </a>
        </section>

        <ul className="landing-highlights">
          {HIGHLIGHTS.map((item) => (
            <li key={item.title} className="landing-highlight">
              <h2>{item.title}</h2>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}