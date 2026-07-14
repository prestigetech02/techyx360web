create table if not exists public.job_openings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  department text not null,
  location text not null,
  employment_type text not null,
  description text not null,
  overview text not null,
  responsibilities text[] not null default '{}',
  requirements text[] not null default '{}',
  nice_to_have text[] not null default '{}',
  benefits text[] not null default '{}',
  status text not null default 'open'
    check (status in ('open', 'closed', 'draft')),
  icon text not null default 'briefcase'
    check (icon in ('code', 'design', 'product', 'support', 'briefcase')),
  sort_order integer not null default 0,
  salary_min integer,
  salary_max integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint job_openings_salary_range_check
    check (
      salary_min is null
      or salary_max is null
      or salary_min <= salary_max
    )
);

create index if not exists job_openings_status_idx
  on public.job_openings (status);

create index if not exists job_openings_sort_order_idx
  on public.job_openings (sort_order asc, created_at desc);

create index if not exists job_openings_department_idx
  on public.job_openings (department);

alter table public.job_openings enable row level security;

drop policy if exists "Authenticated users can read job openings"
  on public.job_openings;

create policy "Authenticated users can read job openings"
  on public.job_openings
  for select
  to authenticated
  using (true);

drop policy if exists "Public can read open job openings"
  on public.job_openings;

create policy "Public can read open job openings"
  on public.job_openings
  for select
  to anon
  using (status = 'open');

alter table public.job_openings replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.job_openings;
exception
  when duplicate_object then null;
end $$;

