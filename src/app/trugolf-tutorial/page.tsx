import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "TruGolf Account Tutorial",
  description:
    "A step-by-step guide to creating and using your TruGolf (E6 Connect) player account.",
};

type Step = string;

type Section = {
  id: string;
  number: string;
  title: string;
  summary: string;
  steps?: Step[];
  note?: string;
};

const sections: Section[] = [
  {
    id: "create-login",
    number: "01",
    title: "Create your login",
    summary: "Set up your TruGolf player account before your first visit.",
    steps: [
      "Go to portal.e6golf.com (or e6golf.com/register) on your phone or computer.",
      "Click Sign Up and enter your name, email, and a password.",
      "Check your email and click the verification link to activate the account.",
      "Log back in and fill out your Player Profile — handedness, gender, and tee box — so it's ready before you step into a bay.",
    ],
    note: "You can also create a profile for the first time at a simulator by choosing CREATE from the E6 CONNECT main menu, but setting it up online first is faster on game day.",
  },
  {
    id: "login-at-simulator",
    number: "02",
    title: "Log in when you arrive at a simulator",
    summary: "Load your profile so the session saves to your account.",
    steps: [
      "At the bay, wake the screen and go to the E6 CONNECT main menu.",
      "Select LOGIN — not CREATE or GUEST.",
      "Enter the email and password you signed up with.",
      "Confirm your name or avatar appears on screen. Every shot and round from here on saves to your account automatically.",
    ],
    note: "Choosing GUEST skips your profile entirely — nothing you play will be saved or added to your stats. Always use LOGIN.",
  },
  {
    id: "handicap",
    number: "03",
    title: "Get your handicap",
    summary: "View or set your handicap and let it update as you play.",
    steps: [
      "Log into portal.e6golf.com, or open Edit Profile directly on the simulator.",
      "Open the Profile tab.",
      "Find the Handicap field — enter your current handicap manually, or leave it blank and let it build from your posted scores.",
      "Play and post rounds under your logged-in profile; your handicap keeps updating as more rounds come in.",
    ],
  },
  {
    id: "find-clubhouse",
    number: "04",
    title: "Find a clubhouse",
    summary: "Join the community tied to the location you play at.",
    steps: [
      "Log into portal.e6golf.com.",
      "Look under Clubhouses, or ask your facility for their Clubhouse name or join code — most simulator locations run their own.",
      "Join the Clubhouse for the location you play at.",
      "Once joined, compare your rounds and stats with other members and check the location's leaderboards.",
    ],
  },
  {
    id: "tournaments",
    number: "05",
    title: "Register and play in a tournament",
    summary: "Enter an event online, then play it from the simulator menu.",
    steps: [
      "In the portal, go to Events / Leagues (sometimes labeled Tournaments).",
      "Browse open events — regional and global tournaments run through TruGolf Links, plus anything hosted by your home facility's Clubhouse.",
      "Click Register and confirm your entry.",
      "At the simulator, LOGIN to your profile, then choose EVENTS from the menu instead of a casual round.",
      "Play your round — your score posts automatically to the event leaderboard when you finish.",
    ],
  },
  {
    id: "settings",
    number: "06",
    title: "Adjust your settings",
    summary: "Preferences you set here follow you to any TruGolf simulator.",
    steps: [
      "Log into portal.e6golf.com and open your Profile.",
      "Profile tab: update gender, handedness, and your default tee box.",
      "Preferences tab: set your tracer style, camera view, ball size, terrain grid, putting arrow, and units.",
      "Save. These preferences apply automatically the next time you log in — at any location, not just one.",
    ],
  },
  {
    id: "look-up-account",
    number: "07",
    title: "Look up your account",
    summary: "Everything about your account lives at portal.e6golf.com.",
    steps: [
      "Go to portal.e6golf.com from any browser.",
      "Sign in with your email and password.",
      "Your account page shows your profile info, Clubhouse membership, and account status.",
      "Forgot your password? Use the reset-password link on the login page — TruGolf emails you a reset link.",
    ],
  },
  {
    id: "stats",
    number: "08",
    title: "Where all your stats go",
    summary: "Every logged-in shot syncs to your portal automatically.",
    steps: [
      "Every round — and every practice shot, even on the practice ranges — recorded while you're logged in syncs to your TruGolf Portal account automatically.",
      "Digital Scorecards save a full record of each round you play.",
      "Round Statistics break down fairways, greens in regulation, putts, and more.",
      "Advanced Analytics gives you shot tracers, spreadsheets, and charts to dig into the details.",
    ],
    note: "There's nothing to export or upload — it happens the moment you finish a round while logged in.",
  },
  {
    id: "growing",
    number: "09",
    title: "How to know if you're growing",
    summary: "Track trends over time, not just single rounds.",
    steps: [
      "Log into portal.e6golf.com and open your Round History.",
      "Compare stats across rounds — the portal tracks trends over time, not just one-off snapshots.",
      "Watch your handicap trend — a dropping handicap is the clearest sign of improvement.",
      "Check your XP, completed drills, and badge progress from the practice ranges — these track practice consistency alongside on-course results.",
      "Use Clubhouse leaderboards to see how your rounds stack up against other members at your location.",
    ],
  },
];

