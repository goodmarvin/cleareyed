
Overview
AI SDK Core
Large Language Models (LLMs) are advanced programs that can understand, create, and engage with human language on a large scale. They are trained on vast amounts of written material to recognize patterns in language and predict what might come next in a given piece of text.

AI SDK Core simplifies working with LLMs by offering a standardized way of integrating them into your app - so you can focus on building great AI applications for your users, not waste time on technical details.

For example, here’s how you can generate text with various models using the AI SDK:

xAI
OpenAI
Anthropic
Google
Custom
import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"
const { text } = await generateText({
model: xai("grok-3-beta"),
prompt: "What is love?"
})
Love is a universal emotion that is characterized by feelings of affection, attachment, and warmth towards someone or something. It is a complex and multifaceted experience that can take many different forms, including romantic love, familial love, platonic love, and self-love.
AI SDK Core Functions
AI SDK Core has various functions designed for text generation, structured data generation, and tool usage. These functions take a standardized approach to setting up prompts and settings, making it easier to work with different models.

generateText: Generates text and tool calls. This function is ideal for non-interactive use cases such as automation tasks where you need to write text (e.g. drafting email or summarizing web pages) and for agents that use tools.
streamText: Stream text and tool calls. You can use the streamText function for interactive use cases such as chat bots and content streaming.
generateObject: Generates a typed, structured object that matches a Zod schema. You can use this function to force the language model to return structured data, e.g. for information extraction, synthetic data generation, or classification tasks.
streamObject: Stream a structured object that matches a Zod schema. You can use this function to stream generated UIs.

Generating and Streaming Text
Large language models (LLMs) can generate text in response to a prompt, which can contain instructions and information to process. For example, you can ask a model to come up with a recipe, draft an email, or summarize a document.

The AI SDK Core provides two functions to generate text and stream it from LLMs:

generateText: Generates text for a given prompt and model.
streamText: Streams text from a given prompt and model.
Advanced LLM features such as tool calling and structured data generation are built on top of text generation.

generateText
You can generate text using the generateText function. This function is ideal for non-interactive use cases where you need to write text (e.g. drafting email or summarizing web pages) and for agents that use tools.


import { generateText } from 'ai';

const { text } = await generateText({
  model: yourModel,
  prompt: 'Write a vegetarian lasagna recipe for 4 people.',
});
You can use more advanced prompts to generate text with more complex instructions and content:


import { generateText } from 'ai';

const { text } = await generateText({
  model: yourModel,
  system:
    'You are a professional writer. ' +
    'You write simple, clear, and concise content.',
  prompt: `Summarize the following article in 3-5 sentences: ${article}`,
});
The result object of generateText contains several promises that resolve when all required data is available:

result.text: The generated text.
result.reasoning: The reasoning text of the model (only available for some models).
result.sources: Sources that have been used as input to generate the response (only available for some models).
result.finishReason: The reason the model finished generating text.
result.usage: The usage of the model during text generation.
Accessing response headers & body
Sometimes you need access to the full response from the model provider, e.g. to access some provider-specific headers or body content.

You can access the raw response headers and body using the response property:


import { generateText } from 'ai';

const result = await generateText({
  // ...
});

console.log(JSON.stringify(result.response.headers, null, 2));
console.log(JSON.stringify(result.response.body, null, 2));
streamText
Depending on your model and prompt, it can take a large language model (LLM) up to a minute to finish generating its response. This delay can be unacceptable for interactive use cases such as chatbots or real-time applications, where users expect immediate responses.

AI SDK Core provides the streamText function which simplifies streaming text from LLMs:


import { streamText } from 'ai';

const result = streamText({
  model: yourModel,
  prompt: 'Invent a new holiday and describe its traditions.',
});

// example: use textStream as an async iterable
for await (const textPart of result.textStream) {
  console.log(textPart);
}
result.textStream is both a ReadableStream and an AsyncIterable.

streamText immediately starts streaming and suppresses errors to prevent server crashes. Use the onError callback to log errors.

You can use streamText on its own or in combination with AI SDK UI and AI SDK RSC. The result object contains several helper functions to make the integration into AI SDK UI easier:

result.toDataStreamResponse(): Creates a data stream HTTP response (with tool calls etc.) that can be used in a Next.js App Router API route.
result.pipeDataStreamToResponse(): Writes data stream delta output to a Node.js response-like object.
result.toTextStreamResponse(): Creates a simple text stream HTTP response.
result.pipeTextStreamToResponse(): Writes text delta output to a Node.js response-like object.
streamText is using backpressure and only generates tokens as they are requested. You need to consume the stream in order for it to finish.

It also provides several promises that resolve when the stream is finished:

result.text: The generated text.
result.reasoning: The reasoning text of the model (only available for some models).
result.sources: Sources that have been used as input to generate the response (only available for some models).
result.finishReason: The reason the model finished generating text.
result.usage: The usage of the model during text generation.
onError callback
streamText immediately starts streaming to enable sending data without waiting for the model. Errors become part of the stream and are not thrown to prevent e.g. servers from crashing.

To log errors, you can provide an onError callback that is triggered when an error occurs.


import { streamText } from 'ai';

const result = streamText({
  model: yourModel,
  prompt: 'Invent a new holiday and describe its traditions.',
  onError({ error }) {
    console.error(error); // your error logging logic here
  },
});
onChunk callback
When using streamText, you can provide an onChunk callback that is triggered for each chunk of the stream.

