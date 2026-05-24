/**
 * Resale Report CSS — export version (uses CSS variables, no font-sizes
 * except where they are unique to the resale layout).
 * Companion to BLOG_CSS_EXPORT; only the blocks unique to Resale Reports
 * live here. Existing blocks reused by resale reports stay in BLOG_CSS_EXPORT.
 */
export const RESALE_CSS_EXPORT = `/* ============================================
   FASHIONPHILE RESALE REPORT — SECTIONS CSS
   ============================================ */

/* ----------------------------------------
   Resale sections use the .fp-container and .fp-container--full-width
   utility classes from your base.css for content width + responsive padding.
   No layout vars are redefined here.
   ---------------------------------------- */

/* ----------------------------------------
   Any resale section that has been given an inline background-color
   collapses its outer margins to zero so adjacent colored sections butt
   against each other. Vertical padding defaults to 4rem; the picker can
   override via padding-top / padding-bottom inline styles.
   ---------------------------------------- */
[data-section-id][style*="background-color"] {
  padding-block: 4rem;
  margin: 0;
}

/* ----------------------------------------
   RESALE REPORT — HERO BANNER
   ---------------------------------------- */
.blog__resale-hero {
  position: relative;
  width: 100%;
  min-height: 22rem;
  background-color: var(--color-black);
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 0 2.5rem;
}

.blog__resale-hero__overlay {
  text-align: center;
  color: var(--color-white);
  padding: 4rem 1.5rem;
  width: 100%;
}

.blog__resale-hero__eyebrow {
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin: 0 0 0.75rem;
  font-weight: var(--font-weight-regular);
}

.blog__resale-hero__title {
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin: 0;
  font-weight: var(--font-weight-semibold);
}

@media (min-width: 64rem) {
  .blog__resale-hero {
    min-height: 32rem;
  }
}

/* ----------------------------------------
   RESALE REPORT — RICH TEXT
   ---------------------------------------- */
.blog__resale-rich-text {
  width: 100%;
  margin: 0 0 2.5rem;
}

.blog__resale-rich-text--center {
  text-align: center;
}

.blog__resale-rich-text__heading {
  font-weight: var(--font-weight-semibold);
  margin: 0 0 1rem;
}

.blog__resale-rich-text__body p {
  margin: 0 0 1em;
}

.blog__resale-rich-text__body p:last-child {
  margin-bottom: 0;
}

.blog__resale-rich-text__body a {
  color: inherit;
  text-decoration: underline;
}

.blog__resale-rich-text__toggle {
  position: absolute;
  opacity: 0;
  pointer-events: none;
  width: 0;
  height: 0;
}

.blog__resale-rich-text--show-more .blog__resale-rich-text__body {
  max-height: 5.5em;
  overflow: hidden;
  position: relative;
  -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
  transition: max-height 0.4s ease, mask-image 0.4s ease;
}

.blog__resale-rich-text__toggle:checked ~ .blog__resale-rich-text__body {
  max-height: 200em;
  -webkit-mask-image: none;
  mask-image: none;
}

.blog__resale-rich-text__more {
  display: inline-block;
  margin-top: 1rem;
  text-decoration: underline;
  cursor: pointer;
  user-select: none;
}

.blog__resale-rich-text__less-text {
  display: none;
}

.blog__resale-rich-text__toggle:checked ~ .blog__resale-rich-text__more .blog__resale-rich-text__more-text {
  display: none;
}

.blog__resale-rich-text__toggle:checked ~ .blog__resale-rich-text__more .blog__resale-rich-text__less-text {
  display: inline;
}

/* ----------------------------------------
   RESALE REPORT — SLIDER (carousel)
   ---------------------------------------- */
.blog__resale-slider {
  margin: 0 0 2.5rem;
  padding: 0;
  overflow: hidden;
}

.blog__resale-slider__track {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 1rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.blog__resale-slider__track::-webkit-scrollbar {
  display: none;
}

.blog__resale-slider__slide {
  flex: 0 0 calc((100% - 2rem) / 3);
  scroll-snap-align: start;
  text-align: center;
  margin: 0;
}

@media (max-width: 48rem) {
  .blog__resale-slider__slide {
    flex: 0 0 80%;
  }
}

.blog__resale-slider__image-wrapper {
  width: 100%;
  aspect-ratio: 1 / 1;
  background-color: var(--color-grey-1);
  overflow: hidden;
  margin-bottom: 1rem;
}

.blog__resale-slider__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.blog__resale-slider__title {
  font-weight: var(--font-weight-semibold);
  margin: 0 0 0.25rem;
}

.blog__resale-slider__title-link {
  color: inherit;
  text-decoration: underline;
}

.blog__resale-slider__desc {
  color: var(--color-grey-7);
  margin: 0;
}

.blog__resale-slider__dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.25rem;
}

.blog__resale-slider__dot {
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  padding: 0;
  border: none;
  border-radius: 50%;
  background-color: var(--color-grey-3);
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.blog__resale-slider__dot:hover {
  background-color: var(--color-grey-5);
  transform: scale(1.15);
}

.blog__resale-slider__dot--active {
  background-color: var(--color-grey-7);
}

/* ----------------------------------------
   RESALE REPORT — IMAGE + TEXT
   ---------------------------------------- */
.blog__resale-image-text {
  width: 100%;
  margin: 0 0 2.5rem;
}

.blog__resale-image-text__inner {
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr;
  align-items: center;
}

@media (min-width: 48rem) {
  .blog__resale-image-text__inner {
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
  }
  .blog__resale-image-text--image-right .blog__resale-image-text__image {
    order: 2;
  }
}

.blog__resale-image-text__image img {
  display: block;
  width: 100%;
  height: auto;
}

.blog__resale-image-text__heading {
  font-weight: var(--font-weight-semibold);
  margin: 0 0 1rem;
}

.blog__resale-image-text__body p {
  margin: 0 0 1em;
}

.blog__resale-image-text__eyebrow {
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin: 1.5rem 0 0.75rem;
  font-weight: var(--font-weight-semibold);
}

.blog__resale-image-text__list ol,
.blog__resale-image-text__list ul {
  margin: 0;
  padding-left: 1.25rem;
}

.blog__resale-image-text__list a {
  color: inherit;
  text-decoration: underline;
}

/* ----------------------------------------
   RESALE REPORT — AUTHOR (circular avatar + name)
   ---------------------------------------- */
.blog__resale-author {
  width: 100%;
  margin: 2.5rem 0;
  text-align: center;
}

.blog__resale-author__intro {
  margin-bottom: 2rem;
}

.blog__resale-author__intro p {
  margin: 0 0 0.75em;
}

.blog__resale-author__intro p:last-child {
  margin-bottom: 0;
}

.blog__resale-author__intro a {
  color: inherit;
  text-decoration: underline;
}

.blog__resale-author__figure {
  width: 7.5rem;
  height: 7.5rem;
  margin: 0 auto 1rem;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--color-grey-1);
}

.blog__resale-author__avatar {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.blog__resale-author__name {
  font-weight: var(--font-weight-semibold);
  margin: 0;
}

.blog__resale-author__title {
  color: var(--color-grey-7);
  margin: 0.25rem 0 0;
}`
