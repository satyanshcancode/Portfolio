// Everything the site says lives in this file. Edit here, not in the components.
//
// Every claim in `projects` below was taken from the repository it links to.
// Code excerpts are verbatim; if you edit a file upstream, re-check the excerpt.

export const profile = {
  name: 'Satyansh Singh',
  role: 'Cloud computing student building infrastructure and security tools.',
  place: 'Lovely Professional University, Punjab',
  email: 'satyans94@gmail.com',
  github: 'https://github.com/satyanshcancode',
  linkedin: 'https://www.linkedin.com/in/satyansh-can-code',
  resume: './Satyansh_Singh_Resume.pdf',
  about: [
    'I’m a B.Tech Computer Science student at Lovely Professional University, specialising in cloud computing and graduating in 2028.',
    'Most of what I build sits where infrastructure meets security: auditing who can do what in an AWS account, keeping sessions alive on a bad network, and putting access rules on-chain where an administrator can’t quietly bend them.',
  ],
}

/** The quick-read strip under the hero. Icons are drawn in TechStrip.tsx. */
export const techStrip = [
  'AWS',
  'Google Cloud',
  'Docker',
  'Kubernetes',
  'Linux',
  'GitHub',
] as const

export type TechName = (typeof techStrip)[number]

export const focus = [
  {
    title: 'Cloud and infrastructure',
    body: 'Deploying and managing compute, storage, networking and identity on public cloud, and running the Linux underneath it.',
    tools: 'AWS, Google Cloud, Docker, Kubernetes, Linux',
  },
  {
    title: 'Security and access',
    body: 'Finding out who really has which permissions, and designing systems where the rules are enforced rather than trusted.',
    tools: 'AWS IAM, policy simulation, RBAC, Solidity, OpenZeppelin',
  },
  {
    title: 'Full-stack development',
    body: 'Typed front ends and APIs on top of a database that is allowed to say no: constraints, transactions and locks.',
    tools: 'React, TypeScript, Node.js, Express, PostgreSQL, Python',
  },
]

/** A verbatim snippet of a real file, with a link to it on GitHub. */
export type CodeExcerpt = {
  /** Repo-relative path, shown as the caption. */
  file: string
  url: string
  code: string
}

/**
 * Only the parts that actually exist in the repo are filled in.
 * `pipeline` is present for one project, because only one repo has CI.
 */
export type Evidence = {
  pipeline?: { stages: string[]; note: string }
  containers?: string
  excerpt?: CodeExcerpt
}

export type ProjectId = 'iam' | 'session' | 'allocademy' | 'chain'

export type Project = {
  /** Keys the architecture diagram in ArchDiagram.tsx. */
  id: ProjectId
  title: string
  when: string
  context?: string
  problem: string
  architecture: string
  features: string[]
  tech: string[]
  repo: string
  /** Only set where a deployment really exists and answers. */
  demo?: string
  evidence?: Evidence
}