export default function TruGolfTutorialPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-black/10 bg-[#0b0f0d]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Logo"
              width={786}
              height={1294}
              priority
              className="h-9 w-auto"
            />
            <span className="text-sm font-medium tracking-wide text-white/60">
              Simulator Guide
            </span>
          </div>
          <a
            href="#create-login"
            className="hidden rounded-md bg-[#30A961] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#289254] sm:inline-block"
          >
            Get started
          </a>
        </div>
      </header>

      <section className="bg-[#0b0f0d] pb-20 pt-6 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#30A961]">
            TruGolf Account Tutorial
          </p>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
            Everything you need to run your TruGolf account, in nine steps.
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/70">
            A quick, no-nonsense walkthrough for creating your login, checking in at
            the simulator, and getting the most out of your stats and handicap.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl gap-10 px-6 py-12 lg:flex">
        <nav className="mb-10 shrink-0 lg:sticky lg:top-6 lg:mb-0 lg:h-fit lg:w-64">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            On this page
          </p>
          <ol className="space-y-1 border-l border-gray-200">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="-ml-px flex items-center gap-2 border-l-2 border-transparent py-1.5 pl-4 text-sm text-gray-600 transition hover:border-[#30A961] hover:text-gray-900"
                >
                  <span className="font-mono text-xs text-gray-400">
                    {section.number}
                  </span>
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <main className="min-w-0 flex-1 space-y-14">
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-8 border-t border-gray-100 pt-10 first:border-t-0 first:pt-0"
            >
              <div className="mb-4 flex items-baseline gap-3">
                <span className="font-mono text-sm text-[#30A961]">
                  {section.number}
                </span>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {section.title}
                </h2>
              </div>
              <p className="mb-5 max-w-2xl text-sm text-gray-500">{section.summary}</p>

              {section.steps && (
                <ol className="space-y-3">
                  {section.steps.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
                        {i + 1}
                      </span>
                      <span className="text-sm leading-relaxed text-gray-700">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              )}

              {section.note && (
                <p className="mt-5 max-w-2xl rounded-md border border-[#30A961]/20 bg-[#30A961]/5 px-4 py-3 text-sm text-gray-700">
                  <span className="font-semibold text-[#289254]">Tip: </span>
                  {section.note}
                </p>
              )}
            </section>
          ))}
        </main>
      </div>

      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-gray-500">
          <p>
            Steps are based on TruGolf&apos;s E6 Connect FAQ and support resources.
            Some details (like a facility&apos;s Clubhouse name or bay setup) are
            location-specific — check with your facility if anything doesn&apos;t
            match what you see on screen.
          </p>
        </div>
      </footer>
    </div>
  );
}
