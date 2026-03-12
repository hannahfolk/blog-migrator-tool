/**
 * Export-ready CSS for the CSS tab.
 * - Colors use var(--color-*) CSS custom properties
 * - Font-sizes removed except for hotspot marker/label and author byline
 * - Font-weights removed
 * - Line-heights use var(--line-height-*) where applicable
 */
export const BLOG_CSS_EXPORT = `/* ============================================
   FASHIONPHILE BLOG SECTIONS - COMPLETE CSS
   ============================================ */

/* ----------------------------------------
   SHARED RICH TEXT STYLES
   These apply to all __body elements
   ---------------------------------------- */
[class*="__body"] p {
  margin-bottom: 1em;
}

[class*="__body"] p:last-child {
  margin-bottom: 0;
}

[class*="__body"] a,
[class*="__heading"] a,
[class*="__title"] a {
  color: inherit;
  text-decoration: underline;
}

[class*="__body"] a:hover,
[class*="__heading"] a:hover,
[class*="__title"] a:hover {
  text-decoration: none;
  opacity: 0.8;
}

[class*="__body"] strong,
[class*="__body"] b {
  font-weight: var(--font-weight-bold);
}

[class*="__body"] em,
[class*="__body"] i {
  font-style: italic;
}

[class*="__body"] h1 {
  margin-top: 1.5em;
  margin-bottom: 0.75em;
}

[class*="__body"] h2 {
  margin-top: 1.5em;
  margin-bottom: 0.75em;
}

[class*="__body"] h3 {
  margin-top: 1.5em;
  margin-bottom: 0.75em;
}

[class*="__body"] h4 {
  margin-top: 1.25em;
  margin-bottom: 0.5em;
}

[class*="__body"] h5 {
  margin-top: 1em;
  margin-bottom: 0.5em;
}

[class*="__body"] h6 {
  margin-top: 1em;
  margin-bottom: 0.5em;
}

[class*="__body"] ul,
[class*="__body"] ol {
  margin-bottom: 1em;
  padding-left: 1.5em;
}

[class*="__body"] ul {
  list-style-type: disc;
}

[class*="__body"] ol {
  list-style-type: decimal;
}

[class*="__body"] li {
  margin-bottom: 0.5em;
}

[class*="__body"] li:last-child {
  margin-bottom: 0;
}

[class*="__body"] ul ul,
[class*="__body"] ol ol,
[class*="__body"] ul ol,
[class*="__body"] ol ul {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

[class*="__body"] blockquote {
  display: block !important;
  margin: 1em 0;
  padding-left: 2rem;
  border-left: none;
  position: relative;
  font-style: normal;
  color: var(--color-black);
}

[class*="__body"] blockquote::before {
  content: '\\201C';
  position: absolute;
  left: -1rem;
  top: -1rem;
  font-family: 'Simplon Norm', Georgia, serif;
  font-size: 8rem;
  line-height: var(--line-height-xs);
  color: var(--color-black);
  opacity: 0.1;
  pointer-events: none;
}

[class*="__body"] hr {
  border: none;
  border-top: 0.0625rem solid var(--color-grey-2);
  margin: 1.5em 0;
}

/* ----------------------------------------
   SHARED IMAGE STYLES
   ---------------------------------------- */
[class*="__image"] {
  filter: brightness(0.95);
}

/* ----------------------------------------
   BUTTON VARIANTS
   Default (outline): transparent bg, black border, black text
   Solid: black, white, or pink bg with hover inversion
   ---------------------------------------- */
[class*="__cta-btn"] {
  display: block !important;
  width: 100%;
  text-align: center;
  padding: 0.9375rem;
  text-transform: capitalize;
  text-decoration: none !important;
  letter-spacing: 0.0625rem;
  border: 0.0625rem solid var(--color-black);
  background-color: transparent;
  color: var(--color-black);
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

[class*="__cta-btn"]:hover {
  background-color: var(--color-black);
  color: var(--color-white);
}

[class*="__cta-btn"].blog-btn--solid-black {
  background-color: var(--color-black);
  color: var(--color-white);
  border-color: var(--color-black);
}

[class*="__cta-btn"].blog-btn--solid-black:hover {
  background-color: transparent;
  color: var(--color-black);
}

[class*="__cta-btn"].blog-btn--solid-white {
  background-color: var(--color-white);
  color: var(--color-black);
  border-color: var(--color-white);
}

[class*="__cta-btn"].blog-btn--solid-white:hover {
  background-color: transparent;
  color: var(--color-black);
}

[class*="__cta-btn"].blog-btn--solid-pink {
  background-color: var(--color-pink);
  color: var(--color-white);
  border-color: var(--color-pink);
}

[class*="__cta-btn"].blog-btn--solid-pink:hover {
  background-color: transparent;
  color: var(--color-black);
}

/* ----------------------------------------
   FULL WIDTH SECTION
   ---------------------------------------- */
.blog__full-width {
  margin-bottom: 2.5rem;
}

.blog__full-width__heading {
  margin-bottom: 1rem;
}

.blog__full-width__body {
  margin-bottom: 1.5rem;
}

.blog__full-width__figure {
  margin: 0;
  text-align: center;
}

.blog__full-width__image {
  width: 100%;
  height: auto;
  display: block;
}

.blog__full-width__cta-btn {
  margin-top: 0.5rem;
}


/* ----------------------------------------
   1-UP SECTION
   ---------------------------------------- */
.blog__one-up {
  margin-bottom: 2.5rem;
}

.blog__one-up__heading {
  margin-bottom: 1rem;
}

.blog__one-up__body {
  margin-bottom: 1.5rem;
}

.blog__one-up__figure {
  margin: 0;
  text-align: left;
  max-width: 50%;
}

.blog__one-up__image {
  width: 100%;
  height: auto;
  display: block;
}

@media screen and (max-width: 767px) {
  .blog__one-up__figure {
    max-width: 100%;
  }
}

.blog__one-up__label {
  display: block;
  margin-top: 0.5rem;
  text-align: center;
}

.blog__one-up__cta-btn {
  margin-top: 0.5rem;
}


/* ----------------------------------------
   2-UP SECTION
   ---------------------------------------- */
.blog__two-up {
  margin-bottom: 2.5rem;
}

.blog__two-up__heading {
  margin-bottom: 1rem;
}

.blog__two-up__body {
  margin-bottom: 1.5rem;
}

.blog__two-up__grid {
  display: flex;
  gap: 1.875rem;
}

.blog__two-up__item {
  flex: 1;
  margin: 0;
  text-align: left;
}

.blog__two-up__image {
  width: 100%;
  max-width: 37.5rem;
  height: auto;
  display: block;
}

.blog__two-up__label {
  display: block;
  margin-top: 0.5rem;
  text-align: center;
}

.blog__two-up__item .blog__two-up__cta-btn {
  margin-top: 0.5rem;
}

.blog__two-up__cta {
  text-align: center;
  margin-top: 1.875rem;
}


@media screen and (max-width: 767px) {
  .blog__two-up__grid {
    flex-direction: column;
  }
}

/* ----------------------------------------
   3-UP SECTION
   ---------------------------------------- */
.blog__three-up {
  margin-bottom: 2.5rem;
}

.blog__three-up__heading {
  margin-bottom: 1rem;
}

.blog__three-up__body {
  margin-bottom: 1.5rem;
}

.blog__three-up__grid {
  display: flex;
  gap: 1.875rem;
}

.blog__three-up__item {
  flex: 1;
  margin: 0;
  text-align: left;
}

.blog__three-up__image {
  width: 100%;
  max-width: 25rem;
  height: auto;
  display: block;
}

.blog__three-up__label {
  display: block;
  margin-top: 0.5rem;
  text-align: center;
}

.blog__three-up__item .blog__three-up__cta-btn {
  margin-top: 0.5rem;
}

.blog__three-up__cta {
  text-align: center;
  margin-top: 1.875rem;
}


@media screen and (max-width: 767px) {
  .blog__three-up__grid {
    flex-direction: column;
  }
}

/* ----------------------------------------
   4-UP SECTION
   ---------------------------------------- */
.blog__four-up {
  margin-bottom: 2.5rem;
}

.blog__four-up__heading {
  margin-bottom: 1rem;
}

.blog__four-up__body {
  margin-bottom: 1.5rem;
}

.blog__four-up__grid {
  display: flex;
  gap: 1.875rem;
}

.blog__four-up__item {
  flex: 1;
  margin: 0;
  text-align: left;
}

.blog__four-up__image {
  width: 100%;
  max-width: 18.75rem;
  height: auto;
  display: block;
}

.blog__four-up__label {
  display: block;
  margin-top: 0.5rem;
  text-align: center;
}

.blog__four-up__item .blog__four-up__cta-btn {
  margin-top: 0.5rem;
}

.blog__four-up__cta {
  text-align: center;
  margin-top: 1.875rem;
}


@media screen and (max-width: 767px) {
  .blog__four-up__grid {
    flex-direction: column;
  }
}

/* ----------------------------------------
   5-UP SECTION
   ---------------------------------------- */
.blog__five-up {
  margin-bottom: 2.5rem;
}

.blog__five-up__heading {
  margin-bottom: 1rem;
}

.blog__five-up__body {
  margin-bottom: 1.5rem;
}

.blog__five-up__grid {
  display: flex;
  gap: 1.875rem;
}

.blog__five-up__item {
  flex: 1;
  margin: 0;
  text-align: left;
}

.blog__five-up__image {
  width: 100%;
  max-width: 15rem;
  height: auto;
  display: block;
}

.blog__five-up__label {
  display: block;
  margin-top: 0.5rem;
  text-align: center;
}

.blog__five-up__item .blog__five-up__cta-btn {
  margin-top: 0.5rem;
}

.blog__five-up__cta {
  text-align: center;
  margin-top: 1.875rem;
}


@media screen and (max-width: 767px) {
  .blog__five-up__grid {
    flex-direction: column;
  }
}

/* ----------------------------------------
   VIDEO SECTION
   ---------------------------------------- */
.blog__video {
  margin-bottom: 2.5rem;
}

.blog__video__heading {
  margin-bottom: 1rem;
}

.blog__video__body {
  margin-bottom: 1.5rem;
}

.blog__video__wrapper {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
}

.blog__video__iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

/* ----------------------------------------
   2 x 2 SECTION
   ---------------------------------------- */
.blog__two-by-two {
  margin-bottom: 2.5rem;
}

.blog__two-by-two__heading {
  margin-bottom: 1rem;
}

.blog__two-by-two__body {
  margin-bottom: 1.5rem;
}

.blog__two-by-two__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.875rem;
}

.blog__two-by-two__item {
  margin: 0;
}

.blog__two-by-two__image {
  width: 100%;
  height: auto;
  display: block;
}

.blog__two-by-two__label {
  display: block;
  margin-top: 0.5rem;
  text-align: center;
}

.blog__two-by-two__item .blog__two-by-two__cta-btn {
  margin-top: 0.5rem;
}

.blog__two-by-two__cta {
  text-align: center;
  margin-top: 1.875rem;
}


@media screen and (max-width: 767px) {
  .blog__two-by-two__grid {
    grid-template-columns: 1fr;
  }
}

/* ----------------------------------------
   3 x 2 SECTION
   ---------------------------------------- */
.blog__three-by-two {
  margin-bottom: 2.5rem;
}

.blog__three-by-two__heading {
  margin-bottom: 1rem;
}

.blog__three-by-two__body {
  margin-bottom: 1.5rem;
}

.blog__three-by-two__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.875rem;
}

.blog__three-by-two__item {
  margin: 0;
  text-align: left;
}

.blog__three-by-two__image {
  width: 100%;
  height: auto;
  display: block;
}

.blog__three-by-two__label {
  display: block;
  margin-top: 0.5rem;
  text-align: center;
}

.blog__three-by-two__item .blog__three-by-two__cta-btn {
  margin-top: 0.5rem;
}

.blog__three-by-two__cta {
  text-align: center;
  margin-top: 1.875rem;
}



@media screen and (max-width: 767px) {
  .blog__three-by-two__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 479px) {
  .blog__three-by-two__grid {
    grid-template-columns: 1fr;
  }
}

/* ----------------------------------------
   RICH TEXT SECTION
   ---------------------------------------- */
.blog__rich-text {
  margin-bottom: 2.5rem;
}

.blog__rich-text__heading {
  margin-bottom: 1rem;
}

.blog__rich-text__body {
  /* Inherits shared rich text styles */
}

/* ----------------------------------------
   TABLE SECTION
   ---------------------------------------- */
.blog__table {
  margin-bottom: 2.5rem;
}

.blog__table__heading {
  margin-bottom: 1rem;
}

.blog__table__body {
  margin-bottom: 1.5rem;
}

.blog__table__wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.blog__table__wrapper table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  margin-bottom: 1rem;
}

.blog__table__wrapper th,
.blog__table__wrapper td {
  border: 0.0625rem solid var(--color-grey-2);
  padding: 0.4375rem 0.1875rem;
}

.blog__table__wrapper th {
  background-color: #F9EEF3;
  color: var(--color-black);
}

.blog__table__wrapper tbody {
  background-color: var(--color-white);
}

@media screen and (min-width: 768px) {
  .blog__table__wrapper th,
  .blog__table__wrapper td {
    padding: 0.5rem 0.625rem 0.625rem;
  }
}

/* ----------------------------------------
   DIVIDER (HR)
   ---------------------------------------- */
.blog__divider {
  border: none;
  height: 0.0625rem;
  margin: 3.75rem 0;
}

/* ----------------------------------------
   AUTHOR BYLINE SECTION
   ---------------------------------------- */
.blog__author-byline {
  margin-bottom: 2.5rem;
}

.blog__author-byline__text {
  font-size: var(--body-xs);
  margin: 0;
}

.blog__author-byline__prefix {
  color: var(--color-grey-6);
}

.blog__author-byline__title {
  font-size: var(--body-xs);
  margin: 0;
  color: var(--color-grey-6);
}

/* ----------------------------------------
   HOTSPOT SECTION
   ---------------------------------------- */
.blog__hotspot {
  width: 100%;
  max-width: 62.5rem;
  margin: 0 auto 2.5rem;
  display: block;
}

.blog__hotspot__inner {
  position: relative;
  margin: 0;
  padding: 0;
  line-height: 0;
  width: fit-content;
}

.blog__hotspot__image {
  display: block;
  width: 100%;
  height: auto;
}

.blog__hotspot__item {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 10;
  text-decoration: none;
  border: none;
}

.blog__hotspot__marker {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.875rem;
  height: 1.875rem;
  background-color: var(--color-white);
  color: var(--color-black);
  border-radius: 50%;
  font-family: sans-serif;
  font-size: var(--body-md);
  box-shadow: 0 0.125rem 0.3125rem rgb(from var(--color-black) r g b / 0.3);
  transition: transform 0.2s ease;
  animation: blog-pulse 2s infinite;
}

.blog__hotspot__item:hover .blog__hotspot__marker {
  transform: scale(1.1);
}

.blog__hotspot__label {
  position: absolute;
  bottom: 2.5rem;
  left: 50%;
  transform: translateX(-50%) translateY(0.625rem);
  background: var(--color-white);
  color: var(--color-grey-hover);
  padding: 0.5rem 0.75rem;
  border-radius: 0.25rem;
  font-size: var(--body-sm);
  text-transform: uppercase;
  white-space: nowrap;
  box-shadow: 0 0.25rem 0.75rem rgb(from var(--color-black) r g b / 0.15);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  pointer-events: none;
}

.blog__hotspot__label::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -0.3125rem;
  border-width: 0.3125rem;
  border-style: solid;
  border-color: var(--color-white) transparent transparent transparent;
}

.blog__hotspot__item:hover .blog__hotspot__label {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

@keyframes blog-pulse {
  0% {
    box-shadow: 0 0 0 0 rgb(from var(--color-white) r g b / 0.7);
  }
  70% {
    box-shadow: 0 0 0 0.625rem rgb(from var(--color-white) r g b / 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgb(from var(--color-white) r g b / 0);
  }
}`