export const projects: Project[] = [
  {
    id: 'iam',
    title: 'IAM Access Auditor',
    when: 'Jun – Jul 2026',
    problem:
      'An AWS account accumulates users, groups, roles and policies until nobody can say what a given identity is actually allowed to do. Permissions arrive through group membership, managed policies and inline policies at once, so reading any one of them tells you very little.',
    architecture:
      'Two layers over a shared boto3 client. An operations layer (aws/) talks to AWS IAM; a product layer (iam_audit/) wraps it in Pydantic models and exposes the same engine twice — once as a Typer CLI, once as a FastAPI service. Both paths run the same analysis and hand the result to a pluggable exporter, so a report is identical whether it came from a terminal or an HTTP call.',
    features: [
      'Audits users, groups, roles and policies, and reports findings with a severity and a remediation note.',
      'Resolves effective permissions per user across group, managed and inline policies, marking NotAction and condition-constrained statements separately.',
      'Simulates a user-and-action pair through the AWS SimulatePrincipalPolicy API, and compares two principals to show where their permissions differ.',
      'Exports to JSON, CSV or SARIF 2.1.0, so findings load straight into a security scanner.',
    ],
    tech: ['Python 3.10+', 'Boto3', 'AWS IAM', 'FastAPI', 'Typer', 'Pydantic', 'Docker'],
    repo: 'https://github.com/satyanshcancode/IAM-Auditor',
    evidence: {
      pipeline: {
        stages: [
          'ruff lint and format check',
          'mypy type check',
          'pytest with coverage (Python 3.10, 3.11, 3.12)',
          'upload coverage to Codecov',
          'build the Docker image and smoke-test the CLI',
        ],
        note:
          'GitHub Actions runs on every push to main or develop and on pull requests into main. The Docker job only starts once the test matrix has passed.',
      },
      containers:
        'A multi-stage Dockerfile builds into python:3.12-slim and defaults to the API; docker-compose.yml runs the API with a health check, and keeps the CLI behind a profile so it runs as a one-off job rather than a service.',
      excerpt: {
        file: '.github/workflows/ci.yml',
        url: 'https://github.com/satyanshcancode/IAM-Auditor/blob/main/.github/workflows/ci.yml',
        code: `      - name: Lint with ruff
        run: |
          ruff check aws/ iam_audit/ tests/
          ruff format --check aws/ iam_audit/ tests/

      - name: Type check with mypy
        run: mypy iam_audit/ aws/

      - name: Test with pytest
        run: pytest --cov=iam_audit --cov=aws --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage.xml

  docker-build:
    runs-on: ubuntu-latest
    needs: lint-and-test`,
      },
    },
  },
  {
    id: 'session',
    title: 'Adaptive Cloud Session Monitor',
    when: 'Apr – May 2026',
    problem:
      'Cloud applications assume the network stays usable. On a weak connection the same chatty request pattern keeps firing, each call retries, and the task fails slowly instead of adapting. The client has the evidence to see it coming and does nothing with it.',
    architecture:
      'Middleware in front of a FastAPI backend. Every request is measured, and a sliding window turns those measurements into fourteen features — latency percentiles, failure rate, timeout rate, jitter, request velocity, payload trend and others. A prediction engine scores session stability with a gradient-boosted model, falling back to rules when the model is unavailable, and a finite state machine moves the session between Normal, Degraded and Critical. Each mode is a separate strategy object: granular request-response, batched requests, or an async queue.',
    features: [
      'Per-request telemetry — latency, retries, timeouts, payload size and HTTP status — aggregated over a sliding window.',
      'Three execution modes selected by a stability score, switching a session from granular calls to batching to an async queue.',
      'Gradient-boosted stability prediction with a rule-based fallback, so the service never hard-depends on the model at runtime.',
      'A React dashboard that simulates network conditions and shows the mode transitions as they happen.',
      'On the project’s own demo runs, failure rate over a simulated 2G link drops from 45% in Normal mode to 5% in Critical mode.',
    ],
    tech: ['Python 3.10', 'FastAPI', 'scikit-learn', 'XGBoost', 'pandas', 'React', 'Docker'],
    repo: 'https://github.com/satyanshcancode/Smart-Network-Monitoring-System-for-Cloud-Environments',
    evidence: {
      containers:
        'Both halves are containerised: the backend on python:3.10-slim with the build toolchain needed for numpy, pandas and scikit-learn, and the frontend on node:20. There is no compose file — the two images are built and run separately, or started together by the repo’s start.sh.',
      excerpt: {
        file: 'CloudNetworkAnalyzer/app/backend/Dockerfile',
        url: 'https://github.com/satyanshcancode/Smart-Network-Monitoring-System-for-Cloud-Environments/blob/main/CloudNetworkAnalyzer/app/backend/Dockerfile',
        code: `# Use stable Python (NOT latest, we are not gamblers)
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies (needed for numpy, pandas, sklearn)
RUN apt-get update && apt-get install -y \\
    build-essential \\
    gcc \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for better caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip \\
    && pip install --no-cache-dir -r requirements.txt

# Copy rest of the project
COPY . .

# Expose port
EXPOSE 8000

# Run the app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`,
      },
    },
  },
  {
    id: 'allocademy',
    title: 'Allocademy',
    when: 'Course registration and elective allocation',
    problem:
      'When registration opens, hundreds of students race for the same seats and the fastest connection wins. That is not a fair way to decide who gets a course, and it gives the university no answer when a student asks why they missed out.',
    architecture:
      'A React 19 SPA over an Express 5 API, layered middleware → routes → controllers → services → repositories, on PostgreSQL 16. The database is the source of truth: capacity, status, uniqueness and the frozen policy are enforced by constraints and triggers, with row locks and advisory locks around the transactions. The allocation engine is a pure module — no database, no clock, no randomness — so a stored input snapshot re-run through the same version must reproduce the same result.',
    features: [
      'Carts are collected first and submitted atomically with an idempotency key; seats are decided afterwards for everyone at once.',
      'Preference-and-priority allocation by student-proposing deferred acceptance, with the policy frozen the moment registration opens.',
      'Every student sees their score, the breakdown behind it, and the cut-off that decided each ranked course.',
      'Waitlists promote automatically inside a transaction, and add/drop swaps in one atomic step.',
      'On the demo dataset, first-come-first-served leaves 78 cases of justified envy; preference-and-priority leaves none.',
      '1,098 tests across 104 files, including property-based tests and integration tests against a real PostgreSQL.',
    ],
    tech: ['React 19', 'TypeScript', 'Express 5', 'PostgreSQL 16', 'Zod', 'Docker', 'nginx'],
    repo: 'https://github.com/satyanshcancode/Course-Registration-and-Elective-Allocation-Platform',
    demo: 'https://allocademy.vercel.app',
    evidence: {
      containers:
        'Multi-stage Dockerfiles with separate dev and prod targets: the backend runs as a non-root user and migrates before it serves, the frontend ships as static files on unprivileged nginx, and both carry health checks. docker-compose.yml brings up a dev stack with PostgreSQL and Mailpit; docker-compose.prod.yml runs the compiled production stack and refuses to start without a real mail server.',
      excerpt: {
        file: 'docker-compose.prod.yml',
        url: 'https://github.com/satyanshcancode/Course-Registration-and-Elective-Allocation-Platform/blob/main/docker-compose.prod.yml',
        code: `  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
      target: prod
    init: true
    environment:
      NODE_ENV: production
      PORT: 4000
      DATABASE_URL: postgres://\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@postgres:5432/\${POSTGRES_DB}
      CORS_ORIGIN: \${APP_BASE_URL:-http://localhost:8080}
      JSON_BODY_LIMIT: \${JSON_BODY_LIMIT:-100kb}
      CSV_BODY_LIMIT: \${CSV_BODY_LIMIT:-2mb}
      LOG_LEVEL: \${LOG_LEVEL:-info}
      JWT_SECRET: \${JWT_SECRET:?set JWT_SECRET in .env}
      # Invitation and reset links are built from this, so it must be the address
      # students open in a browser.
      APP_BASE_URL: \${APP_BASE_URL:-http://localhost:8080}
      # Required with NODE_ENV=production: without a mail server nobody can
      # activate an account or reset a password.
      SMTP_HOST: \${SMTP_HOST:?set SMTP_HOST in .env (production needs a mail server)}`,
      },
    },
  },
  {
    id: 'chain',
    title: 'Blockchain identity and asset platform',
    when: 'Aug – Sep 2026',
    context: 'Smart India Hackathon 2026, problem statement by Bharat Electronics Limited',
    problem:
      'Identity and access control usually sit in one administrator’s database, which makes that administrator a single point of failure and a single point of attack. The platform is built on the opposite assumption: that the administrator may be the threat, so the rules have to be enforced somewhere they cannot quietly be edited.',
    architecture:
      'Four Solidity contracts on an EVM chain — a shared RoleRegistry for access control, an IdentityRegistry anchoring DIDs behind EIP-712 holder consent, an ERC-721 AssetNFT bound to active identities, and an ApprovalRegistry tracking multi-signature proposals. A Node.js indexer replays events from its last checkpoint into a SQLite store, so an RPC disconnect or chain reset backfills instead of silently losing history, and a rule-based detector flags anomalies over that log. A React front end handles wallets; the public verification page is checked to contain no wallet imports at all, so a phone can scan a QR code and verify without MetaMask.',
    features: [
      'Registration requires the holder’s own EIP-712 signature, with per-account nonces against replay — an admin cannot enrol somebody without consent.',
      'Five on-chain roles (Admin, Manager, Auditor, User, Co-Signer); the Auditor is read-only by construction.',
      'Revocation and reclaim need 2-of-N multi-signature approval, with co-signers deliberately independent of the Admin role.',
      'Assets mint only to registered, active identities, and carry timestamped provenance for every transfer and reclaim.',
      'A self-healing indexer that detects chain resets and backfills missed blocks from its stored checkpoint.',
      '32 Hardhat test cases covering the four contracts.',
    ],
    tech: ['Solidity 0.8.24', 'Hardhat', 'OpenZeppelin 5', 'ethers.js v6', 'Node.js', 'React', 'Docker'],
    repo: 'https://github.com/satyanshcancode/blockchain-identity-platform',
    evidence: {
      containers:
        'docker-compose.yml brings the whole platform up in three services — a Hardhat test chain, the Node.js API and the React front end. The deploy script writes the freshly deployed contract addresses to a shared volume and the backend waits for that file on startup, which removes the usual "copy the addresses out of the logs by hand" step.',
      excerpt: {
        file: 'docker-compose.yml',
        url: 'https://github.com/satyanshcancode/blockchain-identity-platform/blob/main/docker-compose.yml',
        code: `services:
  hardhat-node:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: hardhat-node
    ports:
      - "8545:8545"
    volumes:
      - shared-addresses:/shared

  backend:
    build:
      context: ./backend
    container_name: platform-backend
    ports:
      - "4000:4000"
    environment:
      - PORT=4000
      - RPC_URL=http://hardhat-node:8545`,
      },
    },
  },
]