It receives the following chunk types:

text-delta
reasoning
source
tool-call
tool-result
tool-call-streaming-start (when toolCallStreaming is enabled)
tool-call-delta (when toolCallStreaming is enabled)

import { streamText } from 'ai';

const result = streamText({
  model: yourModel,
  prompt: 'Invent a new holiday and describe its traditions.',
  onChunk({ chunk }) {
    // implement your own logic here, e.g.:
    if (chunk.type === 'text-delta') {
      console.log(chunk.text);
    }
  },
});
onFinish callback
When using streamText, you can provide an onFinish callback that is triggered when the stream is finished ( API Reference ). It contains the text, usage information, finish reason, messages, and more:


import { streamText } from 'ai';

const result = streamText({
  model: yourModel,
  prompt: 'Invent a new holiday and describe its traditions.',
  onFinish({ text, finishReason, usage, response }) {
    // your own logic, e.g. for saving the chat history or recording usage

    const messages = response.messages; // messages that were generated
  },
});
fullStream property
You can read a stream with all events using the fullStream property. This can be useful if you want to implement your own UI or handle the stream in a different way. Here is an example of how to use the fullStream property:


import { streamText } from 'ai';
import { z } from 'zod';

const result = streamText({
  model: yourModel,
  tools: {
    cityAttractions: {
      parameters: z.object({ city: z.string() }),
      execute: async ({ city }) => ({
        attractions: ['attraction1', 'attraction2', 'attraction3'],
      }),
    },
  },
  prompt: 'What are some San Francisco tourist attractions?',
});

for await (const part of result.fullStream) {
  switch (part.type) {
    case 'text-delta': {
      // handle text delta here
      break;
    }
    case 'reasoning': {
      // handle reasoning here
      break;
    }
    case 'source': {
      // handle source here
      break;
    }
    case 'tool-call': {
      switch (part.toolName) {
        case 'cityAttractions': {
          // handle tool call here
          break;
        }
      }
      break;
    }
    case 'tool-result': {
      switch (part.toolName) {
        case 'cityAttractions': {
          // handle tool result here
          break;
        }
      }
      break;
    }
    case 'finish': {
      // handle finish here
      break;
    }
    case 'error': {
      // handle error here
      break;
    }
  }
}
Stream transformation
You can use the experimental_transform option to transform the stream. This is useful for e.g. filtering, changing, or smoothing the text stream.

The transformations are applied before the callbacks are invoked and the promises are resolved. If you e.g. have a transformation that changes all text to uppercase, the onFinish callback will receive the transformed text.

Smoothing streams
The AI SDK Core provides a smoothStream function that can be used to smooth out text streaming.


import { smoothStream, streamText } from 'ai';

const result = streamText({
  model,
  prompt,
  experimental_transform: smoothStream(),
});
Custom transformations
You can also implement your own custom transformations. The transformation function receives the tools that are available to the model, and returns a function that is used to transform the stream. Tools can either be generic or limited to the tools that you are using.

Here is an example of how to implement a custom transformation that converts all text to uppercase:


const upperCaseTransform =
  <TOOLS extends ToolSet>() =>
  (options: { tools: TOOLS; stopStream: () => void }) =>
    new TransformStream<TextStreamPart<TOOLS>, TextStreamPart<TOOLS>>({
      transform(chunk, controller) {
        controller.enqueue(
          // for text-delta chunks, convert the text to uppercase:
          chunk.type === 'text-delta'
            ? { ...chunk, textDelta: chunk.textDelta.toUpperCase() }
            : chunk,
        );
      },
    });
You can also stop the stream using the stopStream function. This is e.g. useful if you want to stop the stream when model guardrails are violated, e.g. by generating inappropriate content.

When you invoke stopStream, it is important to simulate the step-finish and finish events to guarantee that a well-formed stream is returned and all callbacks are invoked.


const stopWordTransform =
  <TOOLS extends ToolSet>() =>
  ({ stopStream }: { stopStream: () => void }) =>
    new TransformStream<TextStreamPart<TOOLS>, TextStreamPart<TOOLS>>({
      // note: this is a simplified transformation for testing;
      // in a real-world version more there would need to be
      // stream buffering and scanning to correctly emit prior text
      // and to detect all STOP occurrences.
      transform(chunk, controller) {
        if (chunk.type !== 'text-delta') {
          controller.enqueue(chunk);
          return;
        }

        if (chunk.textDelta.includes('STOP')) {
          // stop the stream
          stopStream();

          // simulate the step-finish event
          controller.enqueue({
            type: 'step-finish',
            finishReason: 'stop',
            logprobs: undefined,
            usage: {
              completionTokens: NaN,
              promptTokens: NaN,
              totalTokens: NaN,
            },
            request: {},
            response: {
              id: 'response-id',
              modelId: 'mock-model-id',
              timestamp: new Date(0),
            },
            warnings: [],
            isContinued: false,
          });

          // simulate the finish event
          controller.enqueue({
            type: 'finish',
            finishReason: 'stop',
            logprobs: undefined,
            usage: {
              completionTokens: NaN,
              promptTokens: NaN,
              totalTokens: NaN,
            },
            response: {
              id: 'response-id',
              modelId: 'mock-model-id',
              timestamp: new Date(0),
            },
          });

          return;
        }

        controller.enqueue(chunk);
      },
    });
