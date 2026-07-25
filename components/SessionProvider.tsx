"use client";

import { useEffect } from "react";
import { SessionProvider as NextAuthSessionProvider, useSession } from "next-auth/react";
import { setUserContext } from "@/lib/sentry";

function SentryUserSync({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const u = session.user as any;
      setUserContext({
        id: u.id,
        name: u.name,
        phone: u.phone,
        nursery_name: u.nursery_name,
      });
    } else if (status === "unauthenticated") {
      setUserContext(null);
    }
  }, [session, status]);

  return <>{children}</>;
}

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <SentryUserSync>{children}</SentryUserSync>
    </NextAuthSessionProvider>
  );
}
