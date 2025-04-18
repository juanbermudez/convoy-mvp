---
title: Customizing
description: How to customize your documentation site.
---

To customize your documentation site, you can check the files and folders below:

- **`src/config`**: Contains the site configuration files, such as:
  - site information settings
  - code theme
  - navigation menu
  - internationalization.

- **`src/i18n/locales/[language].json`**: Contains the text strings for each supported language that are not directly related to MDX contents (site, buttons, cards...).

- **`src/components`**: Contains the site components.

## MDX Document Settings

MDX documents are stored in the `apps/content/docs/[language]` and `apps/content/blog/[language]` folder. Each document is an MDX file that contains a header with metadata, such as title and description. Below is an example of a document header:

```mdx
---
title: Document Title
description: Document Description.
---
```

To add new metadata to the document, you can add new keys to the header. For example, you can add an `author` key to indicate the document author:

```mdx
---
title: Document Title
description: Document Description.
author: Author Name
---
```

But when adding custom metadata, you also need to update the `contentlayer.config.ts` file located at the root of the project and inside the `fields` property in the `Doc` or `Blog` constants.
After that, you will need to display the new information in the document template. To do this, you will need to update the `src/app/[locale]/docs/[[...slug]]/page.tsx` file, or `src/app/[locale]/blog/[[...slug]]/page.tsx` or one of its child components.