Multiple transformations
You can also provide multiple transformations. They are applied in the order they are provided.


const result = streamText({
  model,
  prompt,
  experimental_transform: [firstTransform, secondTransform],
});
Sources
Some providers such as Perplexity and Google Generative AI include sources in the response.

Currently sources are limited to web pages that ground the response. You can access them using the sources property of the result.

Each url source contains the following properties:

id: The ID of the source.
url: The URL of the source.
title: The optional title of the source.
providerMetadata: Provider metadata for the source.
When you use generateText, you can access the sources using the sources property:


const result = await generateText({
  model: google('gemini-2.0-flash-exp', { useSearchGrounding: true }),
  prompt: 'List the top 5 San Francisco news from the past week.',
});

for (const source of result.sources) {
  if (source.sourceType === 'url') {
    console.log('ID:', source.id);
    console.log('Title:', source.title);
    console.log('URL:', source.url);
    console.log('Provider metadata:', source.providerMetadata);
    console.log();
  }
}
When you use streamText, you can access the sources using the fullStream property:


const result = streamText({
  model: google('gemini-2.0-flash-exp', { useSearchGrounding: true }),
  prompt: 'List the top 5 San Francisco news from the past week.',
});

for await (const part of result.fullStream) {
  if (part.type === 'source' && part.source.sourceType === 'url') {
    console.log('ID:', part.source.id);
    console.log('Title:', part.source.title);
    console.log('URL:', part.source.url);
    console.log('Provider metadata:', part.source.providerMetadata);
    console.log();
  }
}
The sources are also available in the result.sources promise.

Generating Long Text
Most language models have an output limit that is much shorter than their context window. This means that you cannot generate long text in one go, but it is possible to add responses back to the input and continue generating to create longer text.

generateText and streamText support such continuations for long text generation using the experimental continueSteps setting:


import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

const {
  text, // combined text
  usage, // combined usage of all steps
} = await generateText({
  model: openai('gpt-4o'), // 4096 output tokens
  maxSteps: 5, // enable multi-step calls
  experimental_continueSteps: true,
  prompt:
    'Write a book about Roman history, ' +
    'from the founding of the city of Rome ' +
    'to the fall of the Western Roman Empire. ' +
    'Each chapter MUST HAVE at least 1000 words.',
});
When experimental_continueSteps is enabled, only full words are streamed in streamText, and both generateText and streamText might drop the trailing tokens of some calls to prevent whitespace issues.

Some models might not always stop correctly on their own and keep generating until maxSteps is reached. You can hint the model to stop by e.g. using a system message such as "Stop when sufficient information was provided."

Examples
You can see generateText and streamText in action using various frameworks in the following examples:

generateText
Learn to generate text in Node.js
Learn to generate text in Next.js with Route Handlers (AI SDK UI)
Learn to generate text in Next.js with Server Actions (AI SDK RSC)
streamText
Learn to stream text in Node.js
Learn to stream text in Next.js with Route Handlers (AI SDK UI)
Learn to stream text in Next.js with Server Actions (AI SDK RSC)

Generating Structured Data
While text generation can be useful, your use case will likely call for generating structured data. For example, you might want to extract information from text, classify data, or generate synthetic data.

Many language models are capable of generating structured data, often defined as using "JSON modes" or "tools". However, you need to manually provide schemas and then validate the generated data as LLMs can produce incorrect or incomplete structured data.

The AI SDK standardises structured object generation across model providers with the generateObject and streamObject functions. You can use both functions with different output strategies, e.g. array, object, or no-schema, and with different generation modes, e.g. auto, tool, or json. You can use Zod schemas, Valibot, or JSON schemas to specify the shape of the data that you want, and the AI model will generate data that conforms to that structure.

You can pass Zod objects directly to the AI SDK functions or use the zodSchema helper function.

Generate Object
The generateObject generates structured data from a prompt. The schema is also used to validate the generated data, ensuring type safety and correctness.


import { generateObject } from 'ai';
import { z } from 'zod';

const { object } = await generateObject({
  model: yourModel,
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(z.object({ name: z.string(), amount: z.string() })),
      steps: z.array(z.string()),
    }),
  }),
  prompt: 'Generate a lasagna recipe.',
});
See generateObject in action with these examples

Accessing response headers & body
Sometimes you need access to the full response from the model provider, e.g. to access some provider-specific headers or body content.

You can access the raw response headers and body using the response property:


import { generateText } from 'ai';

const result = await generateText({
  // ...
});

console.log(JSON.stringify(result.response.headers, null, 2));
console.log(JSON.stringify(result.response.body, null, 2));
Stream Object
Given the added complexity of returning structured data, model response time can be unacceptable for your interactive use case. With the streamObject function, you can stream the model's response as it is generated.


import { streamObject } from 'ai';

const { partialObjectStream } = streamObject({
  // ...
});

// use partialObjectStream as an async iterable
for await (const partialObject of partialObjectStream) {
  console.log(partialObject);
}
You can use streamObject to stream generated UIs in combination with React Server Components (see Generative UI)) or the useObject hook.

See streamObject in action with these examples
onError callback
streamObject immediately starts streaming. Errors become part of the stream and are not thrown to prevent e.g. servers from crashing.

To log errors, you can provide an onError callback that is triggered when an error occurs.


import { streamObject } from 'ai';

const result = streamObject({
  // ...
  onError({ error }) {
    console.error(error); // your error logging logic here
  },
});
Output Strategy
You can use both functions with different output strategies, e.g. array, object, or no-schema.

