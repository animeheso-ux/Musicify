import React from "react";
import "./ErrorPage.css";

// Swap this for the same background + logo you use on the login page.
// e.g. import bg from "./assets/cherry-blossom.jpg";
const BACKGROUND = "/cherry-blossom.jpg";

/**
 * Usage:
 *   <ErrorPage />                                   -> 404 page
 *   <ErrorPage code="500" title="Something broke on our end"
 *              message="Wait a moment, then try again." />
 *
 * With React Router, use it as the catch-all route:
 *   <Route path="*" element={<ErrorPage />} />
 */
export default function ErrorPage({
  code = "404",
  title = "We can't find that page",
  message = "The link may be broken or the page may have moved. Head back to log in, or check the address and try again.",
  primaryLabel = "Back to login",
  primaryHref = "/Login",
  secondaryLabel = "Go to home",
  secondaryHref = "/",
}) {
  return (
    <div className="error-page" >

      <main className="error-content" role="alert">
        <h1 className="error-tagline">Download music that lifts the soul!</h1>

        <section className="error-card">
          <p className="error-code">{code}</p>
          <h2 className="error-title">{title}</h2>
          <p className="error-message">{message}</p>

          <a className="error-button" href={primaryHref}>
            {primaryLabel}
          </a>
          <a className="error-link" href={secondaryHref}>
            {secondaryLabel}
          </a>
        </section>
      </main>
    </div>
  );
}