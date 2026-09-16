import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "ERP Sign in",
  description: "Secure TechM4India company workspace sign in.",
};

export default function LoginPage() {
  return (
    <div className="login-route">
      <main className="erp-login">
        <section className="erp-login-brand" aria-labelledby="login-title">
          <Link className="erp-brand" href="/" aria-label="Back to TechM4India home">
            <img src="/images/brand/logo.png" alt="" width="46" height="46" />
            <span>
              TECHM4<span>INDIA</span>
            </span>
          </Link>
          <div className="erp-login-brand-copy">
            <p className="erp-kicker">Company Management ERP</p>
            <h1 id="login-title">
              Make the work
              <br />
              <em>move forward.</em>
            </h1>
            <p>
              A focused operating workspace for the people building India&apos;s most ambitious
              innovation ecosystem.
            </p>
          </div>
          <div className="erp-login-mark" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </div>
          <p className="erp-login-footer">
            TechM4Engineering · TechM4Solutions · TechM4Schools · TechM4Space
          </p>
        </section>
        <section className="erp-login-panel" aria-labelledby="welcome-title">
          <div className="erp-login-panel-inner">
            <p className="erp-kicker">Internal workspace</p>
            <h2 id="welcome-title">Welcome back.</h2>
            <p className="erp-login-intro">
              Sign in with your TechM4India company account to continue.
            </p>
            <LoginForm />
          </div>
        </section>
      </main>
    </div>
  );
}