Object
The default output strategy is object, which returns the generated data as an object. You don't need to specify the output strategy if you want to use the default.

Array
If you want to generate an array of objects, you can set the output strategy to array. When you use the array output strategy, the schema specifies the shape of an array element. With streamObject, you can also stream the generated array elements using elementStream.


import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { z } from 'zod';

const { elementStream } = streamObject({
  model: openai('gpt-4-turbo'),
  output: 'array',
  schema: z.object({
    name: z.string(),
    class: z
      .string()
      .describe('Character class, e.g. warrior, mage, or thief.'),
    description: z.string(),
  }),
  prompt: 'Generate 3 hero descriptions for a fantasy role playing game.',
});

for await (const hero of elementStream) {
  console.log(hero);
}
Enum
If you want to generate a specific enum value, e.g. for classification tasks, you can set the output strategy to enum and provide a list of possible values in the enum parameter.

Enum output is only available with generateObject.

import { generateObject } from 'ai';

const { object } = await generateObject({
  model: yourModel,
  output: 'enum',
  enum: ['action', 'comedy', 'drama', 'horror', 'sci-fi'],
  prompt:
    'Classify the genre of this movie plot: ' +
    '"A group of astronauts travel through a wormhole in search of a ' +
    'new habitable planet for humanity."',
});
No Schema
In some cases, you might not want to use a schema, for example when the data is a dynamic user request. You can use the output setting to set the output format to no-schema in those cases and omit the schema parameter.


import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';

const { object } = await generateObject({
  model: openai('gpt-4-turbo'),
  output: 'no-schema',
  prompt: 'Generate a lasagna recipe.',
});
Generation Mode
While some models (like OpenAI) natively support object generation, others require alternative methods, like modified tool calling. The generateObject function allows you to specify the method it will use to return structured data.

auto: The provider will choose the best mode for the model. This recommended mode is used by default.
tool: A tool with the JSON schema as parameters is provided and the provider is instructed to use it.
json: The response format is set to JSON when supported by the provider, e.g. via json modes or grammar-guided generation. If grammar-guided generation is not supported, the JSON schema and instructions to generate JSON that conforms to the schema are injected into the system prompt.
Please note that not every provider supports all generation modes. Some providers do not support object generation at all.

Schema Name and Description
You can optionally specify a name and description for the schema. These are used by some providers for additional LLM guidance, e.g. via tool or schema name.


import { generateObject } from 'ai';
import { z } from 'zod';

const { object } = await generateObject({
  model: yourModel,
  schemaName: 'Recipe',
  schemaDescription: 'A recipe for a dish.',
  schema: z.object({
    name: z.string(),
    ingredients: z.array(z.object({ name: z.string(), amount: z.string() })),
    steps: z.array(z.string()),
  }),
  prompt: 'Generate a lasagna recipe.',
});
Error Handling
When generateObject cannot generate a valid object, it throws a AI_NoObjectGeneratedError.

This error occurs when the AI provider fails to generate a parsable object that conforms to the schema. It can arise due to the following reasons:

The model failed to generate a response.
The model generated a response that could not be parsed.
The model generated a response that could not be validated against the schema.
The error preserves the following information to help you log the issue:

text: The text that was generated by the model. This can be the raw text or the tool call text, depending on the object generation mode.
response: Metadata about the language model response, including response id, timestamp, and model.
usage: Request token usage.
cause: The cause of the error (e.g. a JSON parsing error). You can use this for more detailed error handling.

import { generateObject, NoObjectGeneratedError } from 'ai';

try {
  await generateObject({ model, schema, prompt });
} catch (error) {
  if (NoObjectGeneratedError.isInstance(error)) {
    console.log('NoObjectGeneratedError');
    console.log('Cause:', error.cause);
    console.log('Text:', error.text);
    console.log('Response:', error.response);
    console.log('Usage:', error.usage);
  }
}
Repairing Invalid or Malformed JSON
The repairText function is experimental and may change in the future.

Sometimes the model will generate invalid or malformed JSON. You can use the repairText function to attempt to repair the JSON.

It receives the error, either a JSONParseError or a TypeValidationError, and the text that was generated by the model. You can then attempt to repair the text and return the repaired text.


import { generateObject } from 'ai';

const { object } = await generateObject({
  model,
  schema,
  prompt,
  experimental_repairText: async ({ text, error }) => {
    // example: add a closing brace to the text
    return text + '}';
  },
});
Structured outputs with generateText and streamText
You can generate structured data with generateText and streamText by using the experimental_output setting.

Some models, e.g. those by OpenAI, support structured outputs and tool calling at the same time. This is only possible with generateText and streamText.

Structured output generation with generateText and streamText is experimental and may change in the future.

generateText

// experimental_output is a structured object that matches the schema:
const { experimental_output } = await generateText({
  // ...
  experimental_output: Output.object({
    schema: z.object({
      name: z.string(),
      age: z.number().nullable().describe('Age of the person.'),
      contact: z.object({
        type: z.literal('email'),
        value: z.string(),
      }),
      occupation: z.object({
        type: z.literal('employed'),
        company: z.string(),
        position: z.string(),
      }),
    }),
  }),
  prompt: 'Generate an example person for testing.',
});
streamText

