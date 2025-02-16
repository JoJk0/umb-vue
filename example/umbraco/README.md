# `/umbraco`

This is a place for Umbraco installation. You can create an instance via following the [official installation guide](https://docs.umbraco.com/umbraco-cms/fundamentals/setup/install).

Install the Umbraco templates:

```bash
dotnet new install Umbraco.Templates
```

Create a new project:

```bash
cd ../ && dotnet new umbraco --name umbraco
```

Run the project:

```bash
cd ./umbraco && dotnet run
```
