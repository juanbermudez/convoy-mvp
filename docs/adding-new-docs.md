---
title: Adding new docs
description: Add new documents to your documentation site and blog.
---

# For documentation

1. Create a new `.mdx` file in the `apps/content/docs/[language]` folder with the content of your document.
2. Add the document to the site's navigation menu.
    To do this, add a new item to the `src/config/docs.ts` file in the `sidebarNav` property with the desired information, just follow the pattern of the existing items. By doing this, the document will also be added to the search command palette.

# For the Blog

Just create a new `.mdx` file in the `apps/content/blog/[language]` folder with the content of your post.
