import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const STRAPI_URL = import.meta.env.PUBLIC_STRAPI_URL || 'https://api.markket.place';
const STORE_SLUG = import.meta.env.PUBLIC_STORE_SLUG || 'pardes';
const SYNC_INTERVAL = 6000;

interface StrapiQueryOptions {
  contentType: string;
  sort?: string;
  filter?: string;
  populate?: string;
  paginate?: {
    limit?: number;
  };
}

// 1. Define a global passthrough schema to satisfy Astro's type engine
const baseStrapiSchema = z.object({}).passthrough();

/**
 * Native Strapi v5 Content Layer Loader for Astro
 */
function strapiLoader(query: StrapiQueryOptions) {
  return {
    name: `strapi-${query.contentType}`,

    async load({ store, logger, meta }: { store: any; logger: any; meta: any }) {
      const lastSynced = meta.get("lastSynced");
      if (lastSynced && Date.now() - Number(lastSynced) < SYNC_INTERVAL) {
        logger.info(`[Strapi] Skipping sync for ${query.contentType} (throttled)`);
        return;
      }

      try {
        const url = new URL(`/api/${query.contentType}s`, STRAPI_URL);

        if (query.sort) url.searchParams.append("sort", query.sort);
        if (query.populate) url.searchParams.append("populate", query.populate);

        if (query.paginate?.limit) {
          url.searchParams.append("pagination[limit]", String(query.paginate.limit));
        } else {
          url.searchParams.append("pagination[limit]", "100");
        }

        if (query.filter) {
          const params = new URLSearchParams(query.filter);
          for (const [key, value] of params.entries()) {
            url.searchParams.append(key, value);
          }
        }

        logger.info(`[Strapi] Fetching: ${url.toString()}`);

        const response = await fetch(url.toString(), {
          headers: {
            "Content-Type": "application/json",
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        const items = json.data;
        if (!items || !Array.isArray(items)) {
          logger.warn(`[Strapi] Missing data array for ${query.contentType}`);
          return;
        }

        store.clear();
        for (const item of items) {
          const dataPayload = item.attributes ? { id: item.id, ...item.attributes } : item;
          store.set({
            id: String(item.id),
            data: dataPayload,
          });
        }

        meta.set("lastSynced", String(Date.now()));
        logger.info(`[Strapi] Synced ${items.length} items for ${query.contentType}`);
      } catch (error) {
        logger.error(`[Strapi] Failed to load ${query.contentType}: ${error}`);
      }
    },
  };
};

// ===================================================
// Collection Definitions with Explicit Passthrough Schemas
// ===================================================

// const pages = defineCollection({
//   loader: strapiLoader({
//     contentType: "page",
//     sort: "slug:ASC",
//     filter: `filters[store][slug][$eq]=${STORE_SLUG}`,
//     populate: "seo.socialImage,albums,albums.tracks,albums.cover",
//   }),
//   schema: baseStrapiSchema // 2. Hardcoded here so Astro never reads 'undefined'
// });

// const store = defineCollection({
//   loader: strapiLoader({
//     contentType: "store",
//     filter: `filters[slug][$eq]=${STORE_SLUG}`,
//     populate: "seo.socialImage,logo,urls,favicon,cover",
//   }),
//   schema: baseStrapiSchema
// });

// const stores = defineCollection({
//   loader: strapiLoader({
//     contentType: "store",
//     filter: "filters[active]=true",
//     populate: "seo.socialImage,logo,urls,favicon",
//   }),
//   schema: baseStrapiSchema
// });

// const products = defineCollection({
//   loader: strapiLoader({
//     contentType: "product",
//     filter: `filters[stores][slug][$eq]=${STORE_SLUG}`,
//     sort: "slug:DESC",
//     populate: "seo,seo.socialImage,thumbnail,slides,prices",
//   }),
//   schema: baseStrapiSchema
// });

// const posts = defineCollection({
//   loader: strapiLoader({
//     contentType: "article",
//     filter: `filters[store][slug][$eq]=${STORE_SLUG}`,
//     populate: "seo.socialImage,tags,store,cover",
//     sort: "createdAt:DESC",
//     paginate: { limit: 100 },
//   }),
//   schema: baseStrapiSchema
// });

// const events = defineCollection({
//   loader: strapiLoader({
//     contentType: "event",
//     filter: `filters[stores][slug][$eq]=${STORE_SLUG}`,
//     populate: "seo,seo.socialImage,tag,thumbnail,slides,stores",
//   }),
//   schema: baseStrapiSchema
// });

const albums = defineCollection({
  loader: strapiLoader({
    contentType: "album",
    filter: `filters[store][slug][$eq]=${STORE_SLUG}`,
    populate: "seo,seo.socialImage,media,cover",
  }),
  schema: baseStrapiSchema
});

// export const collections = { posts, pages, stores, products, events, store, albums };



const products = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/products" }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      collection: z.string(),
      category: z.string(),
      material: z.string(),
      price: z.number().int().nonnegative(),
      shortDescription: z.string(),
      dimensions: z.string(),
      finish: z.string(),
      leadTime: z.string(),
      images: z.array(image()).min(1),
      order: z.number().int().nonnegative().default(999),
    }),
});

export const collections = { products, albums };
