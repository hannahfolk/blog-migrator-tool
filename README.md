# Blog Migration Tool

A React-based tool for migrating WordPress blog posts to Shopify-compatible HTML with custom CSS sections.

## Features

### Migrator Tab
- Paste existing WordPress/HTML content
- Draw selection boxes to map content to Figma section types
- Resize selections with drag handles
- Generate clean HTML output with BEM-style class names
- Copy HTML and CSS separately

### Section Reference Tab
- Visual preview of all 7 section types
- HTML templates for each section
- CSS for each section (or copy all CSS at once)
- Lorem ipsum dummy content for visualization

## Section Types

| Section | Description |
|---------|-------------|
| Full Width | Hero image spanning full width |
| 1-Up | Single image with label |
| 2-Up | Two images side by side with CTA |
| 3-Up | Three images in a row with CTA |
| Video | Embedded video player |
| 3 x 2 | Six images in a 3x2 grid |
| Rich Text | Text-only section |

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Usage

### Migrating Content

1. Go to the **Migrator** tab
2. Paste your WordPress HTML into the input area
3. Click **Start Mapping**
4. Draw boxes around sections you want to convert
5. Select the appropriate Figma section type for each box
6. Click **Generate HTML**
7. Copy the CSS (add to your Shopify theme)
8. Copy the HTML (paste into Shopify blog editor)

### Using Section Reference

1. Go to the **Section Reference** tab
2. Browse available section types
3. Click on a section to expand it
4. Toggle between Preview, HTML, and CSS tabs
5. Copy individual section code or use "Copy All CSS"

## Class Naming Convention

All classes follow BEM-inspired pattern:

```
blog__[section]__[element]
```

Examples:
- `blog__two-up` - Section container
- `blog__two-up__heading` - Section heading
- `blog__two-up__body` - Rich text body
- `blog__two-up__grid` - Image grid
- `blog__two-up__cta-btn` - CTA button

## Tech Stack

- React 18
- Tailwind CSS
- Lucide React (icons)

## License

MIT
