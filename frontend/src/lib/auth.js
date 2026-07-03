import { supabase } from "./supabaseClient";

const GENERIC_AUTH_ERROR = "Unable to sign in with those credentials.";
const AUTH_VERIFICATION_PENDING_KEY = "scrape-and-bake.authVerificationPending";
export const DEFAULT_APP_ROLE = "viewer";

async function invokeAccessVerification(accessToken) {
  return supabase.functions.invoke("verify-allowed-user", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

function setAuthVerificationPending(pending) {
  try {
    if (pending) {
      window.sessionStorage.setItem(AUTH_VERIFICATION_PENDING_KEY, "1");
      return;
    }
    window.sessionStorage.removeItem(AUTH_VERIFICATION_PENDING_KEY);
  } catch {
    // Session storage is only a UX coordination hint for auth transitions.
  }
}

export function isAuthVerificationPending() {
  try {
    return window.sessionStorage.getItem(AUTH_VERIFICATION_PENDING_KEY) === "1";
  } catch {
    return false;
  }
}

export async function signIn(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  setAuthVerificationPending(true);
  const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
  if (error) {
    setAuthVerificationPending(false);
    return { error: GENERIC_AUTH_ERROR };
  }

  const accessToken = data.session?.access_token;
  if (!accessToken) {
    console.warn("Password auth succeeded but no access token was available for app access verification.");
    await clearAuthState();
    return { error: GENERIC_AUTH_ERROR };
  }

  const { data: allowData, error: allowError } = await invokeAccessVerification(accessToken);
  if (allowError || !allowData?.allowed) {
    console.warn("App access verification failed after password auth.", {
      requestId: allowData?.requestId || "",
      status: allowError?.context?.status || "",
    });
    await clearAuthState();
    return { error: GENERIC_AUTH_ERROR };
  }

  setAuthVerificationPending(false);
  return {
    data,
    access: {
      allowed: true,
      role: allowData?.role || DEFAULT_APP_ROLE,
      enabled: allowData?.enabled !== false,
      userId: allowData?.userId || data.session?.user?.id || "",
      userEmail: allowData?.userEmail || data.session?.user?.email || "",
      requestId: allowData?.requestId || "",
    },
  };
}

export async function signOut() {
  setAuthVerificationPending(false);
  await supabase.auth.signOut();
  window.location.reload();
}

async function clearAuthState() {
  try {
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) return;
      console.warn("Unable to revoke Supabase session; clearing local auth state.", error);
    } catch (error) {
      console.warn("Unable to revoke Supabase session; clearing local auth state.", error);
    }

    await supabase.auth.signOut({ scope: "local" }).catch((localError) => {
      console.warn("Unable to clear local Supabase auth state.", localError);
    });
  } finally {
    setAuthVerificationPending(false);
  }
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function verifyAppAccess(session) {
  const accessToken = session?.access_token;
  if (!accessToken) {
    return {
      allowed: false,
      role: DEFAULT_APP_ROLE,
      enabled: false,
      userId: session?.user?.id || "",
      userEmail: session?.user?.email || "",
      requestId: "",
    };
  }

  const { data, error } = await invokeAccessVerification(accessToken);
  if (error) {
    throw new Error(error?.message || "Unable to verify application access.");
  }

  return {
    allowed: !!data?.allowed,
    role: data?.role || DEFAULT_APP_ROLE,
    enabled: data?.enabled !== false,
    userId: data?.userId || session?.user?.id || "",
    userEmail: data?.userEmail || session?.user?.email || "",
    requestId: data?.requestId || "",
    matchedBy: data?.matchedBy || "",
  };
}
