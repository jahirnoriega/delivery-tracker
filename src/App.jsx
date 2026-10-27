import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import CloudTracker from "@/components/CloudTracker";
import DemoTracker from "@/components/DemoTracker";
import Header from "@/components/Header";
import Landing from "@/components/Landing";
import { useLocale } from "@/i18n/context";
import { auth, signInWithGoogle, signOutUser, TRACKER_OWNER } from "@/lib/firebase";

const isOwner = (user) => Boolean(user && TRACKER_OWNER && user.email?.toLowerCase() === TRACKER_OWNER);

export default function App() {
  const { t } = useLocale();
  const [user, setUser] = useState(undefined); // undefined while Firebase restores the session
  const [demo, setDemo] = useState(false);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(
    () =>
      onAuthStateChanged(auth, (next) => {
        // Accounts other than the owner are signed out right away.
        if (next && !isOwner(next)) {
          setNotice(t.landing.noAccess);
          signOutUser();
          return;
        }
        setUser(next);
      }),
    [t.landing.noAccess],
  );

  async function handleSignIn() {
    setNotice("");
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      if (error?.code !== "auth/popup-closed-by-user") setNotice(t.error);
    } finally {
      setBusy(false);
    }
  }

  const sessionButton = (label, onClick) => (
    <button type="button" onClick={onClick} className="btn btn-ghost">
      {label}
    </button>
  );

  if (demo) {
    return (
      <>
        <Header action={sessionButton(t.header.exitDemo, () => setDemo(false))} />
        <main className="container-wide pt-10 pb-24">
          <DemoTracker />
        </main>
      </>
    );
  }

  if (user === undefined) {
    return <p className="container-wide pt-24 text-center text-muted">{t.loading}</p>;
  }

  if (user) {
    return (
      <>
        <Header action={sessionButton(t.header.signOut, signOutUser)} />
        <main className="container-wide pt-10 pb-24">
          <CloudTracker uid={user.uid} />
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <Landing onSignIn={handleSignIn} onDemo={() => setDemo(true)} notice={notice} busy={busy} />
    </>
  );
}
