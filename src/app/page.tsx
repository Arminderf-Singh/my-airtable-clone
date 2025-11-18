import Link from "next/link";
import { getSession } from "~/lib/auth";
import '../styles/landingpage.css';

export default async function Home() {
  const session = await getSession();

  return (
    <div className="landing-page">
      <div className="landing-page-header">
          <div className="logo-name">
            <div className="text-logo">A</div>
            Airtable Clone
          </div>
          <div className="header-buttons">
            <button className="button">Platform</button>
            <button className="button">Solutions</button>
            <button className="button">Resources</button>
            <button className="button">Enterprise</button>
            <button className="button">Pricing</button>
          </div>
          <div className="lefthandside-buttons">
            <button className="bookademo-button">Book a Demo</button>
            {session ? (
              // Show when user is logged in
              <>
                <Link className="signup-button" href="/bases">
                  Go to App
                </Link>
                <Link className="login-button" href="/api/auth/signout">
                  Log out
                </Link>
              </>
            ) : (
              // Show when user is not logged in
              <>
                <button className="signup-button">Sign Up For Free</button>
                <Link className="login-button" href="/auth/signin">
                  Log in
                </Link>
              </>
            )}
          </div>
      </div>
      <div className="body-content">
        <div className="body-title">
          <div>From idea to app in an instant</div>
          <div>Build with AI that means business</div>
        </div>
        <div className="chatbox">
          <input 
            type="text"
            placeholder="Type something here."
          />
          <button className="builditnow-button">
            Build it Now
          </button>
        </div>
      </div>
    </div>
  );
}