// experimental_partialOutputStream contains generated partial objects:
const { experimental_partialOutputStream } = await streamText({
  // ...
  experimental_output: Output.object({
    schema: z.object({
      name: z.string(),
      age: z.number().nullable().describe('Age of the person.'),
      contact: z.object({
        type: z.literal('email'),
        value: z.string(),
      }),
      occupation: z.object({
        type: z.literal('employed'),
        company: z.string(),
        position: z.string(),
      }),
    }),
  }),
  prompt: 'Generate an example person for testing.',
});

Tool Calling
As covered under Foundations, tools are objects that can be called by the model to perform a specific task. AI SDK Core tools contain three elements:

description: An optional description of the tool that can influence when the tool is picked.
parameters: A Zod schema or a JSON schema that defines the parameters. The schema is consumed by the LLM, and also used to validate the LLM tool calls.
execute: An optional async function that is called with the arguments from the tool call. It produces a value of type RESULT (generic type). It is optional because you might want to forward tool calls to the client or to a queue instead of executing them in the same process.
You can use the tool helper function to infer the types of the execute parameters.

The tools parameter of generateText and streamText is an object that has the tool names as keys and the tools as values:


import { z } from 'zod';
import { generateText, tool } from 'ai';

const result = await generateText({
  model: yourModel,
  tools: {
    weather: tool({
      description: 'Get the weather in a location',
      parameters: z.object({
        location: z.string().describe('The location to get the weather for'),
      }),
      execute: async ({ location }) => ({
        location,
        temperature: 72 + Math.floor(Math.random() * 21) - 10,
      }),
    }),
  },
  prompt: 'What is the weather in San Francisco?',
});
When a model uses a tool, it is called a "tool call" and the output of the tool is called a "tool result".

Tool calling is not restricted to only text generation. You can also use it to render user interfaces (Generative UI).

Multi-Step Calls (using maxSteps)
With the maxSteps setting, you can enable multi-step calls in generateText and streamText. When maxSteps is set to a number greater than 1 and the model generates a tool call, the AI SDK will trigger a new generation passing in the tool result until there are no further tool calls or the maximum number of tool steps is reached.

To decide what value to set for maxSteps, consider the most complex task the call might handle and the number of sequential steps required for completion, rather than just the number of available tools.

By default, when you use generateText or streamText, it triggers a single generation (maxSteps: 1). This works well for many use cases where you can rely on the model's training data to generate a response. However, when you provide tools, the model now has the choice to either generate a normal text response, or generate a tool call. If the model generates a tool call, it's generation is complete and that step is finished.

You may want the model to generate text after the tool has been executed, either to summarize the tool results in the context of the users query. In many cases, you may also want the model to use multiple tools in a single response. This is where multi-step calls come in.

You can think of multi-step calls in a similar way to a conversation with a human. When you ask a question, if the person does not have the requisite knowledge in their common knowledge (a model's training data), the person may need to look up information (use a tool) before they can provide you with an answer. In the same way, the model may need to call a tool to get the information it needs to answer your question where each generation (tool call or text generation) is a step.

Example
In the following example, there are two steps:

Step 1
The prompt 'What is the weather in San Francisco?' is sent to the model.
The model generates a tool call.
The tool call is executed.
Step 2
The tool result is sent to the model.
The model generates a response considering the tool result.

import { z } from 'zod';
import { generateText, tool } from 'ai';

const { text, steps } = await generateText({
  model: yourModel,
  tools: {
    weather: tool({
      description: 'Get the weather in a location',
      parameters: z.object({
        location: z.string().describe('The location to get the weather for'),
      }),
      execute: async ({ location }) => ({
        location,
        temperature: 72 + Math.floor(Math.random() * 21) - 10,
      }),
    }),
  },
  maxSteps: 5, // allow up to 5 steps
  prompt: 'What is the weather in San Francisco?',
});
You can use streamText in a similar way.
Steps
To access intermediate tool calls and results, you can use the steps property in the result object or the streamText onFinish callback. It contains all the text, tool calls, tool results, and more from each step.

Example: Extract tool results from all steps

import { generateText } from 'ai';

const { steps } = await generateText({
  model: openai('gpt-4-turbo'),
  maxSteps: 10,
  // ...
});

// extract all tool calls from the steps:
const allToolCalls = steps.flatMap(step => step.toolCalls);
onStepFinish callback
When using generateText or streamText, you can provide an onStepFinish callback that is triggered when a step is finished, i.e. all text deltas, tool calls, and tool results for the step are available. When you have multiple steps, the callback is triggered for each step.


import { generateText } from 'ai';

const result = await generateText({
  // ...
  onStepFinish({ text, toolCalls, toolResults, finishReason, usage }) {
    // your own logic, e.g. for saving the chat history or recording usage
  },
});
experimental_prepareStep callback
The experimental_prepareStep callback is experimental and may change in the future. It is only available in the generateText function.

The experimental_prepareStep callback is called before a step is started.

It is called with the following parameters:

model: The model that was passed into generateText.
maxSteps: The maximum number of steps that was passed into generateText.
stepNumber: The number of the step that is being executed.
steps: The steps that have been executed so far.
You can use it to provide different settings for a step.


import { generateText } from 'ai';

const result = await generateText({
  // ...
  experimental_prepareStep: async ({ model, stepNumber, maxSteps, steps }) => {
    if (stepNumber === 0) {
      return {
        // use a different model for this step:
        model: modelForThisParticularStep,
        // force a tool choice for this step:
        toolChoice: { type: 'tool', toolName: 'tool1' },
        // limit the tools that are available for this step:
        experimental_activeTools: ['tool1'],
      };
    }

    // when nothing is returned, the default settings are used
  },
});
Response Messages
Adding the generated assistant and tool messages to your conversation history is a common task, especially if you are using multi-step tool calls.

Both generateText and streamText have a response.messages property that you can use to add the assistant and tool messages to your conversation history. It is also available in the onFinish callback of streamText.

The response.messages property contains an array of CoreMessage objects that you can add to your conversation history:


import { generateText } from 'ai';

const messages: CoreMessage[] = [
  // ...
];

const { response } = await generateText({
  // ...
  messages,
});

// add the response messages to your conversation history:
messages.push(...response.messages); // streamText: ...((await response).messages)
Tool Choice
You can use the toolChoice setting to influence when a tool is selected. It supports the following settings:

auto (default): the model can choose whether and which tools to call.
required: the model must call a tool. It can choose which tool to call.
none: the model must not call tools
{ type: 'tool', toolName: string (typed) }: the model must call the specified tool

import { z } from 'zod';
import { generateText, tool } from 'ai';

const result = await generateText({
  model: yourModel,
  tools: {
    weather: tool({
      description: 'Get the weather in a location',
      parameters: z.object({
        location: z.string().describe('The location to get the weather for'),
      }),
      execute: async ({ location }) => ({
        location,
        temperature: 72 + Math.floor(Math.random() * 21) - 10,
      }),
    }),
  },
  toolChoice: 'required', // force the model to call a tool
  prompt: 'What is the weather in San Francisco?',
});
Tool Execution Options
When tools are called, they receive additional options as a second parameter.

Tool Call ID
The ID of the tool call is forwarded to the tool execution. You can use it e.g. when sending tool-call related information with stream data.


import { StreamData, streamText, tool } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const data = new StreamData();

  const result = streamText({
    // ...
    messages,
    tools: {
      myTool: tool({
        // ...
        execute: async (args, { toolCallId }) => {
          // return e.g. custom status for tool call
          data.appendMessageAnnotation({
            type: 'tool-status',
            toolCallId,
            status: 'in-progress',
          });
          // ...
        },
      }),
    },
    onFinish() {
      data.close();
    },
  });

  return result.toDataStreamResponse({ data });
}
Messages
The messages that were sent to the language model to initiate the response that contained the tool call are forwarded to the tool execution. You can access them in the second parameter of the execute function. In multi-step calls, the messages contain the text, tool calls, and tool results from all previous steps.


