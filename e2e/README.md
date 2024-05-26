# Mock server for OpenAI API

Use mock server of OpenAI API for e2e test by using [@stoplight/prism-cli](https://stoplight.io/open-source/prism) and [openai/openai-openapi](https://github.com/openai/openai-openapi)

1. Get `openapi.yaml` from https://github.com/openai/openai-openapi
   * I've tested for [893ba52](https://github.com/openai/openai-openapi/commit/893ba52242dbd5387a97b96444ee1c742cfce9bd)
2. Specify `x-faker: lorem.paragraphs` as ChatCompletionResponseMessage
   * ref. [Lorem \| Faker](https://v6.fakerjs.dev/api/lorem.html)
3. Run prism-mock by `pnpm run mock-server`
   * Mock server will be running at `http://127.0.0.1:4010`
