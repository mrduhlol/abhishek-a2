import './PortraitOpening.css';

export default function PortraitOpening() {
  return (
    <section className="portrait-opening" aria-labelledby="portrait-name">
      <div className="portrait-opening__stage">
        <img
          src={`${import.meta.env.BASE_URL}abhishek-cutout.png`}
          alt="Abhishek wearing glasses and a white shirt"
          width="1254"
          height="1254"
          fetchPriority="high"
          className="portrait-opening__photo"
        />
        <h1 id="portrait-name" className="portrait-opening__name">ABHISHEK A.</h1>
      </div>
      <a className="portrait-opening__continue" href="#site-update">A new adventure is taking shape <span aria-hidden="true">↓</span></a>
    </section>
  );
}