import { generateText, tool } from 'ai';

const result = await generateText({
  // ...
  tools: {
    myTool: tool({
      // ...
      execute: async (args, { messages }) => {
        // use the message history in e.g. calls to other language models
        return something;
      },
    }),
  },
});
Abort Signals
The abort signals from generateText and streamText are forwarded to the tool execution. You can access them in the second parameter of the execute function and e.g. abort long-running computations or forward them to fetch calls inside tools.


import { z } from 'zod';
import { generateText, tool } from 'ai';

const result = await generateText({
  model: yourModel,
  abortSignal: myAbortSignal, // signal that will be forwarded to tools
  tools: {
    weather: tool({
      description: 'Get the weather in a location',
      parameters: z.object({ location: z.string() }),
      execute: async ({ location }, { abortSignal }) => {
        return fetch(
          `https://api.weatherapi.com/v1/current.json?q=${location}`,
          { signal: abortSignal }, // forward the abort signal to fetch
        );
      },
    }),
  },
  prompt: 'What is the weather in San Francisco?',
});
Types
Modularizing your code often requires defining types to ensure type safety and reusability. To enable this, the AI SDK provides several helper types for tools, tool calls, and tool results.

You can use them to strongly type your variables, function parameters, and return types in parts of the code that are not directly related to streamText or generateText.

Each tool call is typed with ToolCall<NAME extends string, ARGS>, depending on the tool that has been invoked. Similarly, the tool results are typed with ToolResult<NAME extends string, ARGS, RESULT>.

The tools in streamText and generateText are defined as a ToolSet. The type inference helpers ToolCallUnion<TOOLS extends ToolSet> and ToolResultUnion<TOOLS extends ToolSet> can be used to extract the tool call and tool result types from the tools.


import { openai } from '@ai-sdk/openai';
import { ToolCallUnion, ToolResultUnion, generateText, tool } from 'ai';
import { z } from 'zod';

const myToolSet = {
  firstTool: tool({
    description: 'Greets the user',
    parameters: z.object({ name: z.string() }),
    execute: async ({ name }) => `Hello, ${name}!`,
  }),
  secondTool: tool({
    description: 'Tells the user their age',
    parameters: z.object({ age: z.number() }),
    execute: async ({ age }) => `You are ${age} years old!`,
  }),
};

type MyToolCall = ToolCallUnion<typeof myToolSet>;
type MyToolResult = ToolResultUnion<typeof myToolSet>;

async function generateSomething(prompt: string): Promise<{
  text: string;
  toolCalls: Array<MyToolCall>; // typed tool calls
  toolResults: Array<MyToolResult>; // typed tool results
}> {
  return generateText({
    model: openai('gpt-4o'),
    tools: myToolSet,
    prompt,
  });
}
Handling Errors
The AI SDK has three tool-call related errors:

