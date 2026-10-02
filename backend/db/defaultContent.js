// Default website content.
// This is exactly what was hard-coded in the HTML pages before the admin panel
// took over. It is used until the admin saves a change to a section, and again
// if the admin clicks "Reset to default" on a section.

export const SECTIONS = ['site', 'home', 'about', 'events', 'team', 'contact'];

const defaults = {
  site: {
    clubName: 'TechnoSpark',
    footerTagline: 'Department Tech Club ·',
    copyright: '© 2026 TechnoSpark. All rights reserved.',
    emailPlaceholder: 'registerno@mannarcollege.ac.in',
    footerSocials: [
      { type: 'instagram', url: '' },
      { type: 'linkedin', url: '' },
      { type: 'github', url: '' },
      { type: 'twitter', url: '' },
    ],
  },

  home: {
    heroEyebrow: 'College Department Club',
    heroTitleLine1: 'Ignite Your',
    heroTitleAccent: 'Innovation',
    heroSubtitleLine1: 'TechnoSpark is where curious minds collide with cutting-edge technology.',
    heroSubtitleLine2: 'Build, break, learn, and lead.',
    heroButton1: { label: 'Upcoming Events', link: 'events.html' },
    heroButton2: { label: 'Who We Are', link: 'about.html' },
    stats: [
      { num: '200+', label: 'Members' },
      { num: '40+', label: 'Events/Year' },
      { num: '15+', label: 'Projects' },
    ],
    tickerLabel: 'UPCOMING EVENTS',
    ticker: [
      {
        emoji: '🎉',
        title: 'Freshers Day 2026',
        text: '— Welcome to TechnoSpark!  |  JULY 14 TUESDAY & Library building',
      },
    ],
    domainsEyebrow: 'Our Domains',
    domainsTitle: 'What We Spark',
    domains: [
      { icon: '🤖', title: 'AI & Machine Learning', text: 'Workshops, projects, and competitions in deep learning, NLP, and computer vision.' },
      { icon: '🔒', title: 'Cybersecurity', text: 'CTF challenges, ethical hacking boot camps, and security research sessions.' },
      { icon: '🌐', title: 'Web & App Dev', text: 'Full-stack hackathons, design sprints, and real-world client projects.' },
      { icon: '⚙️', title: 'Robotics & IoT', text: 'Hardware builds, embedded systems, and smart-device prototyping.' },
      { icon: '☁️', title: 'Cloud & DevOps', text: 'Hands-on labs with AWS, GCP, Docker, Kubernetes, and CI/CD pipelines.' },
      { icon: '🎮', title: 'Game Dev', text: 'Game jams, Unity/Unreal Engine workshops, and 3D asset creation.' },
    ],
    teaserShow: true,
    teaserBadge: 'Next Up',
    teaserTitle: 'Freshers DAY 2026',
    teaserDate: '',
    teaserText: 'Fully joyful and enjoyment.Make memories',
    teaserButton: { label: 'Register Now →', link: 'events.html' },
  },

  about: {
    heroEyebrow: 'Our Story',
    heroTitle: 'About',
    heroAccent: 'TechnoSpark',
    heroText: 'A student-led powerhouse driving innovation, learning, and community in tech.',
    whoEyebrow: 'Who We Are',
    whoTitle: 'Built by Students,',
    whoAccent: 'For Students',
    whoParagraphs: [
      'TechnoSpark is a platform that ignites innovation, empowers creativity, and shapes the future through technology.',
      "TechnoSpark is more than a name—it's a movement of innovators, creators, and problem-solvers. We spark ideas, build solutions, and drive technological excellence.",
    ],
    whoButton: { label: 'Join the Club →', link: 'contact.html' },
    bigNumber: '',
    bigNumberLabel: '',
    stats: [
      { num: '150+', label: 'Active Members' },
      { num: '20+', label: 'Events/Year' },
      { num: '15+', label: 'Live Projects' },
      { num: '8', label: 'Domains' },
    ],
    valuesEyebrow: 'What Drives Us',
    valuesTitle: 'Our Core Values',
    values: [
      { title: '🔥 Curiosity First', text: 'We ask "why" and "what if" before "how". No question is too basic, no idea too wild.' },
      { title: '🤝 Radical Collaboration', text: "Lone wolves don't build rockets. We work in teams, share code, and lift each other up." },
      { title: '🚀 Ship It', text: 'Done beats perfect. We build MVPs, learn from real users, and iterate constantly.' },
      { title: '🌍 Build for Impact', text: 'Technology is a tool. We use it to solve real problems for real communities.' },
    ],
    timelineEyebrow: '',
    timelineTitle: '',
    timeline: [],
  },

  events: {
    heroEyebrow: "What's Happening",
    heroTitle: 'Events',
    heroText: "there's always something happening at TechnoSpark.",
    upcomingEyebrow: "Don't Miss Out",
    upcomingTitle: 'Upcoming Events',
    pastEyebrow: 'Look Back',
    pastTitle: 'Past Events',
    emptyText: 'No events are scheduled right now — check back soon!',
    items: [
      {
        id: 'freshers-day-2026',
        title: 'FRESHERS DAY 2026',
        day: '14',
        month: 'july',
        meta: '',
        description: '',
        image: '',
        gradient: 'default',
        status: 'open',
        statusLabel: 'Registration Open',
        registrationOpen: true,
        buttonLabel: '',
        buttonLink: '',
      },
    ],
  },

  team: {
    heroEyebrow: 'The People',
    heroTitle: 'Meet the',
    heroAccent: 'Team',
    heroText: 'Student leaders — the minds behind TechnoSpark.',
    coreEyebrow: 'Leadership',
    coreTitle: 'Core Committee',
    core: [],
    membersEyebrow: 'Innovators',
    membersTitle: 'Members of TechnoSpark',
    members: [],
    emptyText: 'Team details are coming soon.',
    ctaShow: true,
    ctaTitle: 'Want to be on the team?',
    ctaText: 'We recruit every semester. No experience required — just curiosity and commitment. Apply for open roles or propose a new domain you want to lead.',
    ctaButton: { label: 'Apply to Join', link: 'contact.html' },
  },

  contact: {
    heroEyebrow: 'Get Involved',
    heroTitle: 'Contact',
    heroAccent: 'Us',
    heroText: "Want to join, collaborate, sponsor, or just say hi? We'd love to hear from you.",
    connectTitle: "Let's Connect",
    connectText: "Whether you're a student looking to join, a company wanting to sponsor, or a faculty member interested in collaboration — reach out. We respond within 48 hours.",
    email: 'technospark@college.edu',
    location: 'BCA department',
    hours: 'Monday – Friday: 8:30 AM – 1:30 PM',
    socialsLabel: 'Social Media',
    socials: [
      { label: 'Netlify', url: '#' },
      { label: 'GitHub', url: '#' },
    ],
    reasons: [
      'Join TechnoSpark as a member',
      'join in event',
      'Propose a collaboration',
      'Sponsor or partner with us',
      'General enquiry',
    ],
    faqEyebrow: 'Quick Answers',
    faqTitle: 'FAQ',
    faq: [
      { q: 'Who can join TechnoSpark?', a: 'Any student enrolled in our college, from any department or year. We welcome complete beginners!' },
      { q: 'Do I need prior coding experience?', a: 'Not at all. We run beginner-friendly workshops every month. Everyone starts somewhere.' },
    ],
  },
};

export default defaults;
