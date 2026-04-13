import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — TinyTales",
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-cream px-6 py-16">
      <div className="max-w-[600px] mx-auto">
        <Link
          href="/"
          className="font-serif text-xl tracking-tight mb-12 inline-block"
        >
          <span className="opacity-35">tiny</span>tales
        </Link>

        <h1 className="font-serif text-3xl tracking-tight mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-warm-600 mb-10">
          Last updated: April 2026
        </p>

        <div className="space-y-8 text-[15px] leading-relaxed text-warm-800">
          <section>
            <h2 className="font-semibold text-ink text-base mb-2">
              What TinyTales is
            </h2>
            <p>
              TinyTales is a free tool that generates personalized storybooks
              for children using artificial intelligence. We built it for
              parents and caregivers who want to create meaningful stories for
              their kids.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-ink text-base mb-2">
              What we collect
            </h2>
            <p className="mb-3">
              To generate a story, we collect three things:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Your child's first name</strong> — used in the story
                text. We do not collect last names.
              </li>
              <li>
                <strong>Your child's age</strong> — used to set the reading
                level and story length.
              </li>
              <li>
                <strong>Your story description</strong> — the theme or
                situation you describe for the story.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-ink text-base mb-2">
              What we do not collect
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>We do not collect photos of children.</li>
              <li>
                We do not collect email addresses, phone numbers, or physical
                addresses.
              </li>
              <li>We do not require accounts or passwords.</li>
              <li>We do not collect payment information.</li>
              <li>
                We do not use cookies for advertising or tracking across other
                websites.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-ink text-base mb-2">
              How stories are stored
            </h2>
            <p>
              Generated stories are stored in a database so they can be
              accessed via a shareable link. Each book is assigned a random
              identifier — there is no connection between a book and any
              account or personal identity. Stories are stored indefinitely
              unless we implement a retention policy, which we will announce on
              this page.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-ink text-base mb-2">
              AI and third-party services
            </h2>
            <p>
              Stories are generated using third-party AI services. The child's
              first name, age, and your story description are sent to the AI
              provider to generate the story. We do not send any other personal
              information. Our AI providers process this data according to
              their own privacy policies and do not use it to train their
              models.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-ink text-base mb-2">
              Children's privacy
            </h2>
            <p>
              TinyTales is designed for use by parents and caregivers, not by
              children directly. We do not knowingly collect personal
              information from children under 13. The information we receive
              (first name and age) is provided by the parent or caregiver, not
              the child. We do not collect persistent identifiers from
              children, do not enable children to make information publicly
              available, and do not condition participation on the disclosure
              of more information than is reasonably necessary.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-ink text-base mb-2">
              Sharing and selling data
            </h2>
            <p>
              We do not sell, rent, or share personal information with third
              parties for marketing purposes. The only data shared with third
              parties is what is sent to the AI provider to generate the story,
              as described above.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-ink text-base mb-2">
              Your rights
            </h2>
            <p>
              If you would like a generated book removed from our database,
              contact us with the book's share link and we will delete it. You
              can reach us at the email below.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-ink text-base mb-2">
              Changes to this policy
            </h2>
            <p>
              If we make material changes to this policy, we will update the
              date at the top of this page. We encourage you to review this
              page periodically.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-ink text-base mb-2">Contact</h2>
            <p>
              Questions or concerns about this policy? Reach us at{" "}
              <a
                href="mailto:privacy@tinytales.app"
                className="text-accent underline"
              >
                privacy@tinytales.app
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-warm-200">
          <Link href="/" className="text-sm text-warm-600 hover:text-accent">
            ← Back to TinyTales
          </Link>
        </div>
      </div>
    </main>
  );
}
