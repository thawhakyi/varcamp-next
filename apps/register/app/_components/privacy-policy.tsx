import { EmailLink, PolicyLink, PolicyPageLink } from "./policy-link"

export const privacyPolicyEffectiveDate = "21 October 2026"
const contactEmail = "contact@var.camp"

const collectedData = [
  {
    source: "Attendee registration",
    data: "Full name, email, country of residence, topics of interest",
    required: "Name, email and one topic are required",
  },
  {
    source: "Speaker registration",
    data: "Name, email, photo, job title, organization, bio, social links, talk title and description",
    required: "Yes, to review and publish your talk",
  },
  {
    source: "Community registration",
    data: "Organization name, logo, contact person name and email, description",
    required: "Yes, to list your community",
  },
  {
    source: "Newsletter sign-up",
    data: "Email address",
    required: "Optional",
  },
  {
    source: "Event platform",
    data: "Display name, avatar, chat messages, voice and video (if you turn them on)",
    required: "Display name only",
  },
  {
    source: "Website visits",
    data: "IP address, browser type, pages visited, server and application logs",
    required: "Collected automatically",
  },
] as const

const publicInformation = [
  "speaker names, photos, titles, organizations, bios, social links and talk details;",
  "community names and logos;",
  "session recordings, which may show participants' names, voices and video.",
] as const

const sharedWith = [
  "service providers that help us run VarCamp, such as our hosting and database provider, our email delivery service, and WorkAdventure (the event platform) and its video tools;",
  "social platforms, such as YouTube, Facebook and LinkedIn, when we publish recordings or profiles;",
  "authorities, if the law requires it.",
] as const

const retentionPeriods = [
  "Registration data: up to 2 years after the event, so we can invite you to future events. You can ask us to delete it sooner.",
  "Newsletter email: until you unsubscribe.",
  "Speaker and community profiles: as long as the event page stays online, unless you ask us to remove them.",
  "Recordings: kept online unless removed on request.",
  "Server and application logs: up to 90 days.",
] as const

const yourRights = [
  "see the personal data we hold about you;",
  "correct wrong data;",
  "delete your data;",
  "stop sending you emails;",
  "remove you from a recording or public profile, where possible.",
] as const

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="flex list-disc flex-col gap-1 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

function PrivacyPolicyText() {
  return (
    <div className="flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-foreground">
          VarCamp Privacy Policy
        </h2>
        <p className="text-xs">Effective date: {privacyPolicyEffectiveDate}</p>
      </div>
      <p>
        This policy explains what personal data VarCamp collects, why we collect
        it, and your choices. VarCamp is run by the VarCamp organizing team
        (&quot;we&quot;, &quot;us&quot;), who is responsible for your data.
        Contact: <EmailLink email={contactEmail} />.
      </p>

      <section className="flex flex-col gap-1.5">
        <h3 className="font-medium text-foreground">1. Data we collect</h3>
        <dl className="flex flex-col gap-2">
          {collectedData.map((row) => (
            <div key={row.source}>
              <dt className="font-medium text-foreground">{row.source}</dt>
              <dd>{row.data}</dd>
              <dd className="text-xs">Required: {row.required}</dd>
            </div>
          ))}
        </dl>
        <p>
          We do not collect payment details. We do not knowingly collect data
          from children under 16.
        </p>
      </section>

      <section className="flex flex-col gap-1.5">
        <h3 className="font-medium text-foreground">2. Why we use your data</h3>
        <ul className="flex list-disc flex-col gap-1 pl-5">
          <li>To manage your registration and give you access to the event.</li>
          <li>
            To send event information, such as schedules, links and changes.
          </li>
          <li>To send our newsletter, only if you opt in.</li>
          <li>To plan sessions based on the topics people choose.</li>
          <li>To publish speaker and community profiles.</li>
          <li>
            To record and share sessions (see{" "}
            <PolicyPageLink path="/terms">Terms of Use</PolicyPageLink>, section
            5).
          </li>
          <li>
            To keep the website and event safe and to enforce the{" "}
            <PolicyPageLink path="/code-of-conduct">
              Code of Conduct
            </PolicyPageLink>
            .
          </li>
          <li>To meet legal duties.</li>
        </ul>
        <p>
          We use your data based on your consent (for example, the newsletter),
          to provide the service you asked for (registration), and for our
          legitimate interest in running a safe event.
        </p>
      </section>

      <section className="flex flex-col gap-1.5">
        <h3 className="font-medium text-foreground">3. Public information</h3>
        <p>The following is public on our website or social channels:</p>
        <BulletList items={publicInformation} />
        <p>Attendee names and emails are not made public.</p>
      </section>

      <section className="flex flex-col gap-1.5">
        <h3 className="font-medium text-foreground">
          4. Who we share data with
        </h3>
        <p>We do not sell your data. We share it only with:</p>
        <BulletList items={sharedWith} />
        <p>
          These providers may store data in other countries. We choose providers
          that protect data with reasonable safeguards.
        </p>
      </section>

      <section className="flex flex-col gap-1.5">
        <h3 className="font-medium text-foreground">
          5. How long we keep data
        </h3>
        <BulletList items={retentionPeriods} />
      </section>

      <section className="flex flex-col gap-1.5">
        <h3 className="font-medium text-foreground">6. Your rights</h3>
        <p>You can ask us to:</p>
        <BulletList items={yourRights} />
        <p>
          To make a request, email <EmailLink email={contactEmail} />. We will
          reply within 30 days. You can unsubscribe from emails at any time with
          the link in each email.
        </p>
      </section>

      <section className="flex flex-col gap-1.5">
        <h3 className="font-medium text-foreground">7. Security</h3>
        <p>
          We use reasonable steps to protect your data, such as HTTPS,
          protection against fake form requests (CSRF), input checks, and admin
          access limited to organizers. No online service is fully secure, so we
          cannot guarantee total security.
        </p>
      </section>

      <section className="flex flex-col gap-1.5">
        <h3 className="font-medium text-foreground">8. Cookies</h3>
        <p>
          See our{" "}
          <PolicyPageLink path="/cookie-policy">Cookie Policy</PolicyPageLink>{" "}
          for details.
        </p>
      </section>

      <section className="flex flex-col gap-1.5">
        <h3 className="font-medium text-foreground">9. Links to other sites</h3>
        <p>
          Our website links to other sites, such as speaker profiles and sponsor
          pages. We are not responsible for their privacy practices.
        </p>
      </section>

      <section className="flex flex-col gap-1.5">
        <h3 className="font-medium text-foreground">
          10. Changes to this policy
        </h3>
        <p>
          We may update this policy. We will post the new version here with a
          new effective date.
        </p>
      </section>

      <section className="flex flex-col gap-1.5">
        <h3 className="font-medium text-foreground">11. Contact</h3>
        <p>
          For privacy questions or requests, email{" "}
          <EmailLink email={contactEmail} />.
        </p>
      </section>
    </div>
  )
}

export function PrivacyPolicyLink({
  label = "VarCamp Privacy Policy",
}: {
  label?: string
}) {
  return (
    <PolicyLink label={label}>
      <PrivacyPolicyText />
    </PolicyLink>
  )
}
