# Umbraco Setup

::: danger 🚧 WIP 🚧

This page is under construction.

:::

In your Umbraco project folder, create `App_Plugins` folder, with another folder inside it with your preferred name e.g. `my-package`, with `umbraco-package.json` inside of it with the following content:

```json [umbraco-package.json]
{
    "$schema": "../../umbraco-package-schema.json",
    "name": "My Project Name",
    "version": "0.1.0",
    "extensions": [
        {
            "type": "bundle",
            "alias": "My.Project.Bundle",
            "name": "My Bundle",
            "js": "/App_Plugins/my-package/dist/index.js"
        }
    ]
}
```
