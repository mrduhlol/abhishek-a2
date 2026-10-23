import Icon from "./Icon.jsx";

export default function Footer() {
  return (
    <footer className="site-footer">
      <a href="#top" className="wordmark" aria-label="Back to top">
        a<span>.</span>
      </a>
      <p>
        © {new Date().getFullYear()} Abhishek A.
        <span>Built with a little wander.</span>
      </p>
      <a href="#top">
        Back to the beginning
        <Icon name="arrow" size={17} />
      </a>
    </footer>
  );
}
