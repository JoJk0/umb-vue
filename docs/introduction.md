# Introduction

This package allows to use Vue components inside Umbraco Backoffice, by extending `UmbElement` with `VueElement`.

## Why?

As [Umbraco 14 has been shipped](https://umbraco.com/blog/umbraco-14-release/), their Backoffice has been completely rewritten to use custom elements with [Lit](https://lit.dev/). This enables to use any framework of choice inside Umbraco Backoffice, allowing endless possibilities for integrations.

Through [Extension Manifests](https://docs.umbraco.com/umbraco-cms/customizing/extending-overview/extension-registry/extension-manifest), any functionality inside the Backoffice can be extended, or new features created altogether.

Due to Vue's excellent performance and [ease of use as Custom Elements](https://vuejs.org/guide/extras/web-components), its components can be seamlessly integrated into Umbraco Backoffice. This package removes the need to handle with Lit Elements and allows to use Umbraco integrations directly inside Vue files.