NoSuchToolError: the model tries to call a tool that is not defined in the tools object
InvalidToolArgumentsError: the model calls a tool with arguments that do not match the tool's parameters
ToolExecutionError: an error that occurred during tool execution
ToolCallRepairError: an error that occurred during tool call repair
generateText
generateText throws errors and can be handled using a try/catch block:


try {
  const result = await generateText({
    //...
  });
} catch (error) {
  if (NoSuchToolError.isInstance(error)) {
    // handle the no such tool error
  } else if (InvalidToolArgumentsError.isInstance(error)) {
    // handle the invalid tool arguments error
  } else if (ToolExecutionError.isInstance(error)) {
    // handle the tool execution error
  } else {
    // handle other errors
  }
}
streamText
streamText sends the errors as part of the full stream. The error parts contain the error object.

When using toDataStreamResponse, you can pass an getErrorMessage function to extract the error message from the error part and forward it as part of the data stream response:


const result = streamText({
  // ...
});

return result.toDataStreamResponse({
  getErrorMessage: error => {
    if (NoSuchToolError.isInstance(error)) {
      return 'The model tried to call a unknown tool.';
    } else if (InvalidToolArgumentsError.isInstance(error)) {
      return 'The model called a tool with invalid arguments.';
    } else if (ToolExecutionError.isInstance(error)) {
      return 'An error occurred during tool execution.';
    } else {
      return 'An unknown error occurred.';
    }
  },
});
Tool Call Repair
The tool call repair feature is experimental and may change in the future.

Language models sometimes fail to generate valid tool calls, especially when the parameters are complex or the model is smaller.

You can use the experimental_repairToolCall function to attempt to repair the tool call with a custom function.

You can use different strategies to repair the tool call:

Use a model with structured outputs to generate the arguments.
Send the messages, system prompt, and tool schema to a stronger model to generate the arguments.
Provide more specific repair instructions based on which tool was called.
Example: Use a model with structured outputs for repair

import { openai } from '@ai-sdk/openai';
import { generateObject, generateText, NoSuchToolError, tool } from 'ai';

const result = await generateText({
  model,
  tools,
  prompt,

  experimental_repairToolCall: async ({
    toolCall,
    tools,
    parameterSchema,
    error,
  }) => {
    if (NoSuchToolError.isInstance(error)) {
      return null; // do not attempt to fix invalid tool names
    }

    const tool = tools[toolCall.toolName as keyof typeof tools];

    const { object: repairedArgs } = await generateObject({
      model: openai('gpt-4o', { structuredOutputs: true }),
      schema: tool.parameters,
      prompt: [
        `The model tried to call the tool "${toolCall.toolName}"` +
          ` with the following arguments:`,
        JSON.stringify(toolCall.args),
        `The tool accepts the following schema:`,
        JSON.stringify(parameterSchema(toolCall)),
        'Please fix the arguments.',
      ].join('\n'),
    });

    return { ...toolCall, args: JSON.stringify(repairedArgs) };
  },
});
Example: Use the re-ask strategy for repair

import { openai } from '@ai-sdk/openai';
import { generateObject, generateText, NoSuchToolError, tool } from 'ai';

const result = await generateText({
  model,
  tools,
  prompt,

  experimental_repairToolCall: async ({
    toolCall,
    tools,
    error,
    messages,
    system,
  }) => {
    const result = await generateText({
      model,
      system,
      messages: [
        ...messages,
        {
          role: 'assistant',
          content: [
            {
              type: 'tool-call',
              toolCallId: toolCall.toolCallId,
              toolName: toolCall.toolName,
              args: toolCall.args,
            },
          ],
        },
        {
          role: 'tool' as const,
          content: [
            {
              type: 'tool-result',
              toolCallId: toolCall.toolCallId,
              toolName: toolCall.toolName,
              result: error.message,
            },
          ],
        },
      ],
      tools,
    });

    const newToolCall = result.toolCalls.find(
      newToolCall => newToolCall.toolName === toolCall.toolName,
    );

    return newToolCall != null
      ? {
          toolCallType: 'function' as const,
          toolCallId: toolCall.toolCallId,
          toolName: toolCall.toolName,
          args: JSON.stringify(newToolCall.args),
        }
      : null;
  },
});
Active Tools
The activeTools property is experimental and may change in the future.

Language models can only handle a limited number of tools at a time, depending on the model. To allow for static typing using a large number of tools and limiting the available tools to the model at the same time, the AI SDK provides the experimental_activeTools property.

It is an array of tool names that are currently active. By default, the value is undefined and all tools are active.


import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

const { text } = await generateText({
  model: openai('gpt-4o'),
  tools: myToolSet,
  experimental_activeTools: ['firstTool'],
});
Multi-modal Tool Results
Multi-modal tool results are experimental and only supported by Anthropic.

In order to send multi-modal tool results, e.g. screenshots, back to the model, they need to be converted into a specific format.

AI SDK Core tools have an optional experimental_toToolResultContent function that converts the tool result into a content part.

Here is an example for converting a screenshot into a content part:


