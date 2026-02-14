import { tokens as t } from './designTokens'

export const BLOG_CSS = `/* ============================================
   FASHIONPHILE BLOG SECTIONS - COMPLETE CSS
   ============================================ */

/* ----------------------------------------
   SHARED RICH TEXT STYLES
   These apply to all __body elements
   ---------------------------------------- */
[class*="__body"] {
  line-height: ${t.lineHeightLg};
}

[class*="__body"] p {
  margin-bottom: 1em;
}

[class*="__body"] p:last-child {
  margin-bottom: 0;
}

[class*="__body"] a {
  color: inherit;
  text-decoration: underline;
}

[class*="__body"] a:hover {
  opacity: 0.8;
}

[class*="__body"] strong,
[class*="__body"] b {
  font-weight: ${t.fontWeightSemibold};
}

[class*="__body"] em,
[class*="__body"] i {
  font-style: italic;
}

[class*="__body"] h1 {
  font-size: ${t.h1};
  font-weight: ${t.fontWeightSemibold};
  margin-top: 1.5em;
  margin-bottom: 0.75em;
}

[class*="__body"] h2 {
  font-size: ${t.h2};
  font-weight: ${t.fontWeightSemibold};
  margin-top: 1.5em;
  margin-bottom: 0.75em;
}

[class*="__body"] h3 {
  font-size: ${t.h3};
  font-weight: ${t.fontWeightSemibold};
  margin-top: 1.5em;
  margin-bottom: 0.75em;
}

[class*="__body"] h4 {
  font-size: ${t.h4};
  font-weight: ${t.fontWeightSemibold};
  margin-top: 1.25em;
  margin-bottom: 0.5em;
}

[class*="__body"] h5 {
  font-size: ${t.h5};
  font-weight: ${t.fontWeightSemibold};
  margin-top: 1em;
  margin-bottom: 0.5em;
}

[class*="__body"] h6 {
  font-size: ${t.h6};
  font-weight: ${t.fontWeightSemibold};
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
  margin: 1em 0;
  padding-left: 1em;
  border-left: 0.1875rem solid ${t.colorGrey3};
  font-style: italic;
  color: ${t.colorGrey7};
}

[class*="__body"] hr {
  border: none;
  border-top: 0.0625rem solid ${t.colorGrey2};
  margin: 1.5em 0;
}

.fp-font-weight--light {
  font-weight: ${t.fontWeightLight}
}

.fp-font-weight--regular {
  font-weight: ${t.fontWeightRegular}
}

.fp-font-weight--medium {
  font-weight: ${t.fontWeightMedium}
}

.fp-font-weight--semibold {
  font-weight: ${t.fontWeightSemibold}
}

.fp-font-weight--bold {
  font-weight: ${t.fontWeightBold}
}

/* ----------------------------------------
   HEADING SIZES BY TAG
   The HTML tag determines the font-size,
   regardless of which block it belongs to.
   ---------------------------------------- */
h1[class*="__heading"] { font-size: ${t.h1}; }
h2[class*="__heading"] { font-size: ${t.h2}; }
h3[class*="__heading"] { font-size: ${t.h3}; }
h4[class*="__heading"] { font-size: ${t.h4}; }
h5[class*="__heading"] { font-size: ${t.h5}; }
h6[class*="__heading"] { font-size: ${t.h6}; }

/* ----------------------------------------
   FULL WIDTH SECTION
   ---------------------------------------- */
.blog__full-width {
  margin-bottom: 2rem;
}

.blog__full-width__heading {
  font-size: ${t.h4};
  margin-bottom: ${t.h6};
}

.blog__full-width__body {
  margin-bottom: ${t.h4};
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

/* ----------------------------------------
   1-UP SECTION
   ---------------------------------------- */
.blog__one-up {
  margin-bottom: 2rem;
}

.blog__one-up__heading {
  font-size: ${t.h4};
  margin-bottom: ${t.h6};
}

.blog__one-up__body {
  margin-bottom: ${t.h4};
}

.blog__one-up__figure {
  margin: 0 auto;
  text-align: center;
  max-width: 50%;
}

.blog__one-up__image {
  width: 100%;
  height: auto;
  display: block;
}

@media (max-width: 767px) {
  .blog__one-up__figure {
    max-width: 100%;
  }
}

.blog__one-up__label {
  display: block;
  margin-top: 0.5rem;
  font-size: ${t.bodyLg};
  text-align: center;
}

.blog__one-up__cta-btn {
  display: block;
  width: 100%;
  background-color: ${t.colorBlack};
  color: ${t.colorWhite} !important;
  text-align: center;
  padding: ${t.headerFontBody};
  text-transform: uppercase;
  text-decoration: none;
  letter-spacing: 0.0625rem;
  transition: background-color 0.3s ease;
  margin-top: 0.5rem;
}

.blog__one-up__cta-btn:hover {
  background-color: ${t.colorGrey8};
}

/* ----------------------------------------
   2-UP SECTION
   ---------------------------------------- */
.blog__two-up {
  margin-bottom: 2rem;
}

.blog__two-up__heading {
  font-size: ${t.h4};
  margin-bottom: ${t.h6};
}

.blog__two-up__body {
  margin-bottom: ${t.h4};
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
  font-size: ${t.bodyLg};
  text-align: center;
}

.blog__two-up__item .blog__two-up__cta-btn {
  margin-top: 0.5rem;
}

.blog__two-up__cta {
  text-align: center;
  margin-top: 1.875rem;
}

.blog__two-up__cta-btn {
  display: block;
  width: 100%;
  background-color: ${t.colorBlack};
  color: ${t.colorWhite} !important;
  text-align: center;
  padding: ${t.headerFontBody};
  text-transform: uppercase;
  text-decoration: none;
  letter-spacing: 0.0625rem;
  transition: background-color 0.3s ease;
}

.blog__two-up__cta-btn:hover {
  background-color: ${t.colorGrey8};
}

@media (max-width: 767px) {
  .blog__two-up__grid {
    flex-direction: column;
  }
}

/* ----------------------------------------
   3-UP SECTION
   ---------------------------------------- */
.blog__three-up {
  margin-bottom: 2rem;
}

.blog__three-up__heading {
  font-size: ${t.h4};
  margin-bottom: ${t.h6};
}

.blog__three-up__body {
  margin-bottom: ${t.h4};
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
  font-size: ${t.bodyLg};
  text-align: center;
}

.blog__three-up__item .blog__three-up__cta-btn {
  margin-top: 0.5rem;
}

.blog__three-up__cta {
  text-align: center;
  margin-top: 1.875rem;
}

.blog__three-up__cta-btn {
  display: block;
  width: 100%;
  background-color: ${t.colorBlack};
  color: ${t.colorWhite} !important;
  text-align: center;
  padding: ${t.headerFontBody};
  text-transform: uppercase;
  text-decoration: none;
  letter-spacing: 0.0625rem;
  transition: background-color 0.3s ease;
}

.blog__three-up__cta-btn:hover {
  background-color: ${t.colorGrey8};
}

@media (max-width: 767px) {
  .blog__three-up__grid {
    flex-direction: column;
  }
}

/* ----------------------------------------
   VIDEO SECTION
   ---------------------------------------- */
.blog__video {
  margin-bottom: 2rem;
}

.blog__video__heading {
  font-size: ${t.h4};
  margin-bottom: ${t.h6};
}

.blog__video__body {
  margin-bottom: ${t.h4};
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
  margin-bottom: 2rem;
}

.blog__two-by-two__heading {
  font-size: ${t.h4};
  margin-bottom: ${t.h6};
}

.blog__two-by-two__body {
  margin-bottom: ${t.h4};
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
  font-size: ${t.bodyLg};
  text-align: center;
}

.blog__two-by-two__item .blog__two-by-two__cta-btn {
  margin-top: 0.5rem;
}

.blog__two-by-two__cta {
  text-align: center;
  margin-top: 1.875rem;
}

.blog__two-by-two__cta-btn {
  display: block;
  width: 100%;
  background-color: ${t.colorBlack};
  color: ${t.colorWhite} !important;
  text-align: center;
  padding: ${t.headerFontBody};
  text-transform: uppercase;
  text-decoration: none;
  letter-spacing: 0.0625rem;
  transition: background-color 0.3s ease;
}

.blog__two-by-two__cta-btn:hover {
  background-color: ${t.colorGrey8};
}

@media (max-width: 767px) {
  .blog__two-by-two__grid {
    grid-template-columns: 1fr;
  }
}

/* ----------------------------------------
   3 x 2 SECTION
   ---------------------------------------- */
.blog__three-by-two {
  margin-bottom: 2rem;
}

.blog__three-by-two__heading {
  font-size: ${t.h4};
  margin-bottom: ${t.h6};
}

.blog__three-by-two__body {
  margin-bottom: ${t.h4};
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
  font-size: ${t.bodyMd};
  text-align: center;
}

.blog__three-by-two__item .blog__three-by-two__cta-btn {
  margin-top: 0.5rem;
}

.blog__three-by-two__cta {
  text-align: center;
  margin-top: 1.875rem;
}

.blog__three-by-two__cta-btn {
  display: block;
  width: 100%;
  background-color: ${t.colorBlack};
  color: ${t.colorWhite} !important;
  text-align: center;
  padding: ${t.headerFontBody};
  text-transform: uppercase;
  text-decoration: none;
  letter-spacing: 0.0625rem;
  transition: background-color 0.3s ease;
}

.blog__three-by-two__cta-btn:hover {
  background-color: ${t.colorGrey8};
}

@media (max-width: 767px) {
  .blog__three-by-two__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 479px) {
  .blog__three-by-two__grid {
    grid-template-columns: 1fr;
  }
}

/* ----------------------------------------
   RICH TEXT SECTION
   ---------------------------------------- */
.blog__rich-text {
  margin-bottom: 2rem;
}

.blog__rich-text__heading {
  font-size: ${t.h4};
  margin-bottom: ${t.h6};
}

.blog__rich-text__body {
  /* Inherits shared rich text styles */
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
  margin-bottom: 2rem;
}

.blog__author-byline__text {
  font-size: ${t.bodyXs};
  line-height: ${t.lineHeightLg};
  margin: 0;
}

.blog__author-byline__prefix {
  color: ${t.colorGrey6};
}

.blog__author-byline__title {
  font-size: ${t.bodyXs};
  line-height: ${t.lineHeightLg};
  margin: 0;
  color: ${t.colorGrey6};
}

/* ----------------------------------------
   HOTSPOT SECTION
   ---------------------------------------- */
.blog__hotspot {
  width: 100%;
  max-width: 62.5rem;
  margin: 0 auto 1.875rem;
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
  background-color: ${t.colorWhite};
  color: ${t.colorBlack};
  border-radius: 50%;
  font-family: sans-serif;
  font-size: ${t.bodyMd};
  box-shadow: 0 0.125rem 0.3125rem rgba(0,0,0,0.3);
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
  background: ${t.colorWhite};
  color: ${t.colorGrey8};
  padding: 0.5rem 0.75rem;
  border-radius: 0.25rem;
  font-size: ${t.bodySm};
  text-transform: uppercase;
  white-space: nowrap;
  box-shadow: 0 0.25rem 0.75rem rgba(0,0,0,0.15);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  pointer-events: none;
}

.blog__hotspot__label::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -0.3125rem;
  border-width: 0.3125rem;
  border-style: solid;
  border-color: ${t.colorWhite} transparent transparent transparent;
}

.blog__hotspot__item:hover .blog__hotspot__label {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

@keyframes blog-pulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
  70% { box-shadow: 0 0 0 0.625rem rgba(255, 255, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
}`
