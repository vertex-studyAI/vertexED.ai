export type ActivationEvent =
  | {
      name: "Landing CTA";
      properties: {
        location: "hero" | "footer";
        destination: "signup" | "features";
      };
    }
  | {
      name: "Waitlist joined";
      properties: {
        method: "email";
      };
    }
  | {
      name: "Account created";
      properties: {
        method: "team_invite" | "waitlist_approval";
      };
    };

/**
 * Record a small, privacy-safe activation event without delaying the user journey.
 *
 * Keep event payloads limited to the typed, non-sensitive properties above. Never
 * add email addresses, usernames, invite codes, prompts, generated content, or
 * other user-provided text.
 */
export function trackActivationEvent(event: ActivationEvent): void {
  if (typeof window === "undefined") return;

  void import("@vercel/analytics")
    .then(({ track }) => {
      track(event.name, event.properties);
    })
    .catch(() => {
      // Analytics must never block or break a successful product action.
    });
}
