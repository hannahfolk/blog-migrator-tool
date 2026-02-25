import { PLACEHOLDER_IMG } from '../utils/placeholderImage'
import { BLOG_CSS } from './blogCss'
import { tokens as t } from './designTokens'

export const PREVIEW_HTML = {
  fullWidth: `<div class="blog__full-width">
  <h2 class="blog__full-width__heading">Lorem Ipsum Dolor Sit Amet</h2>
  <div class="blog__full-width__body">
    <p>Lorem ipsum dolor sit amet, <strong>consectetur adipiscing elit</strong>. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    <p>Ut enim ad minim veniam, quis nostrud <em>exercitation ullamco</em> laboris nisi ut aliquip ex ea commodo <a href="#" target="_blank" rel="noopener noreferrer">consequat link</a>.</p>
  </div>
  <figure class="blog__full-width__figure">
    <img class="blog__full-width__image" src="${PLACEHOLDER_IMG(1200, 500, 'Full Width Image')}" alt="Placeholder image">
  </figure>
</div>`,

  oneUp: `<div class="blog__one-up">
  <h2 class="blog__one-up__heading">Consectetur Adipiscing Elit</h2>
  <div class="blog__one-up__body">
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt:</p>
    <ul>
      <li>Ut labore et dolore magna aliqua</li>
      <li>Enim ad minim veniam quis nostrud</li>
      <li>Exercitation ullamco laboris nisi</li>
    </ul>
    <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.</p>
  </div>
  <figure class="blog__one-up__figure">
    <img class="blog__one-up__image" src="${PLACEHOLDER_IMG(600, 400, '600×400')}" alt="Placeholder image">
    <figcaption class="blog__one-up__label">Image Label Goes Here</figcaption>
    <a class="blog__one-up__cta-btn fp-font-weight--semibold" href="#">Call to Action Button</a>
  </figure>
</div>`,

  twoUp: `<div class="blog__two-up">
  <h2 class="blog__two-up__heading">Sed Do Eiusmod Tempor</h2>
  <div class="blog__two-up__body">
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    <h3>Incididunt Ut Labore</h3>
    <p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</p>
  </div>
  <div class="blog__two-up__grid">
    <figure class="blog__two-up__item">
      <img class="blog__two-up__image" src="${PLACEHOLDER_IMG(500, 400, '500×400')}" alt="Placeholder image 1">
      <figcaption class="blog__two-up__label">First Image Label</figcaption>
    </figure>
    <figure class="blog__two-up__item">
      <img class="blog__two-up__image" src="${PLACEHOLDER_IMG(500, 400, '500×400')}" alt="Placeholder image 2">
      <figcaption class="blog__two-up__label">Second Image Label</figcaption>
    </figure>
  </div>
  <div class="blog__two-up__cta">
    <a class="blog__two-up__cta-btn" href="#">Call to Action Button</a>
  </div>
</div>`,

  threeUp: `<div class="blog__three-up">
  <h2 class="blog__three-up__heading">Ut Labore Et Dolore Magna</h2>
  <div class="blog__three-up__body">
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit:</p>
    <ol>
      <li>Sed do eiusmod tempor incididunt</li>
      <li>Ut labore et dolore magna aliqua</li>
      <li>Ut enim ad minim veniam quis</li>
    </ol>
  </div>
  <div class="blog__three-up__grid">
    <figure class="blog__three-up__item">
      <img class="blog__three-up__image" src="${PLACEHOLDER_IMG(350, 300, '350×300')}" alt="Placeholder image 1">
      <figcaption class="blog__three-up__label">First Label</figcaption>
    </figure>
    <figure class="blog__three-up__item">
      <img class="blog__three-up__image" src="${PLACEHOLDER_IMG(350, 300, '350×300')}" alt="Placeholder image 2">
      <figcaption class="blog__three-up__label">Second Label</figcaption>
    </figure>
    <figure class="blog__three-up__item">
      <img class="blog__three-up__image" src="${PLACEHOLDER_IMG(350, 300, '350×300')}" alt="Placeholder image 3">
      <figcaption class="blog__three-up__label">Third Label</figcaption>
    </figure>
  </div>
  <div class="blog__three-up__cta">
    <a class="blog__three-up__cta-btn" href="#">Call to Action Button</a>
  </div>
</div>`,

  video: `<div class="blog__video">
  <h2 class="blog__video__heading">Quis Nostrud Exercitation</h2>
  <div class="blog__video__body">
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    <blockquote>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</blockquote>
    <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.</p>
  </div>
  <div class="blog__video__wrapper">
    <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:#e5e5e5;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" stroke-width="1.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      <span style="color:#a3a3a3;font-size:14px;">Video Embed Placeholder</span>
    </div>
  </div>
</div>`,

  fourUp: `<div class="blog__four-up">
  <h2 class="blog__four-up__heading">Amet Consectetur Adipiscing</h2>
  <div class="blog__four-up__body">
    <p>Lorem ipsum dolor sit amet, <strong>consectetur adipiscing</strong> elit. Sed do eiusmod tempor incididunt.</p>
  </div>
  <div class="blog__four-up__grid">
    <figure class="blog__four-up__item">
      <img class="blog__four-up__image" src="${PLACEHOLDER_IMG(250, 200, '250×200')}" alt="Placeholder 1">
      <figcaption class="blog__four-up__label">Label One</figcaption>
    </figure>
    <figure class="blog__four-up__item">
      <img class="blog__four-up__image" src="${PLACEHOLDER_IMG(250, 200, '250×200')}" alt="Placeholder 2">
      <figcaption class="blog__four-up__label">Label Two</figcaption>
    </figure>
    <figure class="blog__four-up__item">
      <img class="blog__four-up__image" src="${PLACEHOLDER_IMG(250, 200, '250×200')}" alt="Placeholder 3">
      <figcaption class="blog__four-up__label">Label Three</figcaption>
    </figure>
    <figure class="blog__four-up__item">
      <img class="blog__four-up__image" src="${PLACEHOLDER_IMG(250, 200, '250×200')}" alt="Placeholder 4">
      <figcaption class="blog__four-up__label">Label Four</figcaption>
    </figure>
  </div>
  <div class="blog__four-up__cta">
    <a class="blog__four-up__cta-btn" href="#">Call to Action Button</a>
  </div>
</div>`,

  fiveUp: `<div class="blog__five-up">
  <h2 class="blog__five-up__heading">Amet Consectetur Adipiscing</h2>
  <div class="blog__five-up__body">
    <p>Lorem ipsum dolor sit amet, <strong>consectetur adipiscing</strong> elit. Sed do eiusmod tempor incididunt.</p>
  </div>
  <div class="blog__five-up__grid">
    <figure class="blog__five-up__item">
      <img class="blog__five-up__image" src="${PLACEHOLDER_IMG(200, 160, '200×160')}" alt="Placeholder 1">
      <figcaption class="blog__five-up__label">Label One</figcaption>
    </figure>
    <figure class="blog__five-up__item">
      <img class="blog__five-up__image" src="${PLACEHOLDER_IMG(200, 160, '200×160')}" alt="Placeholder 2">
      <figcaption class="blog__five-up__label">Label Two</figcaption>
    </figure>
    <figure class="blog__five-up__item">
      <img class="blog__five-up__image" src="${PLACEHOLDER_IMG(200, 160, '200×160')}" alt="Placeholder 3">
      <figcaption class="blog__five-up__label">Label Three</figcaption>
    </figure>
    <figure class="blog__five-up__item">
      <img class="blog__five-up__image" src="${PLACEHOLDER_IMG(200, 160, '200×160')}" alt="Placeholder 4">
      <figcaption class="blog__five-up__label">Label Four</figcaption>
    </figure>
    <figure class="blog__five-up__item">
      <img class="blog__five-up__image" src="${PLACEHOLDER_IMG(200, 160, '200×160')}" alt="Placeholder 5">
      <figcaption class="blog__five-up__label">Label Five</figcaption>
    </figure>
  </div>
  <div class="blog__five-up__cta">
    <a class="blog__five-up__cta-btn" href="#">Call to Action Button</a>
  </div>
</div>`,

  twoByTwo: `<div class="blog__two-by-two">
  <h2 class="blog__two-by-two__heading">Amet Consectetur Adipiscing</h2>
  <div class="blog__two-by-two__body">
    <p>Lorem ipsum dolor sit amet, <strong>consectetur adipiscing</strong> elit. Sed do eiusmod tempor incididunt.</p>
  </div>
  <div class="blog__two-by-two__grid">
    <figure class="blog__two-by-two__item">
      <img class="blog__two-by-two__image" src="${PLACEHOLDER_IMG(400, 300, '400×300')}" alt="Placeholder 1">
      <figcaption class="blog__two-by-two__label">Label One</figcaption>
    </figure>
    <figure class="blog__two-by-two__item">
      <img class="blog__two-by-two__image" src="${PLACEHOLDER_IMG(400, 300, '400×300')}" alt="Placeholder 2">
      <figcaption class="blog__two-by-two__label">Label Two</figcaption>
    </figure>
    <figure class="blog__two-by-two__item">
      <img class="blog__two-by-two__image" src="${PLACEHOLDER_IMG(400, 300, '400×300')}" alt="Placeholder 3">
      <figcaption class="blog__two-by-two__label">Label Three</figcaption>
    </figure>
    <figure class="blog__two-by-two__item">
      <img class="blog__two-by-two__image" src="${PLACEHOLDER_IMG(400, 300, '400×300')}" alt="Placeholder 4">
      <figcaption class="blog__two-by-two__label">Label Four</figcaption>
    </figure>
  </div>
  <div class="blog__two-by-two__cta">
    <a class="blog__two-by-two__cta-btn" href="#">Call to Action Button</a>
  </div>
</div>`,

  threeByTwo: `<div class="blog__three-by-two">
  <h2 class="blog__three-by-two__heading">Duis Aute Irure Dolor</h2>
  <div class="blog__three-by-two__body">
    <p>Lorem ipsum dolor sit amet, <strong>consectetur adipiscing</strong> elit. Sed do eiusmod <a href="#" target="_blank" rel="noopener noreferrer">tempor incididunt</a> ut labore.</p>
  </div>
  <div class="blog__three-by-two__grid">
    <figure class="blog__three-by-two__item">
      <img class="blog__three-by-two__image" src="${PLACEHOLDER_IMG(280, 220, '280×220')}" alt="Placeholder 1">
      <figcaption class="blog__three-by-two__label">Label One</figcaption>
    </figure>
    <figure class="blog__three-by-two__item">
      <img class="blog__three-by-two__image" src="${PLACEHOLDER_IMG(280, 220, '280×220')}" alt="Placeholder 2">
      <figcaption class="blog__three-by-two__label">Label Two</figcaption>
    </figure>
    <figure class="blog__three-by-two__item">
      <img class="blog__three-by-two__image" src="${PLACEHOLDER_IMG(280, 220, '280×220')}" alt="Placeholder 3">
      <figcaption class="blog__three-by-two__label">Label Three</figcaption>
    </figure>
    <figure class="blog__three-by-two__item">
      <img class="blog__three-by-two__image" src="${PLACEHOLDER_IMG(280, 220, '280×220')}" alt="Placeholder 4">
      <figcaption class="blog__three-by-two__label">Label Four</figcaption>
    </figure>
    <figure class="blog__three-by-two__item">
      <img class="blog__three-by-two__image" src="${PLACEHOLDER_IMG(280, 220, '280×220')}" alt="Placeholder 5">
      <figcaption class="blog__three-by-two__label">Label Five</figcaption>
    </figure>
    <figure class="blog__three-by-two__item">
      <img class="blog__three-by-two__image" src="${PLACEHOLDER_IMG(280, 220, '280×220')}" alt="Placeholder 6">
      <figcaption class="blog__three-by-two__label">Label Six</figcaption>
    </figure>
  </div>
  <div class="blog__three-by-two__cta">
    <a class="blog__three-by-two__cta-btn" href="#">Call to Action Button</a>
  </div>
</div>`,

  hotspot: `<div class="blog__hotspot blog__hotspot--3-links">
  <figure class="blog__hotspot__inner">
    <img src="${PLACEHOLDER_IMG(800, 500, 'Hotspot Image')}" alt="Hotspot placeholder" class="blog__hotspot__image">
    <a class="blog__hotspot__item" href="#" style="left: 25%; top: 40%;">
      <span class="blog__hotspot__marker">1</span>
      <span class="blog__hotspot__label">First Item</span>
    </a>
    <a class="blog__hotspot__item" href="#" style="left: 55%; top: 55%;">
      <span class="blog__hotspot__marker">2</span>
      <span class="blog__hotspot__label">Second Item</span>
    </a>
    <a class="blog__hotspot__item" href="#" style="left: 78%; top: 30%;">
      <span class="blog__hotspot__marker">3</span>
      <span class="blog__hotspot__label">Third Item</span>
    </a>
  </figure>
</div>`,

  authorByline: `<div class="blog__author-byline">
  <p class="blog__author-byline__text"><span class="blog__author-byline__prefix">By: </span>Jane Doe</p>
  <p class="blog__author-byline__title">Staff Writer, FASHIONPHILE</p>
</div>`,

  richText: `<div class="blog__rich-text">
  <h2 class="blog__rich-text__heading">Excepteur Sint Occaecat</h2>
  <div class="blog__rich-text__body">
    <p>Lorem ipsum dolor sit amet, <strong>consectetur adipiscing elit</strong>. Sed do eiusmod tempor incididunt ut labore et dolore <em>magna aliqua</em>. Ut enim ad minim veniam, quis nostrud <a href="#" target="_blank" rel="noopener noreferrer">exercitation link</a>.</p>

    <h3>Duis Aute Irure</h3>
    <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>

    <h4>Excepteur Sint</h4>
    <p>Excepteur sint occaecat cupidatat non proident:</p>

    <ul>
      <li>Sunt in culpa qui officia deserunt</li>
      <li>Mollit anim id est laborum</li>
      <li>Sed ut perspiciatis unde omnis</li>
    </ul>

    <p>Nemo enim ipsam voluptatem quia voluptas:</p>

    <ol>
      <li>Sit aspernatur aut odit aut fugit</li>
      <li>Sed quia consequuntur magni dolores</li>
      <li>Eos qui ratione voluptatem sequi</li>
    </ol>

    <blockquote>Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.</blockquote>

    <p>Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.</p>
  </div>
</div>`,
}

