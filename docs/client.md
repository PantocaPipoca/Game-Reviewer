# Frontend Info

This readme will explain all of the norms I setup for the frontend these **SHOULD be followed** so that we can keep a consistent enviroment.

## DO NOT USE THESE HTML TAGS

Unless really necessary try to avoid using tags like `<h1>`, `<h2>`, `<h3>`, `<body>` for text or `<button>` for buttons. Instead use the `<Text>` and `<Button>` components that I have created. That helps maintain the same styling and base functionality across the app.

## Button components

As you can see there are a couple of button types that essencially extend the base `<Button>` component. If you plan to use any button type **more than once** create a separate component for it to make the pages more readable. If by any reason the app scales to where we need 5+ button types then I will refactor the code to use a _variant_ prop instead.

## CSS

**USE THE FUCKING VARIABLES.** If there is a variable for something use try to use it everywhere. For example if there is 1+ varyable for spacing use varyables over raw pixel values at any time you use spacings. Same for text, colors etc. There is already a defined list of styles for the app so there should be no need to add new ones. But if you do nedd to add one **do it rather than using a raw value**.

To help use varyables throuout the project install https://marketplace.visualstudio.com/items?itemName=vunguyentuan.vscode-css-variables this VsCode extensions so you can have autocomplete for the variables and see the colors in a little preview and many more useful features.

The CSS uses CSS modules mainly so try to keep it that way. Also notice that by standar all of the class Selectors are in **camelCase**.

## Formating

Besides what was told install the prettier extension and set it up to **format on save**. Use this config {}.

## Folder structure

```
src/
├── API/          # All API calls. One file per resource. Nothing outside here uses axios directly.
├── Assets/       # Self explanatory.
├── Components/   # Reusable UI components, each in its own folder with its CSS module
├── Pages/        # Self explanatory.
├── Styles/       # Global styles.
└── Types/        # Shared types and constants.
```