export type PathEntry = { when: string; title: string; where: string; body: string }

/** Formal schooling. */
export const education: PathEntry[] = [
  {
    when: 'Jul 2024 – now',
    title: 'B.Tech, Computer Science and Engineering (Cloud Computing)',
    where: 'Lovely Professional University, Phagwara',
    body: '',
  },
  {
    when: '2022 – 2024',
    title: 'Intermediate',
    where: 'Mount Litera Zee School, Gorakhpur',
    body: '',
  },
]

/** Hands-on courses, separate from the degree. */
export const training: PathEntry[] = [
  {
    when: 'Jun – Jul 2026',
    title: 'Cloud Craft skill development course',
    where: 'CPE, Lovely Professional University',
    body: 'Hands-on labs deploying and managing compute, storage, networking and identity services on public cloud.',
  },
  {
    when: 'Jun – Jul 2025',
    title: 'RHCSA: Linux system administration',
    where: 'CPE, Lovely Professional University',
    body: 'Red Hat Enterprise Linux administration: users and permissions, systemd, packages, LVM storage, networking, firewalld and SELinux.',
  },
]

export const stack = [
  { group: 'Languages', items: ['Python', 'Java', 'C++', 'TypeScript'] },
  { group: 'Cloud', items: ['AWS', 'Google Cloud Platform'] },
  { group: 'Infrastructure', items: ['Docker', 'Kubernetes', 'Linux', 'Git'] },
  { group: 'Databases', items: ['PostgreSQL', 'MySQL', 'MongoDB'] },
]

export const certificates = [
  { title: 'Database Management System, Part 1', by: 'Infosys Springboard', when: 'Aug 2026' },
  { title: 'Cloud Craft skill development course', by: 'CPE, LPU', when: 'Jul 2026' },
  { title: 'Red Hat System Administration I (RH124)', by: 'Red Hat', when: 'Jul 2025' },
  { title: 'RHCSA summer training', by: 'CPE, LPU', when: 'Jul 2025' },
  { title: 'Communication and public speaking', by: 'Lovely Professional University', when: 'Oct 2024' },
]

/** Used by both the contact section and the footer, so they can’t drift apart. */
export const contactLinks = [
  { label: 'Email', href: `mailto:${profile.email}` },
  { label: 'LinkedIn', href: profile.linkedin },
  { label: 'GitHub', href: profile.github },
  { label: 'Résumé', href: profile.resume },
]

export const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#work' },
  { label: 'Background', href: '#education' },
  { label: 'Contact', href: '#contact' },
]
