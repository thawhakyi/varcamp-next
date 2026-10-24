import { EmailLink, PolicyLink } from "./policy-link"

export const codeOfConductEffectiveDate = "21 October 2026"
const conductEmail = "contact@var.camp"
const contactEmail = "contact@var.camp"

const codeOfConductSections = [
  {
    title: "1. Expected behaviour",
    items: [
      "Be respectful and kind to others.",
      "Welcome people of all backgrounds, languages and skill levels.",
      "Listen to other views and disagree politely.",
      "Respect speakers' time and the session rules.",
      "Ask before recording or sharing another person's image or words.",
    ],
  },
  {
    title: "2. Not allowed",
    items: [
      "Harassment, bullying or threats.",
      "Offensive comments about gender, gender identity, age, sexual orientation, disability, appearance, race, ethnicity, religion, nationality or political views.",
      "Sexual language or images.",
      "Hate speech or content that promotes violence.",
      "Following, stalking or contacting people who asked you to stop.",
      "Spam, unwanted sales messages or scams.",
      "Disrupting sessions, for example by shouting, flooding the chat or blocking others in the virtual space.",
      "Sharing private information about others without permission.",
    ],
  },
] as const

const enforcementActions = [
  "giving a warning;",
  "muting or removing a person from a session;",
  "removing a person from the event without return;",
  "banning a person from future VarCamp events;",
  "reporting to the relevant platform or authorities, if needed.",
] as const

function CodeOfConductText() {
  return (
    <div className="flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-foreground">
          VarCamp Code of Conduct
        </h2>
        <p className="text-xs">Effective date: {codeOfConductEffectiveDate}</p>
      </div>
      <p>
        VarCamp is a safe and welcoming space for everyone. All attendees,
        speakers, community partners, sponsors and volunteers must follow this
        Code of Conduct in every part of the event, including talks, chats,
        virtual rooms and our social channels.
      </p>

      {codeOfConductSections.map((section) => (
        <section key={section.title} className="flex flex-col gap-1.5">
          <h3 className="font-medium text-foreground">{section.title}</h3>
          <ul className="flex list-disc flex-col gap-1 pl-5">
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}

      <section className="flex flex-col gap-1.5">
        <h3 className="font-medium text-foreground">
          3. Speakers and sponsors
        </h3>
        <p>
          Speakers and sponsors must also follow this Code. Talks, slides and
          booths must not include sexual, hateful or discriminatory content.
        </p>
      </section>

      <section className="flex flex-col gap-1.5">
        <h3 className="font-medium text-foreground">
          4. What happens if someone breaks the Code
        </h3>
        <p>Organizers may take any action they think is right, such as:</p>
        <ul className="flex list-disc flex-col gap-1 pl-5">
          {enforcementActions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-1.5">
        <h3 className="font-medium text-foreground">5. How to report</h3>
        <p>If you see or experience a problem, please tell us right away.</p>
        <ul className="flex list-disc flex-col gap-1 pl-5">
          <li>
            Email: <EmailLink email={conductEmail} />
          </li>
          <li>During the event: contact any organizer in the virtual space.</li>
        </ul>
        <p>
          We will treat all reports as private. We will not share the
          reporter&apos;s name without consent.
        </p>
      </section>

      <section className="flex flex-col gap-1.5">
        <h3 className="font-medium text-foreground">6. Questions</h3>
        <p>
          For questions about this Code, email{" "}
          <EmailLink email={contactEmail} />.
        </p>
      </section>
    </div>
  )
}

export function CodeOfConductLink({
  label = "VarCamp Code of Conduct",
}: {
  label?: string
}) {
  return (
    <PolicyLink label={label}>
      <CodeOfConductText />
    </PolicyLink>
  )
}