const result = await generateText({
  model: anthropic('claude-3-5-sonnet-20241022'),
  tools: {
    computer: anthropic.tools.computer_20241022({
      // ...
      async execute({ action, coordinate, text }) {
        switch (action) {
          case 'screenshot': {
            return {
              type: 'image',
              data: fs
                .readFileSync('./data/screenshot-editor.png')
                .toString('base64'),
            };
          }
          default: {
            return `executed ${action}`;
          }
        }
      },

      // map to tool result content for LLM consumption:
      experimental_toToolResultContent(result) {
        return typeof result === 'string'
          ? [{ type: 'text', text: result }]
          : [{ type: 'image', data: result.data, mimeType: 'image/png' }];
      },
    }),
  },
  // ...
});
Extracting Tools
Once you start having many tools, you might want to extract them into separate files. The tool helper function is crucial for this, because it ensures correct type inference.

Here is an example of an extracted tool:

tools/weather-tool.ts

import { tool } from 'ai';
import { z } from 'zod';

// the `tool` helper function ensures correct type inference:
export const weatherTool = tool({
  description: 'Get the weather in a location',
  parameters: z.object({
    location: z.string().describe('The location to get the weather for'),
  }),
  execute: async ({ location }) => ({
    location,
    temperature: 72 + Math.floor(Math.random() * 21) - 10,
  }),
});
MCP Tools
The MCP tools feature is experimental and may change in the future.

The AI SDK supports connecting to Model Context Protocol (MCP) servers to access their tools. This enables your AI applications to discover and use tools across various services through a standardized interface.

Initializing an MCP Client
Create an MCP client using either:

SSE (Server-Sent Events): Uses HTTP-based real-time communication, better suited for remote servers that need to send data over the network
stdio: Uses standard input and output streams for communication, ideal for local tool servers running on the same machine (like CLI tools or local services)
Custom transport: Bring your own transport by implementing the MCPTransport interface, ideal when implementing transports from MCP's official Typescript SDK (e.g. StreamableHTTPClientTransport)
SSE Transport
The SSE can be configured using a simple object with a type and url property:


import { experimental_createMCPClient as createMCPClient } from 'ai';

const mcpClient = await createMCPClient({
  transport: {
    type: 'sse',
    url: 'https://my-server.com/sse',

    // optional: configure HTTP headers, e.g. for authentication
    headers: {
      Authorization: 'Bearer my-api-key',
    },
  },
});
Stdio Transport
The Stdio transport requires importing the StdioMCPTransport class from the ai/mcp-stdio package:


import { experimental_createMCPClient as createMCPClient } from 'ai';
import { Experimental_StdioMCPTransport as StdioMCPTransport } from 'ai/mcp-stdio';

const mcpClient = await createMCPClient({
  transport: new StdioMCPTransport({
    command: 'node',
    args: ['src/stdio/dist/server.js'],
  }),
});
Custom Transport
You can also bring your own transport, as long as it implements the MCPTransport interface. Below is an example of using the new StreamableHTTPClientTransport from MCP's official Typescript SDK:


import {
  MCPTransport,
  experimental_createMCPClient as createMCPClient,
} from 'ai';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp';

const url = new URL('http://localhost:3000/mcp');
const mcpClient = await createMCPClient({
  transport: new StreamableHTTPClientTransport(url, {
    sessionId: 'session_123',
  }),
});
The client returned by the experimental_createMCPClient function is a lightweight client intended for use in tool conversion. It currently does not support all features of the full MCP client, such as: authorization, session management, resumable streams, and receiving notifications.

Closing the MCP Client
After initialization, you should close the MCP client based on your usage pattern:

For short-lived usage (e.g., single requests), close the client when the response is finished
For long-running clients (e.g., command line apps), keep the client open but ensure it's closed when the application terminates
When streaming responses, you can close the client when the LLM response has finished. For example, when using streamText, you should use the onFinish callback:


const mcpClient = await experimental_createMCPClient({
  // ...
});

const tools = await mcpClient.tools();

const result = await streamText({
  model: openai('gpt-4o'),
  tools,
  prompt: 'What is the weather in Brooklyn, New York?',
  onFinish: async () => {
    await mcpClient.close();
  },
});
When generating responses without streaming, you can use try/finally or cleanup functions in your framework:


let mcpClient: MCPClient | undefined;

try {
  mcpClient = await experimental_createMCPClient({
    // ...
  });
} finally {
  await mcpClient?.close();
}
Using MCP Tools
The client's tools method acts as an adapter between MCP tools and AI SDK tools. It supports two approaches for working with tool schemas:

Schema Discovery
The simplest approach where all tools offered by the server are listed, and input parameter types are inferred based the schemas provided by the server:


const tools = await mcpClient.tools();
Pros:

Simpler to implement
Automatically stays in sync with server changes
Cons:

No TypeScript type safety during development
No IDE autocompletion for tool parameters
Errors only surface at runtime
Loads all tools from the server
Schema Definition
You can also define the tools and their input schemas explicitly in your client code:


import { z } from 'zod';

const tools = await mcpClient.tools({
  schemas: {
    'get-data': {
      parameters: z.object({
        query: z.string().describe('The data query'),
        format: z.enum(['json', 'text']).optional(),
      }),
    },
    // For tools with zero arguments, you should use an empty object:
    'tool-with-no-args': {
      parameters: z.object({}),
    },
  },
});
Pros:

Control over which tools are loaded
Full TypeScript type safety
Better IDE support with autocompletion
Catch parameter mismatches during development
Cons:

Need to manually keep schemas in sync with server
More code to maintain
When you define schemas, the client will only pull the explicitly defined tools, even if the server offers additional tools. This can be beneficial for:

Keeping your application focused on the tools it needs
Reducing unnecessary tool loading
Making your tool dependencies explicit