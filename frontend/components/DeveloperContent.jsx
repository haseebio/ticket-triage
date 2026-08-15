import Image from 'next/image';

const CONNECT = [
  ['Email', 'haseebur341@gmail.com', 'mailto:haseebur341@gmail.com'],
  ['Phone', '+92 304 4170843', 'tel:+923044170843'],
  ['LinkedIn', 'linkedin.com/in/haseebio', 'https://linkedin.com/in/haseebio'],
  ['GitHub', 'github.com/haseebio', 'https://github.com/haseebio'],
  ['Portfolio', 'haseebio-portfolio.netlify.app', 'https://haseebio-portfolio.netlify.app'],
  ['Facebook', 'facebook.com/haseebio.dev', 'https://www.facebook.com/haseebio.dev'],
  ['Twitter / X', 'twitter.com/haseebio_dev', 'https://www.twitter.com/haseebio_dev'],
  ['Instagram', 'instagram.com/haseebio.dev', 'https://www.instagram.com/haseebio.dev'],
  ['Threads', 'threads.net/@haseebio.dev', 'https://www.threads.net/@haseebio.dev'],
];

const SKILLS = [
  ['Frontend', ['React.js', 'Next.js', 'Tailwind CSS', 'Framer Motion']],
  ['Backend', ['Node.js', 'Express.js', 'Python', 'REST APIs']],
  ['AI / LLM', ['Gemini API', 'LLM Integrations', 'Prompt Engineering']],
  ['Database', ['PostgreSQL', 'MongoDB']],
  ['DevOps', ['Docker', 'GitHub Actions', 'Vercel', 'Render']],
];

const PROJECTS = [
  ['StackRadar', 'AI-powered tech stack trend analyzer processing real data from 65,437 developers.', ['Python', 'FastAPI', 'Next.js'], 'https://stackradar-dev.vercel.app', 'Visit'],
  ['Portfolio', 'Personal developer portfolio showcasing projects, skills, and experience.', ['React.js', 'Tailwind CSS'], 'https://haseebio-portfolio.netlify.app', 'Visit'],
];

function ConnectLink({ label, value, href }) {
  const external = href.startsWith('http');
  return (
    <a key={label} href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}
      className="rounded-lg border border-line bg-surface px-4 py-2.5 transition-colors hover:border-primary">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-fog">{label}</p>
      <p className="text-xs font-semibold text-ink">{value}</p>
    </a>
  );
}

function ProjectCard({ name, desc, tech, href, label }) {
  const external = href.startsWith('http');
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-line bg-surface p-5">
      <div>
        <p className="mb-1.5 text-sm font-bold text-ink">{name}</p>
        <p className="mb-2.5 max-w-sm text-xs leading-relaxed text-fog">{desc}</p>
        <div className="flex flex-wrap gap-1.5">
          {tech.map((t) => (
            <span key={t} className="rounded-full bg-section px-2.5 py-0.5 text-[11px] text-fog">{t}</span>
          ))}
        </div>
      </div>
      <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}
        className="flex-shrink-0 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-xs font-medium text-white transition-all hover:bg-brand-gradient">
        {label} →
      </a>
    </div>
  );
}

export default function DeveloperContent() {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-20">
      <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-soft/50 px-3.5 py-1 text-xs font-semibold text-primary">
        Developer
      </span>

      <div className="mb-14 flex items-start gap-6">
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border-[3px] border-primary shadow-lg shadow-primary/20">
          <Image
            src="/developer-photo.jpg"
            alt="Muhammad Haseeb Ur Rehman"
            fill
            sizes="96px"
            className="object-cover"
          />
        </div>
        <div>
          <h1 className="mb-1.5 text-2xl font-bold text-ink">Muhammad Haseeb Ur Rehman</h1>
          <p className="mb-2.5 bg-brand-gradient bg-clip-text text-sm font-semibold text-transparent">
            Full-Stack Developer · MERN Stack · CS Student
          </p>
          <p className="mb-3 max-w-md text-sm leading-relaxed text-fog">
            Self-taught MERN stack developer and BS Computer Science student at the
            University of Punjab, Lahore (2025–2029). Building full-stack projects that
            pair genuine AI integration with solid backend fundamentals.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="text-fog">Lahore, Punjab, Pakistan</span>
            <span className="flex items-center gap-1.5 font-medium text-signal-green">
              <span className="h-1.5 w-1.5 rounded-full bg-signal-green" />
              Open to opportunities
            </span>
          </div>
        </div>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-ink">Connect</h2>
      <div className="mb-3 flex flex-wrap gap-3">
        {CONNECT.map(([label, value, href]) => (
          <ConnectLink key={label} label={label} value={value} href={href} />
        ))}
      </div>
      <p className="mb-14 text-xs text-fog">
        Also on Discord (<span className="font-medium text-ink">haseebio.dev</span>) and WeChat
        (<span className="font-medium text-ink">haseeb_codess</span>).
      </p>

      <h2 className="mb-4 text-lg font-semibold text-ink">Technical skills</h2>
      <div className="mb-14 grid gap-3 sm:grid-cols-2">
        {SKILLS.map(([category, items]) => (
          <div key={category} className="rounded-lg border border-line bg-section p-5">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-primary">{category}</p>
            <div className="flex flex-wrap gap-2">
              {items.map((skill) => (
                <span key={skill} className="rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-ink">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <h2 className="mb-4 text-lg font-semibold text-ink">Education</h2>
      <div className="mb-14 flex gap-4 rounded-lg border border-l-4 border-line border-l-primary bg-primary-soft/30 p-6">
        <div>
          <p className="text-sm font-bold text-ink">BS Computer Science</p>
          <p className="mb-1 text-xs font-semibold text-primary">University of Punjab, Lahore</p>
          <p className="text-xs text-fog">2025 – 2029 · Currently enrolled</p>
        </div>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-ink">Projects</h2>
      <div className="flex flex-col gap-3">
        {PROJECTS.map(([name, desc, tech, href, label]) => (
          <ProjectCard key={name} name={name} desc={desc} tech={tech} href={href} label={label} />
        ))}
      </div>
    </div>
  );
}