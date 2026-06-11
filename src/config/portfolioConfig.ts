import brandingHero from '../assets/images/branding/1-Logos.jpg';
import websitesHero from '../assets/images/websites/2-Websites.jpg';
import pitchDecksHero from '../assets/images/pitch-decks/3-Decks.jpg';
import socialMediaHero from '../assets/images/social-media/4-Comms.jpg';

export interface PortfolioPage {
  id: string;
  slug: string;
  title: string;
  heroImage: string;
  gallery: string[];
}

export const portfolioPages: PortfolioPage[] = [
  {
    id: 'branding',
    slug: 'branding-identity',
    title: 'Branding & Identity',
    heroImage: brandingHero,
    gallery: [
      import('../assets/images/branding/1-instibase.jpg').then(m => m.default),
      import('../assets/images/branding/2-logo_hrana_reloaded.png').then(m => m.default),
      import('../assets/images/branding/3-icon_hrana_reloaded_bg.png').then(m => m.default),
      import('../assets/images/branding/4-hellocampus.png').then(m => m.default),
      import('../assets/images/branding/5-julyfy.jpg').then(m => m.default),
      import('../assets/images/branding/6-MRL.jpg').then(m => m.default),
      import('../assets/images/branding/7-oxigen-light.jpg').then(m => m.default),
      import('../assets/images/branding/8-oxigen-dark.jpg').then(m => m.default),
      import('../assets/images/branding/9-timjs.jpg').then(m => m.default),
      import('../assets/images/branding/10-timotion-logo.jpg').then(m => m.default),
    ],
  },
  {
    id: 'websites',
    slug: 'websites-landing-pages',
    title: 'Websites & Landing Pages',
    heroImage: websitesHero,
    gallery: [
      import('../assets/images/websites/1-Hacktm.png').then(m => m.default),
      import('../assets/images/websites/2-Hacktm.png').then(m => m.default),
      import('../assets/images/websites/3-Hacktm.png').then(m => m.default),
      import('../assets/images/websites/4-Hacktm.png').then(m => m.default),
      import('../assets/images/websites/5-Angajabilitate.jpg').then(m => m.default),
      import('../assets/images/websites/6-Angajabilitate.jpg').then(m => m.default),
      import('../assets/images/websites/7-Angajabilitate.png').then(m => m.default),
      import('../assets/images/websites/8-CSA.png').then(m => m.default),
      import('../assets/images/websites/9-CSA.png').then(m => m.default),
      import('../assets/images/websites/10-HAI.png').then(m => m.default),
      import('../assets/images/websites/11-Instantli.jpg').then(m => m.default),
      import('../assets/images/websites/12-Instantli.jpg').then(m => m.default),
      import('../assets/images/websites/13-Instantli.jpg').then(m => m.default),
      import('../assets/images/websites/14-DocProject.png').then(m => m.default),
      import('../assets/images/websites/15-DocProject.png').then(m => m.default),
      import('../assets/images/websites/16-DocProject.png').then(m => m.default),
      import('../assets/images/websites/17-DocProject.png').then(m => m.default),
      import('../assets/images/websites/18-Timotion.jpg').then(m => m.default),
    ],
  },
  {
    id: 'pitch-decks',
    slug: 'pitch-decks-graphics',
    title: 'Pitch Decks & Graphics',
    heroImage: pitchDecksHero,
    gallery: [
      import('../assets/images/pitch-decks/1-BIT.png').then(m => m.default),
      import('../assets/images/pitch-decks/2-BIT.png').then(m => m.default),
      import('../assets/images/pitch-decks/3-BIT.png').then(m => m.default),
      import('../assets/images/pitch-decks/4-BIT.png').then(m => m.default),
      import('../assets/images/pitch-decks/5-BIT.png').then(m => m.default),
      import('../assets/images/pitch-decks/6-EB.jpg').then(m => m.default),
      import('../assets/images/pitch-decks/7-EB.jpg').then(m => m.default),
      import('../assets/images/pitch-decks/8-EB.jpg').then(m => m.default),
      import('../assets/images/pitch-decks/9-EB.jpg').then(m => m.default),
      import('../assets/images/pitch-decks/10-Barometru-1.png').then(m => m.default),
      import('../assets/images/pitch-decks/11-Barometru-2.png').then(m => m.default),
      import('../assets/images/pitch-decks/12-Barometru-3.png').then(m => m.default),
      import('../assets/images/pitch-decks/13-HAI.png').then(m => m.default),
      import('../assets/images/pitch-decks/14-HAI.png').then(m => m.default),
      import('../assets/images/pitch-decks/15-HAI.png').then(m => m.default),
      import('../assets/images/pitch-decks/16-HAI.png').then(m => m.default),
      import('../assets/images/pitch-decks/17-HAI.jpg').then(m => m.default),
      import('../assets/images/pitch-decks/18-HAI.png').then(m => m.default),
      import('../assets/images/pitch-decks/19-HAI.png').then(m => m.default),
      import('../assets/images/pitch-decks/20-HAI.png').then(m => m.default),
      import('../assets/images/pitch-decks/21-O2TM.jpg').then(m => m.default),
      import('../assets/images/pitch-decks/22-PMT-1.png').then(m => m.default),
      import('../assets/images/pitch-decks/23-PMT-2.png').then(m => m.default),
      import('../assets/images/pitch-decks/24-PMT-3.png').then(m => m.default),
      import('../assets/images/pitch-decks/25-PMT-4.png').then(m => m.default),
    ],
  },
  {
    id: 'social-media',
    slug: 'social-media-graphics',
    title: 'Social Media Graphics',
    heroImage: socialMediaHero,
    gallery: [
      import('../assets/images/social-media/1-Hacktm.png').then(m => m.default),
      import('../assets/images/social-media/2-Hacktm.png').then(m => m.default),
      import('../assets/images/social-media/3-Hacktm.png').then(m => m.default),
      import('../assets/images/social-media/4-Hacktm.png').then(m => m.default),
      import('../assets/images/social-media/5-Hacktm.png').then(m => m.default),
      import('../assets/images/social-media/6-Hacktm.jpg').then(m => m.default),
      import('../assets/images/social-media/7-Hacktm.jpg').then(m => m.default),
      import('../assets/images/social-media/8-Hacktm.jpg').then(m => m.default),
      import('../assets/images/social-media/9-timjs.png').then(m => m.default),
      import('../assets/images/social-media/10-timjs.png').then(m => m.default),
      import('../assets/images/social-media/11-timjs.png').then(m => m.default),
      import('../assets/images/social-media/12-timjs.png').then(m => m.default),
      import('../assets/images/social-media/13-timjs.png').then(m => m.default),
      import('../assets/images/social-media/14-timjs.png').then(m => m.default),
      import('../assets/images/social-media/15-HCO.jpg').then(m => m.default),
      import('../assets/images/social-media/16-HCO.jpg').then(m => m.default),
      import('../assets/images/social-media/17-HCO.jpg').then(m => m.default),
      import('../assets/images/social-media/18-HCO.jpg').then(m => m.default),
      import('../assets/images/social-media/19-HCO.jpg').then(m => m.default),
      import('../assets/images/social-media/20-HCO.jpg').then(m => m.default),
      import('../assets/images/social-media/21-HCO.jpg').then(m => m.default),
      import('../assets/images/social-media/22-itschool.png').then(m => m.default),
      import('../assets/images/social-media/23-itschool.jpg').then(m => m.default),
      import('../assets/images/social-media/24-itschool.png').then(m => m.default),
      import('../assets/images/social-media/25-mlmeetup.jpg').then(m => m.default),
      import('../assets/images/social-media/26-mlmeetup.jpg').then(m => m.default),
      import('../assets/images/social-media/27-ness.png').then(m => m.default),
      import('../assets/images/social-media/28-ness.jpg').then(m => m.default),
      import('../assets/images/social-media/29-ness.jpg').then(m => m.default),
    ],
  },
];

export function getPageBySlug(slug: string): PortfolioPage | undefined {
  return portfolioPages.find(page => page.slug === slug);
}

export function getOtherPages(currentSlug: string): PortfolioPage[] {
  return portfolioPages.filter(page => page.slug !== currentSlug);
}