insert into public.job_openings (
  slug,
  title,
  department,
  location,
  employment_type,
  description,
  overview,
  responsibilities,
  requirements,
  nice_to_have,
  benefits,
  status,
  icon,
  sort_order,
  salary_min,
  salary_max
)
values
  (
    'full-stack-developer',
    'Full Stack Developer',
    'Engineering',
    'Lagos, Nigeria',
    'Full-time',
    'Build and ship web platforms end-to-end — from APIs and databases to responsive user interfaces.',
    'We''re looking for a Full Stack Developer who can own features across the stack. You''ll work with designers, product, and fellow engineers to ship reliable software for businesses and learners across Nigeria and Africa.',
    array[
      'Design, build, and maintain web applications using modern frontend and backend stacks',
      'Write clean, well-tested code and participate in code reviews',
      'Collaborate with design and product to turn requirements into shipped features',
      'Improve performance, accessibility, and reliability across our products',
      'Help shape engineering practices, documentation, and technical decisions'
    ],
    array[
      'Solid experience with JavaScript/TypeScript and a modern frontend framework (React or Next.js preferred)',
      'Backend experience with APIs, databases, and authentication',
      'Comfort working across the stack and debugging production issues',
      'Clear communication and a collaborative approach to shipping',
      'Strong problem-solving skills and attention to detail'
    ],
    array[
      'Experience with Next.js App Router and Tailwind CSS',
      'Familiarity with cloud deployment and CI/CD',
      'Prior work on SaaS, training platforms, or marketplace products'
    ],
    array[
      'Competitive salary and performance incentives',
      'Remote & hybrid work flexibility',
      'Mentorship and continuous learning opportunities',
      'Direct impact on products used by businesses and learners'
    ],
    'open',
    'code',
    10,
    400000,
    800000
  ),
  (
    'ui-ux-designer',
    'UI/UX Designer',
    'Product',
    'Lagos, Nigeria',
    'Full-time',
    'Design clear, accessible product experiences across our software suite and training platforms.',
    'Join Techyx360 as a UI/UX Designer and shape experiences that help people learn, hire, and build with technology. You''ll own end-to-end design — research, flows, interfaces, and design systems — across our products.',
    array[
      'Design user flows, wireframes, and high-fidelity interfaces for web and product experiences',
      'Run lightweight research and usability checks to validate design decisions',
      'Maintain and evolve our design system for consistency across products',
      'Partner closely with engineers and product managers through the delivery cycle',
      'Advocate for accessibility, clarity, and polished interaction design'
    ],
    array[
      'Proven UI/UX design experience with a strong portfolio of shipped work',
      'Proficiency in Figma and modern design workflows',
      'Ability to translate complex requirements into simple, usable interfaces',
      'Experience collaborating with engineering teams',
      'Understanding of responsive design and accessibility fundamentals'
    ],
    array[
      'Experience designing learning, SaaS, or career products',
      'Basic familiarity with HTML/CSS or design-in-browser handoff',
      'Motion or micro-interaction design experience'
    ],
    array[
      'Competitive salary and performance incentives',
      'Remote & hybrid work flexibility',
      'Mentorship and continuous learning opportunities',
      'Ownership of meaningful product surfaces from day one'
    ],
    'open',
    'design',
    20,
    300000,
    600000
  ),
  (
    'product-manager',
    'Product Manager',
    'Product',
    'Lagos, Nigeria',
    'Full-time',
    'Own product direction, prioritize roadmaps, and work closely with engineering and design to ship value.',
    'We''re hiring a Product Manager to drive clarity and outcomes across Techyx360 products. You''ll define priorities, align teams, and make sure we ship solutions that create real impact for customers.',
    array[
      'Own product discovery, prioritization, and roadmap planning',
      'Write clear specs and success metrics for features and initiatives',
      'Work daily with engineering and design to deliver high-quality releases',
      'Gather customer feedback and turn insights into actionable product decisions',
      'Communicate progress, risks, and outcomes to stakeholders'
    ],
    array[
      'Experience as a Product Manager or similar product ownership role',
      'Strong written and verbal communication skills',
      'Ability to balance customer needs, business goals, and technical constraints',
      'Comfort working with data to guide decisions',
      'Experience shipping digital products in partnership with engineering teams'
    ],
    array[
      'Background in SaaS, edtech, or marketplace products',
      'Familiarity with agile delivery and product analytics tools',
      'Experience working with early-stage or growing product teams'
    ],
    array[
      'Competitive salary and performance incentives',
      'Remote & hybrid work flexibility',
      'Mentorship and continuous learning opportunities',
      'High ownership and visibility across the business'
    ],
    'open',
    'product',
    30,
    450000,
    900000
  ),
  (
    'technical-support-specialist',
    'Technical Support Specialist',
    'Support',
    'Remote',
    'Full-time',
    'Help customers succeed by resolving technical issues and guiding them through Techyx360 products.',
    'As a Technical Support Specialist, you''ll be the trusted guide for our customers. You''ll troubleshoot issues, explain product workflows clearly, and feed insights back to product and engineering so we keep improving.',
    array[
      'Respond to customer requests across email and support channels with clarity and care',
      'Diagnose and resolve technical issues across our software and training platforms',
      'Document common problems, solutions, and product feedback',
      'Escalate complex issues and collaborate with engineering when needed',
      'Help create help articles and onboarding resources that reduce repeat issues'
    ],
    array[
      'Strong customer communication skills and patience under pressure',
      'Ability to troubleshoot software issues methodically',
      'Comfort learning new tools and explaining technical concepts simply',
      'Reliable remote work habits and strong written English',
      'Experience in technical support, customer success, or a related role'
    ],
    array[
      'Familiarity with web apps, CRM tools, or helpdesk platforms',
      'Background supporting SaaS or education products',
      'Basic understanding of HTML, APIs, or browser developer tools'
    ],
    array[
      'Competitive salary and performance incentives',
      'Fully remote-friendly work setup',
      'Mentorship and continuous learning opportunities',
      'Clear path to grow into customer success or product support leadership'
    ],
    'open',
    'support',
    40,
    200000,
    400000
  )
on conflict (slug) do update set
  title = excluded.title,
  department = excluded.department,
  location = excluded.location,
  employment_type = excluded.employment_type,
  description = excluded.description,
  overview = excluded.overview,
  responsibilities = excluded.responsibilities,
  requirements = excluded.requirements,
  nice_to_have = excluded.nice_to_have,
  benefits = excluded.benefits,
  status = excluded.status,
  icon = excluded.icon,
  sort_order = excluded.sort_order,
  salary_min = excluded.salary_min,
  salary_max = excluded.salary_max,
  updated_at = now();
