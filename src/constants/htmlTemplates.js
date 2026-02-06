export const HTML_TEMPLATES = {
  fullWidth: `<section class="blog__full-width">
  <h2 class="blog__full-width__heading">Section Heading</h2>
  <div class="blog__full-width__body">
    <p>Body copy goes here. The body is a rich text container that supports various formatting.</p>
    <p>You can include multiple paragraphs, <strong>bold text</strong>, <em>italic text</em>, and <a href="#">links</a>.</p>
  </div>
  <figure class="blog__full-width__figure">
    <img class="blog__full-width__image" src="image-url.jpg" alt="Image description">
  </figure>
</section>`,

  oneUp: `<section class="blog__one-up">
  <h2 class="blog__one-up__heading">Section Heading</h2>
  <div class="blog__one-up__body">
    <p>Body copy goes here. The body supports rich text formatting:</p>
    <ul>
      <li>Unordered list item one</li>
      <li>Unordered list item two</li>
      <li>Unordered list item three</li>
    </ul>
    <p>Continue with more paragraphs as needed.</p>
  </div>
  <figure class="blog__one-up__figure">
    <img class="blog__one-up__image" src="image-url.jpg" alt="Image description">
    <figcaption class="blog__one-up__label">Image Label</figcaption>
  </figure>
</section>`,

  twoUp: `<section class="blog__two-up">
  <h2 class="blog__two-up__heading">Section Heading</h2>
  <div class="blog__two-up__body">
    <p>Body copy goes here with rich text support.</p>
    <h3>Subheading Example</h3>
    <p>You can include subheadings (h3-h6) within the body for organization.</p>
  </div>
  <div class="blog__two-up__grid">
    <figure class="blog__two-up__item">
      <img class="blog__two-up__image" src="image-1.jpg" alt="Image 1 description">
      <figcaption class="blog__two-up__label">Image 1 Label</figcaption>
    </figure>
    <figure class="blog__two-up__item">
      <img class="blog__two-up__image" src="image-2.jpg" alt="Image 2 description">
      <figcaption class="blog__two-up__label">Image 2 Label</figcaption>
    </figure>
  </div>
  <div class="blog__two-up__cta">
    <a class="blog__two-up__cta-btn" href="#">Shop Now</a>
  </div>
</section>`,

  threeUp: `<section class="blog__three-up">
  <h2 class="blog__three-up__heading">Section Heading</h2>
  <div class="blog__three-up__body">
    <p>Body copy with rich text support:</p>
    <ol>
      <li>Ordered list item one</li>
      <li>Ordered list item two</li>
      <li>Ordered list item three</li>
    </ol>
  </div>
  <div class="blog__three-up__grid">
    <figure class="blog__three-up__item">
      <img class="blog__three-up__image" src="image-1.jpg" alt="Image 1 description">
      <figcaption class="blog__three-up__label">Image 1 Label</figcaption>
    </figure>
    <figure class="blog__three-up__item">
      <img class="blog__three-up__image" src="image-2.jpg" alt="Image 2 description">
      <figcaption class="blog__three-up__label">Image 2 Label</figcaption>
    </figure>
    <figure class="blog__three-up__item">
      <img class="blog__three-up__image" src="image-3.jpg" alt="Image 3 description">
      <figcaption class="blog__three-up__label">Image 3 Label</figcaption>
    </figure>
  </div>
  <div class="blog__three-up__cta">
    <a class="blog__three-up__cta-btn" href="#">Shop Now</a>
  </div>
</section>`,

  video: `<section class="blog__video">
  <h2 class="blog__video__heading">Section Heading</h2>
  <div class="blog__video__body">
    <p>Body copy goes here with rich text support.</p>
    <blockquote>You can also include blockquotes for emphasis.</blockquote>
    <p>Continue with additional context about the video.</p>
  </div>
  <div class="blog__video__wrapper">
    <iframe
      class="blog__video__iframe"
      src="https://www.youtube.com/embed/VIDEO_ID"
      title="Video title"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen>
    </iframe>
  </div>
</section>`,

  threeByTwo: `<section class="blog__three-by-two">
  <h2 class="blog__three-by-two__heading">Section Heading</h2>
  <div class="blog__three-by-two__body">
    <p>Body copy goes here. Supports paragraphs, lists, headings, and more.</p>
  </div>
  <div class="blog__three-by-two__grid">
    <figure class="blog__three-by-two__item">
      <img class="blog__three-by-two__image" src="image-1.jpg" alt="Image 1">
      <figcaption class="blog__three-by-two__label">Label 1</figcaption>
    </figure>
    <figure class="blog__three-by-two__item">
      <img class="blog__three-by-two__image" src="image-2.jpg" alt="Image 2">
      <figcaption class="blog__three-by-two__label">Label 2</figcaption>
    </figure>
    <figure class="blog__three-by-two__item">
      <img class="blog__three-by-two__image" src="image-3.jpg" alt="Image 3">
      <figcaption class="blog__three-by-two__label">Label 3</figcaption>
    </figure>
    <figure class="blog__three-by-two__item">
      <img class="blog__three-by-two__image" src="image-4.jpg" alt="Image 4">
      <figcaption class="blog__three-by-two__label">Label 4</figcaption>
    </figure>
    <figure class="blog__three-by-two__item">
      <img class="blog__three-by-two__image" src="image-5.jpg" alt="Image 5">
      <figcaption class="blog__three-by-two__label">Label 5</figcaption>
    </figure>
    <figure class="blog__three-by-two__item">
      <img class="blog__three-by-two__image" src="image-6.jpg" alt="Image 6">
      <figcaption class="blog__three-by-two__label">Label 6</figcaption>
    </figure>
  </div>
  <div class="blog__three-by-two__cta">
    <a class="blog__three-by-two__cta-btn" href="#">Shop Now</a>
  </div>
</section>`,

  richText: `<section class="blog__rich-text">
  <h2 class="blog__rich-text__heading">Section Heading</h2>
  <div class="blog__rich-text__body">
    <p>First paragraph with <strong>bold</strong> and <em>italic</em> text, plus <a href="#">links</a>.</p>

    <h3>Subheading (H3)</h3>
    <p>Paragraph under the subheading.</p>

    <h4>Smaller Subheading (H4)</h4>
    <p>Another paragraph with content.</p>

    <ul>
      <li>Unordered list item</li>
      <li>Another list item</li>
      <li>Third list item</li>
    </ul>

    <ol>
      <li>Ordered list item</li>
      <li>Second ordered item</li>
      <li>Third ordered item</li>
    </ol>

    <blockquote>This is a blockquote for highlighted text or quotes.</blockquote>

    <p>Final paragraph to wrap up the section.</p>
  </div>
</section>`,
}
