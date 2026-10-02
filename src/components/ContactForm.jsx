import { useId, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import MagneticButton from "./MagneticButton.jsx";
import { SOCIALS } from "../data/portfolio.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_MESSAGE = 500;

function validate(values) {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = "Tell me your name (2+ characters).";
  if (!EMAIL_RE.test(values.email.trim())) errors.email = "That email doesn’t look right yet.";
  if (values.message.trim().length < 10) errors.message = "Give me a little more detail (10+ characters).";
  return errors;
}

function FieldShell({ label, htmlFor, error, errorId, children, hint }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-[12px] font-semibold tracking-[0.14em] text-muted uppercase">
          {label}
        </label>
        {hint && <span className="font-mono text-[11px] text-muted/80">{hint}</span>}
      </div>
      {children}
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            id={errorId}
            role="alert"
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden pt-2 text-[13px] text-red-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ContactForm() {
  const reduce = useReducedMotion();
  const baseId = useId();
  const ids = useMemo(
    () => ({
      name: `${baseId}-name`,
      email: `${baseId}-email`,
      message: `${baseId}-message`,
      nameError: `${baseId}-name-error`,
      emailError: `${baseId}-email-error`,
      messageError: `${baseId}-message-error`,
      status: `${baseId}-status`,
    }),
    [baseId]
  );

  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [shakeKey, setShakeKey] = useState({ name: 0, email: 0, message: 0 });
  const [status, setStatus] = useState("idle"); // idle | sending | sent

  const set = (field) => (e) => {
    const next = { ...values, [field]: e.target.value };
    setValues(next);
    if (touched[field]) setErrors(validate(next));
  };

  const blur = (field) => () => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate(values));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setTouched({ name: true, email: true, message: true });
    if (Object.keys(nextErrors).length > 0) {
      const firstBad = ["name", "email", "message"].find((f) => nextErrors[f]);
      setShakeKey((s) => ({ ...s, [firstBad]: s[firstBad] + 1 }));
      document.getElementById(ids[firstBad])?.focus();
      return;
    }
    setStatus("sending");
    window.setTimeout(() => setStatus("sent"), 1100);
  };

  const reset = () => {
    setValues({ name: "", email: "", message: "" });
    setTouched({});
    setErrors({});
    setStatus("idle");
  };

  const messageLen = values.message.length;
  const progress = Math.min(1, messageLen / MAX_MESSAGE);

  const mailto = `mailto:${SOCIALS.emailLabel}?subject=${encodeURIComponent(
    `Hello from ${values.name || "your site"}`
  )}&body=${encodeURIComponent(`${values.message}\n\n— ${values.name} (${values.email})`)}`;

  return (
    <div className="mt-14 rounded-3xl border border-line bg-surface/60 p-6 backdrop-blur-sm md:p-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Send a message</p>
          <h3 className="display-tight mt-3 text-3xl md:text-4xl">Start the conversation.</h3>
          <p className="mt-2 max-w-md text-[14px] leading-relaxed text-muted">
            Inline validation, tactile feedback, zero page reloads. I usually reply within a day.
          </p>
        </div>
        <div aria-hidden="true" className="hidden items-center gap-2 font-mono text-[11px] text-muted sm:flex">
          <span className={`h-2 w-2 rounded-full transition-colors ${status === "sent" ? "bg-emerald-400" : status === "sending" ? "bg-amber-300" : "bg-emerald-400/60"}`} />
          {status === "sent" ? "MESSAGE READY" : status === "sending" ? "SENDING…" : "ONLINE"}
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {status === "sent" ? (
          <motion.div
            key="done"
            initial={reduce ? false : { opacity: 0, y: 14, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] p-6 text-center"
            role="status"
          >
            <motion.svg
              viewBox="0 0 52 52"
              className="mx-auto h-12 w-12"
              aria-hidden="true"
              initial={false}
            >
              <motion.circle
                cx="26"
                cy="26"
                r="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-emerald-400/60"
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
              <motion.path
                d="M15 27l7 7 15-16"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-emerald-300"
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.45, delay: 0.25, ease: "easeOut" }}
              />
            </motion.svg>
            <p className="display-tight mt-4 text-2xl">Nice — that’s ready to send.</p>
            <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-muted">
              This demo has no backend, so your message was validated locally. Open it in your mail app to actually send it.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <MagneticButton strength={0.18}>
                <motion.a
                  href={mailto}
                  whileHover={reduce ? undefined : { y: -1 }}
                  whileTap={reduce ? undefined : { scale: 0.96 }}
                  className="btn-shine relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-btn px-6 py-3 text-[11px] font-bold tracking-[0.12em] text-btnink"
                >
                  <span className="relative z-[1]">OPEN IN EMAIL →</span>
                </motion.a>
              </MagneticButton>
              <button
                type="button"
                onClick={reset}
                className="rounded-full border border-line px-6 py-3 text-[11px] font-bold tracking-[0.12em] text-muted transition-colors hover:border-ink/30 hover:text-ink"
              >
                WRITE ANOTHER
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            noValidate
            onSubmit={onSubmit}
            initial={false}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="mt-8 grid gap-6 md:grid-cols-2"
            aria-describedby={ids.status}
          >
            <motion.div
              key={`name-${shakeKey.name}`}
              animate={reduce || shakeKey.name === 0 ? undefined : { x: [0, -8, 8, -5, 5, 0] }}
              transition={{ duration: 0.4 }}
            >
              <FieldShell label="Your name" htmlFor={ids.name} error={touched.name ? errors.name : undefined} errorId={ids.nameError}>
                <input
                  id={ids.name}
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Ada Lovelace"
                  value={values.name}
                  onChange={set("name")}
                  onBlur={blur("name")}
                  aria-invalid={Boolean(touched.name && errors.name)}
                  aria-describedby={touched.name && errors.name ? ids.nameError : undefined}
                  className={`field-input w-full rounded-2xl border bg-page/60 px-4 py-3.5 text-[15px] text-ink placeholder:text-muted/50 outline-none transition-[border-color,box-shadow,transform] duration-200 focus:-translate-y-px ${
                    touched.name && errors.name
                      ? "border-red-400/60 focus:border-red-300 focus:shadow-[0_0_0_3px_rgba(248,113,113,0.15)]"
                      : "border-line hover:border-ink/25 focus:border-[#5B8CFF]/70 focus:shadow-[0_0_0_3px_rgba(91,140,255,0.18)]"
                  }`}
                />
              </FieldShell>
            </motion.div>

            <motion.div
              key={`email-${shakeKey.email}`}
              animate={reduce || shakeKey.email === 0 ? undefined : { x: [0, -8, 8, -5, 5, 0] }}
              transition={{ duration: 0.4 }}
            >
              <FieldShell label="Email" htmlFor={ids.email} error={touched.email ? errors.email : undefined} errorId={ids.emailError}>
                <input
                  id={ids.email}
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={values.email}
                  onChange={set("email")}
                  onBlur={blur("email")}
                  aria-invalid={Boolean(touched.email && errors.email)}
                  aria-describedby={touched.email && errors.email ? ids.emailError : undefined}
                  className={`field-input w-full rounded-2xl border bg-page/60 px-4 py-3.5 text-[15px] text-ink placeholder:text-muted/50 outline-none transition-[border-color,box-shadow,transform] duration-200 focus:-translate-y-px ${
                    touched.email && errors.email
                      ? "border-red-400/60 focus:border-red-300 focus:shadow-[0_0_0_3px_rgba(248,113,113,0.15)]"
                      : "border-line hover:border-ink/25 focus:border-[#5B8CFF]/70 focus:shadow-[0_0_0_3px_rgba(91,140,255,0.18)]"
                  }`}
                />
              </FieldShell>
            </motion.div>

            <motion.div
              key={`message-${shakeKey.message}`}
              animate={reduce || shakeKey.message === 0 ? undefined : { x: [0, -8, 8, -5, 5, 0] }}
              transition={{ duration: 0.4 }}
              className="md:col-span-2"
            >
              <FieldShell
                label="Message"
                htmlFor={ids.message}
                error={touched.message ? errors.message : undefined}
                errorId={ids.messageError}
                hint={`${messageLen}/${MAX_MESSAGE}`}
              >
                <textarea
                  id={ids.message}
                  name="message"
                  rows={4}
                  maxLength={MAX_MESSAGE}
                  placeholder="Hi Abhishek — I’d love to talk about…"
                  value={values.message}
                  onChange={set("message")}
                  onBlur={blur("message")}
                  aria-invalid={Boolean(touched.message && errors.message)}
                  aria-describedby={touched.message && errors.message ? ids.messageError : undefined}
                  className={`field-input w-full resize-y rounded-2xl border bg-page/60 px-4 py-3.5 text-[15px] leading-relaxed text-ink placeholder:text-muted/50 outline-none transition-[border-color,box-shadow] duration-200 ${
                    touched.message && errors.message
                      ? "border-red-400/60 focus:border-red-300 focus:shadow-[0_0_0_3px_rgba(248,113,113,0.15)]"
                      : "border-line hover:border-ink/25 focus:border-[#5B8CFF]/70 focus:shadow-[0_0_0_3px_rgba(91,140,255,0.18)]"
                  }`}
                />
                <div aria-hidden="true" className="mt-2 h-1 overflow-hidden rounded-full bg-line/60">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6]"
                    initial={false}
                    animate={{ scaleX: progress }}
                    transition={{ duration: 0.2 }}
                    style={{ transformOrigin: "left" }}
                  />
                </div>
              </FieldShell>
            </motion.div>

            <div className="flex flex-wrap items-center gap-4 md:col-span-2">
              <MagneticButton strength={0.18}>
                <motion.button
                  type="submit"
                  disabled={status === "sending"}
                  whileHover={reduce || status === "sending" ? undefined : { y: -1 }}
                  whileTap={reduce || status === "sending" ? undefined : { scale: 0.96 }}
                  className="btn-shine relative inline-flex min-w-[190px] items-center justify-center gap-2 overflow-hidden rounded-full bg-btn px-7 py-3.5 text-[12px] font-bold tracking-[0.12em] text-btnink outline-none transition-[box-shadow,opacity] duration-300 hover:shadow-[0_8px_30px_rgba(91,140,255,0.35)] focus-visible:ring-2 focus-visible:ring-[#5B8CFF] disabled:cursor-wait disabled:opacity-80"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {status === "sending" ? (
                      <motion.span
                        key="sending"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                        className="relative z-[1] inline-flex items-center gap-2"
                      >
                        <span aria-hidden="true" className="spinner" />
                        SENDING…
                      </motion.span>
                    ) : (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                        className="relative z-[1] inline-flex items-center gap-2"
                      >
                        SEND MESSAGE
                        <span aria-hidden="true" className="inline-block">→</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </MagneticButton>
              <p id={ids.status} aria-live="polite" className="text-[13px] text-muted">
                {status === "sending"
                  ? "Encrypting good vibes…"
                  : Object.keys(errors).length > 0 && Object.keys(touched).length > 0
                    ? "Fix the highlighted field to continue."
                    : "No spam, no newsletter — just a reply."}
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
