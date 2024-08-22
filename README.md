[![Released version](https://img.shields.io/visual-studio-marketplace/v/kaakaa.slidaiv?color=0078d7)](https://marketplace.visualstudio.com/items?itemName=kaakaa.slidaiv) [![NPM](https://img.shields.io/npm/v/slidaiv?color=cc3534)](https://www.npmjs.com/package/slidaiv) [![ci](https://github.com/kaakaa/slidaiv/actions/workflows/ci.yml/badge.svg)](https://github.com/kaakaa/slidaiv/actions/workflows/ci.yml)

# Slidaiv

Slidaiv leverages AI/LLM to automatically generate content for [Slidev](https://sli.dev/) presentations, making it easier for users to write a Slidev presentation.

[![Demo](https://raw.githubusercontent.com/kaakaa/slidaiv/master/resources/slidaiv-demo.gif)](https://github.com/kaakaa/slidaiv/blob/master/resources/slidaiv-demo.gif))

## Features

- **Automatic Content Generation**: Generate Slidev content using AI/LLM based on user prompts.
- **Easy Integration**: Seamlessly integrates with VS Code for a smooth workflow.
- **Customizable**: Users can use OpenAI or OpenAI-compatible API, choose favorite models, and specify their own prompts to generate contents.

## Extension Settings

This extension contributes the following settings:

| Name | Description | Default |
|:-|:-|:-|
| API Key | API Key to send request to OpenAI(-compatible) service. | (empty) |
| Base URL | API endpoint to send request | `https://api.openai.com/v1` |
| Model | LLM model name | `gpt-3.5-turbo` |
| Prompt: Generate | System prompt to be used when generating Slidev contents | See [prompts.ts](https://github.com/kaakaa/slidaiv/blob/master/src/client/prompts.ts) |
| Prompt: Decorate | System prompt to be used when decorating contents | See [prompts.ts](https://github.com/kaakaa/slidaiv/blob/master/src/client/prompts.ts) |
| Debug | Turn on outputing debug log | `false` |

## Usage

```md
...
---
# Write prompt to LLM in frontmatter and generate Slidev contents
# by "Context Menu > Generate Slidev contents".
slidaiv:
  prompt:
    - Generate awesome page to introduce Slidev
    - features, how to start it
  # Can specify the language for generated content. If unspecified,
  # VS Code's language setting will be used.
  locale: en
---

<!-- Generated contents from here -->
## Slide Title: Why You Should Use Slidev

Slidev is a versatile slideshow platform that offers:

- Simple Markdown syntax, easy to learn and use!
- Highly customizable themes, UNOCSS support for styling
- Interactive features for audience engagement
- Export to HTML, PDF, or reveal.js

Get started:
` ``bash
npm i -g slidev
slidev init <template>  # select a template
cd .slidev && slidev serve
` ``

<!-- End -->

---
# Wrap up
...
```

## License

See [LICENSE.txt](./LICENSE.txt)