export const PREVIEW_CSS = `<style>${BLOG_CSS}</style>`

// Bare-minimum CSS for the raw input HTML preview in the Migrator.
// Matches heading sizes, font weights, and body styles from the output CSS
// so users can easily spot formatting when drawing selection boxes.
// Internal only — not meant for download or copying.
export const INPUT_PREVIEW_CSS = `<style>
h1 { font-size: ${t.h1}; font-weight: ${t.fontWeightSemibold}; line-height: ${t.lineHeightMd}; margin: 0.75em 0; }
h2 { font-size: ${t.h2}; font-weight: ${t.fontWeightSemibold}; line-height: ${t.lineHeightMd}; margin: 0.75em 0; }
h3 { font-size: ${t.h3}; font-weight: ${t.fontWeightSemibold}; line-height: ${t.lineHeightMd}; margin: 0.75em 0; }
h4 { font-size: ${t.h4}; font-weight: ${t.fontWeightSemibold}; line-height: ${t.lineHeightMd}; margin: 0.75em 0; }
h5 { font-size: ${t.h5}; font-weight: ${t.fontWeightSemibold}; line-height: ${t.lineHeightMd}; margin: 0.75em 0; }
h6 { font-size: ${t.h6}; font-weight: ${t.fontWeightSemibold}; line-height: ${t.lineHeightMd}; margin: 0.75em 0; }
p { line-height: ${t.lineHeightLg}; margin-bottom: 1em; }
p:last-child { margin-bottom: 0; }
strong, b { font-weight: ${t.fontWeightSemibold}; }
em, i { font-style: italic; }
a { color: inherit; text-decoration: underline; }
ul, ol { margin-bottom: 1em; padding-left: 1.5em; }
ul { list-style-type: disc; }
ol { list-style-type: decimal; }
li { margin-bottom: 0.5em; line-height: ${t.lineHeightLg}; }
blockquote { margin: 1em 0; padding-left: 1em; border-left: 0.1875rem solid ${t.colorGrey3}; font-style: italic; color: ${t.colorGrey7}; }
hr { border: none; border-top: 0.0625rem solid ${t.colorGrey2}; margin: 1.5em 0; }
img { max-width: 100%; height: auto; }
.row.wpb_row.row-fluid { margin-bottom: 2rem; }
a.btn { display: inline-block; background-color: ${t.colorBlack}; color: ${t.colorWhite}; text-align: center; padding: ${t.headerFontBody}; text-transform: uppercase; text-decoration: none; letter-spacing: 0.0625rem; }
</style>`
