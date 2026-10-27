/**
 * Central theme configuration.
 *
 * Everything a new site normally needs to change lives here: the studio name,
 * navigation, footer, contact details, commerce defaults, and which products
 * are promoted on the homepage and in the mobile menu. Components read from
 * this file rather than hardcoding copy, so renaming or re-scoping the theme
 * does not mean editing markup.
 *
 * The canonical domain is NOT here — it is `site` in astro.config.mjs, so
 * there is only ever one source of truth for it.
 */

export interface NavItem {
  label: string;
  href: string;
}

export interface FooterColumn {
  heading: string;
  links: NavItem[];
}

export const siteConfig = {
  /** Studio name. */
  name: "Pardes",

  /** Brand positioning. */
  tagline: "Art, tradition, and meaning for everyday life",

  description:
    "Discover art prints and thoughtfully designed Judaica inspired by Jewish tradition, Hebrew typography, and contemporary culture.",

  defaultTitle: "Pardes — Art, Tradition & Meaning",

  /** Replace with the real customer support address. */
  email: "pardes@markket.place",

  /** Update if you establish a public studio location. */
  location: {
    region: "California",
    country: "US",
  },

  /** Keep in step with --canvas in src/styles.css. */
  themeColor: "#f4f1e9",

  socialImage: {
    src: "/og-image.png",
    width: 1200,
    height: 630,
    alt: "Pardes — art, tradition, and meaning",
  },

  navigation: [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/catalog" },
    { label: "About", href: "/about" },
  ] satisfies NavItem[],

  footerBlurb:
    "Art and objects inspired by Jewish tradition, Hebrew lettering, and the beauty of everyday life. Thoughtfully designed, made to be lived with.",

  footerColumns: [
    {
      heading: "Shop",
      links: [
        { label: "All products", href: "/catalog" },
        { label: "Art prints", href: "/catalog?category=prints" },
        { label: "Apparel", href: "/catalog?category=apparel" },
        { label: "Your cart", href: "/cart" },
      ],
    },
    {
      heading: "Pardes",
      links: [
        { label: "Our story", href: "/about" },
        { label: "Contact", href: "mailto:hello@pardes.markket.place" },
      ],
    },
    {
      heading: "Follow along",
      links: [
        // { label: "Instagram", href: "https://www.instagram.com/" },
      ],
    },
  ] satisfies FooterColumn[],

  commerce: {
    /** BCP 47 locale used to format prices. */
    locale: "en-US",
    /** ISO 4217 currency code. */
    currency: "USD",

    /**
     * Placeholder only. Replace with the real shipping calculation
     * before enabling production checkout.
     */
    shippingFlatRate: 0,
  },

  /**
   * Temporary local-content slugs.
   * Replace these with real product slugs when connecting Strapi.
   */
  featured: {
    homepageGrid: [
      "hebrew-art-print",
      "shabbat-print",
      "judaica-wall-art",
    ],
    homepageSolo: "featured-artwork",
    mobileMenu: "bestseller-print",
  },
} as const;

export type SiteConfig = typeof siteConfig;

/**
 * Builds a page <title> in the theme's house format: "Page — Studio Name".
 * Change the separator here to restyle every title at once.
 */
export function pageTitle(page: string): string {
  return `${page} — ${siteConfig.name}`;
}
