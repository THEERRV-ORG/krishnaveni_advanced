import type { Request } from 'express';
import type { ClinicInfo, Doctor, FAQItem } from './src/types.js';
import { CLINICAL_DEPARTMENTS } from './src/data/departmentsData.js';

export const HEAD_PLACEHOLDER = '<!--app-head-->';

const TITLE = 'Online Physiotherapy in India | Dr. P. Sai Tejaswini, MPT (Neuro)';
const DESCRIPTION =
  'Video physiotherapy consultations for stroke, back and neck pain, joint problems, post-surgical recovery ' +
  "and women's health with Dr. P. Sai Tejaswini, MPT (Neuro), MIAP. Book a 45-minute session on Google Meet.";

// Shown on the site as "Mon–Sat, 9:30 am – 8:00 pm"; keep the two in step.
const OPENING_HOURS = [
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    opens: '09:30',
    closes: '20:00',
  },
];

export function siteUrlFor(req: Request): string {
  const configured = process.env.SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, '');
  const proto = (req.get('x-forwarded-proto') || req.protocol).split(',')[0].trim();
  return `${proto}://${req.get('host')}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// JSON inside <script> must not be able to close the tag.
function jsonForScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

interface HeadInput {
  siteUrl: string;
  clinic: ClinicInfo;
  doctor: Doctor;
  faqs: FAQItem[];
  notFound?: boolean;
}

function structuredData({ siteUrl, clinic, doctor, faqs }: HeadInput) {
  const clinicId = `${siteUrl}/#clinic`;
  const doctorId = `${siteUrl}/#doctor`;
  const hasClinicPhoto = doctor.avatarUrl?.startsWith('/api/doctor-photo');

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: `${siteUrl}/`,
        name: clinic.name,
        inLanguage: 'en-IN',
        publisher: { '@id': clinicId },
      },
      {
        '@type': 'MedicalClinic',
        '@id': clinicId,
        name: clinic.name,
        url: `${siteUrl}/`,
        logo: `${siteUrl}/logo-512.png`,
        image: `${siteUrl}/og-image.png`,
        description: DESCRIPTION,
        telephone: clinic.phone.replace(/\s/g, ''),
        email: clinic.email,
        medicalSpecialty: 'https://schema.org/Physiotherapy',
        areaServed: { '@type': 'Country', name: 'India' },
        availableService: CLINICAL_DEPARTMENTS.map(dept => ({
          '@type': 'MedicalTherapy',
          name: dept.name,
          description: dept.tagline,
        })),
        openingHoursSpecification: OPENING_HOURS,
        employee: { '@id': doctorId },
      },
      {
        '@type': 'Person',
        '@id': doctorId,
        name: doctor.name,
        jobTitle: 'Physiotherapist',
        honorificSuffix: 'MPT (Neuro), MIAP',
        description: doctor.bio,
        worksFor: { '@id': clinicId },
        ...(hasClinicPhoto ? { image: `${siteUrl}/api/doctor-photo` } : {}),
      },
      {
        '@type': 'FAQPage',
        '@id': `${siteUrl}/#faq`,
        mainEntity: faqs.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      },
    ],
  };
}

// Every section URL is the same page, so all of them point their canonical at the home page.
export function renderHead(input: HeadInput): string {
  const { siteUrl, notFound } = input;
  const canonical = `${siteUrl}/`;
  const ogImage = `${siteUrl}/og-image.png`;

  const tags = [
    `<title>${escapeHtml(notFound ? `Page not found | ${TITLE}` : TITLE)}</title>`,
    `<meta name="description" content="${escapeHtml(DESCRIPTION)}" />`,
    `<meta name="robots" content="${notFound ? 'noindex, follow' : 'index, follow, max-image-preview:large'}" />`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta name="theme-color" content="#003078" />`,
    `<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png" />`,
    `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="en_IN" />`,
    `<meta property="og:site_name" content="${escapeHtml(input.clinic.name)}" />`,
    `<meta property="og:title" content="${escapeHtml(TITLE)}" />`,
    `<meta property="og:description" content="${escapeHtml(DESCRIPTION)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta property="og:image" content="${escapeHtml(ogImage)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(TITLE)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(DESCRIPTION)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />`,
  ];

  if (!notFound) {
    tags.push(`<script type="application/ld+json">${jsonForScript(structuredData(input))}</script>`);
  }

  return tags.join('\n    ');
}

export function renderRobots(siteUrl: string): string {
  return ['User-agent: *', 'Allow: /', 'Disallow: /api/', '', `Sitemap: ${siteUrl}/sitemap.xml`, ''].join('\n');
}

// Only the canonical URL is listed: the section URLs are the same page and canonicalise to "/".
export function renderSitemap(siteUrl: string, lastModified: Date): string {
  const lastmod = lastModified.toISOString().slice(0, 10);
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    '  <url>',
    `    <loc>${escapeHtml(`${siteUrl}/`)}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    '    <changefreq>monthly</changefreq>',
    '    <priority>1.0</priority>',
    '    <image:image>',
    `      <image:loc>${escapeHtml(`${siteUrl}/og-image.png`)}</image:loc>`,
    '    </image:image>',
    '  </url>',
    '</urlset>',
    '',
  ].join('\n');
}
