export const BLOG_CSS = `/* ============================================
   FASHIONPHILE BLOG SECTIONS - COMPLETE CSS
   ============================================ */

/* ----------------------------------------
   SHARED RICH TEXT STYLES
   These apply to all __body elements
   ---------------------------------------- */
[class*="__body"] {
  line-height: 1.6;
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
  font-weight: 600;
}

[class*="__body"] em,
[class*="__body"] i {
  font-style: italic;
}

[class*="__body"] h3 {
  font-size: 20px;
  font-weight: 600;
  margin-top: 1.5em;
  margin-bottom: 0.75em;
}

[class*="__body"] h4 {
  font-size: 18px;
  font-weight: 600;
  margin-top: 1.25em;
  margin-bottom: 0.5em;
}

[class*="__body"] h5 {
  font-size: 16px;
  font-weight: 600;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

[class*="__body"] h6 {
  font-size: 14px;
  font-weight: 600;
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
  border-left: 3px solid #d4d4d4;
  font-style: italic;
  color: #525252;
}

[class*="__body"] hr {
  border: none;
  border-top: 1px solid #e5e5e5;
  margin: 1.5em 0;
}

/* ----------------------------------------
   FULL WIDTH SECTION
   ---------------------------------------- */
.blog__full-width {
  margin-bottom: 60px;
}

.blog__full-width__heading {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
}

.blog__full-width__body {
  margin-bottom: 24px;
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
  margin-bottom: 60px;
}

.blog__one-up__heading {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
}

.blog__one-up__body {
  margin-bottom: 24px;
}

.blog__one-up__figure {
  margin: 0;
  text-align: center;
}

.blog__one-up__image {
  max-width: 50%;
  height: auto;
  display: block;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .blog__one-up__image {
    max-width: 100%;
  }
}

.blog__one-up__label {
  display: block;
  margin-top: 16px;
  font-size: 16px;
  text-align: center;
}

/* ----------------------------------------
   2-UP SECTION
   ---------------------------------------- */
.blog__two-up {
  margin-bottom: 60px;
}

.blog__two-up__heading {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
}

.blog__two-up__body {
  margin-bottom: 24px;
}

.blog__two-up__grid {
  display: flex;
  gap: 30px;
}

.blog__two-up__item {
  flex: 1;
  margin: 0;
  text-align: left;
}

.blog__two-up__image {
  width: 100%;
  max-width: 600px;
  height: auto;
  display: block;
}

.blog__two-up__label {
  display: block;
  margin-top: 16px;
  font-size: 16px;
}

.blog__two-up__cta {
  text-align: center;
  margin-top: 30px;
}

.blog__two-up__cta-btn {
  display: block;
  width: 100%;
  background-color: #1a1a1a;
  color: #ffffff;
  text-align: center;
  padding: 15px;
  text-transform: uppercase;
  text-decoration: none;
  font-weight: 600;
  letter-spacing: 1px;
  transition: background-color 0.3s ease;
}

.blog__two-up__cta-btn:hover {
  background-color: #333333;
}

@media (max-width: 768px) {
  .blog__two-up__grid {
    flex-direction: column;
  }
}

/* ----------------------------------------
   3-UP SECTION
   ---------------------------------------- */
.blog__three-up {
  margin-bottom: 60px;
}

.blog__three-up__heading {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
}

.blog__three-up__body {
  margin-bottom: 24px;
}

.blog__three-up__grid {
  display: flex;
  gap: 30px;
}

.blog__three-up__item {
  flex: 1;
  margin: 0;
  text-align: left;
}

.blog__three-up__image {
  width: 100%;
  max-width: 400px;
  height: auto;
  display: block;
}

.blog__three-up__label {
  display: block;
  margin-top: 16px;
  font-size: 16px;
}

.blog__three-up__cta {
  text-align: center;
  margin-top: 30px;
}

.blog__three-up__cta-btn {
  display: block;
  width: 100%;
  background-color: #1a1a1a;
  color: #ffffff;
  text-align: center;
  padding: 15px;
  text-transform: uppercase;
  text-decoration: none;
  font-weight: 600;
  letter-spacing: 1px;
  transition: background-color 0.3s ease;
}

.blog__three-up__cta-btn:hover {
  background-color: #333333;
}

@media (max-width: 768px) {
  .blog__three-up__grid {
    flex-direction: column;
  }
}

/* ----------------------------------------
   VIDEO SECTION
   ---------------------------------------- */
.blog__video {
  margin-bottom: 60px;
}

.blog__video__heading {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
}

.blog__video__body {
  margin-bottom: 24px;
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
   3 x 2 SECTION
   ---------------------------------------- */
.blog__three-by-two {
  margin-bottom: 60px;
}

.blog__three-by-two__heading {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
}

.blog__three-by-two__body {
  margin-bottom: 24px;
}

.blog__three-by-two__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
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
  margin-top: 12px;
  font-size: 14px;
}

.blog__three-by-two__cta {
  text-align: center;
  margin-top: 30px;
}

.blog__three-by-two__cta-btn {
  display: block;
  width: 100%;
  background-color: #1a1a1a;
  color: #ffffff;
  text-align: center;
  padding: 15px;
  text-transform: uppercase;
  text-decoration: none;
  font-weight: 600;
  letter-spacing: 1px;
  transition: background-color 0.3s ease;
}

.blog__three-by-two__cta-btn:hover {
  background-color: #333333;
}

@media (max-width: 768px) {
  .blog__three-by-two__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .blog__three-by-two__grid {
    grid-template-columns: 1fr;
  }
}

/* ----------------------------------------
   RICH TEXT SECTION
   ---------------------------------------- */
.blog__rich-text {
  margin-bottom: 60px;
}

.blog__rich-text__heading {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
}

.blog__rich-text__body {
  /* Inherits shared rich text styles */
}

/* ----------------------------------------
   HOTSPOT SECTION
   ---------------------------------------- */
.blog__hotspot {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto 30px;
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
  width: 30px;
  height: 30px;
  background-color: #fff;
  color: #000;
  border-radius: 50%;
  font-weight: bold;
  font-family: sans-serif;
  font-size: 14px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
  transition: transform 0.2s ease;
  animation: blog-pulse 2s infinite;
}

.blog__hotspot__item:hover .blog__hotspot__marker {
  transform: scale(1.1);
}

.blog__hotspot__label {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  background: #fff;
  color: #333;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #fff transparent transparent transparent;
}

.blog__hotspot__item:hover .blog__hotspot__label {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

@keyframes blog-pulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
}`
