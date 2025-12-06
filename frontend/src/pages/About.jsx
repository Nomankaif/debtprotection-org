import React from 'react';

const pillars = [
  {
    title: 'Personalized Guidance',
    description: 'We tailor every strategy to your financial goals, providing actionable steps that fit your lifestyle.',
    highlight: '10k+ plans delivered',
  },
  {
    title: 'Trusted Expertise',
    description: 'Our advisors bring decades of experience across credit counseling, legal advocacy, and financial planning.',
    highlight: 'Certified debt specialists',
  },
  {
    title: 'Ongoing Support',
    description: 'From the first consultation through each milestone, we stay with you to adjust and refine your roadmap.',
    highlight: '95% client satisfaction',
  },
];

const timeline = [
  {
    year: '2016',
    title: 'Debt Protection Co. Founded',
    text: 'Launched with a mission to make debt relief transparent, ethical, and accessible to every household.',
  },
  {
    year: '2019',
    title: 'Nationwide Network',
    text: 'Expanded our counselor network and digital tools, empowering clients to receive guidance wherever they live.',
  },
  {
    year: '2023',
    title: 'Client Success Milestone',
    text: 'Surpassed 10,000 customized debt protection plans and introduced proactive monitoring for every client.',
  },
];

const About = () => {
  return (
    <section className="px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <header className="text-center">
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">About Debt Protection Co.</h1>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">
            We empower individuals and families to move beyond debt with confidence. Every plan we build is rooted in
            research, compassionate guidance, and measurable results.
          </p>
        </header>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">{pillar.title}</h2>
              <p className="mt-4 text-sm text-slate-600 sm:text-base">{pillar.description}</p>
              <p className="mt-auto text-sm font-semibold text-blue-600">{pillar.highlight}</p>
            </div>
          ))}
        </div>
        <section className="mt-16 rounded-3xl border border-slate-200 bg-slate-50 p-8 sm:p-10">
          <h2 className="text-2xl font-semibold text-slate-900">Our Story</h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            Debt Protection Co. began with a simple promise: financial hardships should be met with clarity, not
            confusion. Over the years we have combined human expertise with intuitive technology, delivering actionable
            strategies that make debt relief sustainable.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {timeline.map((item) => (
              <div key={item.year} className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-blue-600">{item.year}</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-sm text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
};

export default About;