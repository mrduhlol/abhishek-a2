import { useEffect, useRef, useState } from "react";
import Icon from "./Icon.jsx";

const EMAIL = "abhishek.a2534@gmail.com";

export default function Contact() {
  const [status, setStatus] = useState("idle");
  const mounted = useRef(false);
  const pending = useRef(false);
  const timer = useRef();

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(timer.current);
    };
  }, []);

  const copy = async () => {
    if (pending.current) return;
    pending.current = true;
    clearTimeout(timer.current);
    setStatus("copying");

    try {
      await navigator.clipboard.writeText(EMAIL);
      if (!mounted.current) return;
      setStatus("copied");
      timer.current = setTimeout(() => setStatus("idle"), 2500);
    } catch {
      if (mounted.current) setStatus("error");
    } finally {
      pending.current = false;
    }
  };

  return (
    <section
      id="contact"
      data-chapter
      className="contact-section"
      aria-labelledby="contact-title"
    >
      <span className="handwritten contact-note">
        You made it. Glad you stayed.
      </span>
      <h2 id="contact-title">
        GOOD THINGS
        <br />
        START WITH <em>HELLO.</em>
      </h2>
      <div className="contact-row">
        <a className="email-link" href={`mailto:${EMAIL}`}>
          {EMAIL}
          <Icon name="northeast" size={24} />
        </a>
        <button
          type="button"
          onClick={copy}
          className="copy-email"
          aria-disabled={status === "copying"}
          aria-describedby="email-copy-status"
        >
          {status === "copied"
            ? "Copied!"
            : status === "copying"
              ? "Copying…"
              : "Copy email"}
        </button>
      </div>
      <p
        id="email-copy-status"
        className={status === "error" ? "copy-status" : "sr-only"}
        role="status"
        aria-atomic="true"
      >
        {status === "copied"
          ? "Email address copied to clipboard."
          : status === "error"
            ? "Couldn't copy. Select and copy the email address above manually."
            : ""}
      </p>
      <nav aria-label="Social links" className="social-links">
        <a
          href="https://github.com/mrduhlol"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
          <span className="sr-only"> (opens in a new tab)</span>
          <Icon name="northeast" size={15} />
        </a>
        <a
          href="https://www.linkedin.com/in/duhlol"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
          <span className="sr-only"> (opens in a new tab)</span>
          <Icon name="northeast" size={15} />
        </a>
      </nav>
      <div className="town-invitation">
        <span className="handwritten">
          Not quite the end.
          <br />
          There's a whole little life down here.
        </span>
        <Icon name="down" size={28} />
      </div>
    </section>
  );
}
