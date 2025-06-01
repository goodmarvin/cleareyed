AI SDK UI
AI SDK UI is designed to help you build interactive chat, completion, and assistant applications with ease. It is a framework-agnostic toolkit, streamlining the integration of advanced AI functionalities into your applications.

AI SDK UI provides robust abstractions that simplify the complex tasks of managing chat streams and UI updates on the frontend, enabling you to develop dynamic AI-driven interfaces more efficiently. With four main hooks — useChat, useCompletion, useObject, and useAssistant — you can incorporate real-time chat capabilities, text completions, streamed JSON, and interactive assistant features into your app.

useChat offers real-time streaming of chat messages, abstracting state management for inputs, messages, loading, and errors, allowing for seamless integration into any UI design.
useCompletion enables you to handle text completions in your applications, managing the prompt input and automatically updating the UI as new completions are streamed.
useObject is a hook that allows you to consume streamed JSON objects, providing a simple way to handle and display structured data in your application.
useAssistant is designed to facilitate interaction with OpenAI-compatible assistant APIs, managing UI state and updating it automatically as responses are streamed.
These hooks are designed to reduce the complexity and time required to implement AI interactions, letting you focus on creating exceptional user experiences.

Chatbot
The useChat hook makes it effortless to create a conversational user interface for your chatbot application. It enables the streaming of chat messages from your AI provider, manages the chat state, and updates the UI automatically as new messages arrive.

To summarize, the useChat hook provides the following features:

Message Streaming: All the messages from the AI provider are streamed to the chat UI in real-time.
Managed States: The hook manages the states for input, messages, status, error and more for you.
Seamless Integration: Easily integrate your chat AI into any design or layout with minimal effort.
In this guide, you will learn how to use the useChat hook to create a chatbot application with real-time message streaming. Check out our chatbot with tools guide to learn how to use tools in your chatbot. Let's start with the following example first.

Example
app/page.tsx

'use client';

import { useChat } from '@ai-sdk/react';

export default function Page() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({});

  return (
    <>
      {messages.map(message => (
        <div key={message.id}>
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.content}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input name="prompt" value={input} onChange={handleInputChange} />
        <button type="submit">Submit</button>
      </form>
    </>
  );
}
app/api/chat/route.ts

import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4-turbo'),
    system: 'You are a helpful assistant.',
    messages,
  });

  return result.toDataStreamResponse();
}
The UI messages have a new parts property that contains the message parts. We recommend rendering the messages using the parts property instead of the content property. The parts property supports different message types, including text, tool invocation, and tool result, and allows for more flexible and complex chat UIs.

In the Page component, the useChat hook will request to your AI provider endpoint whenever the user submits a message. The messages are then streamed back in real-time and displayed in the chat UI.

This enables a seamless chat experience where the user can see the AI response as soon as it is available, without having to wait for the entire response to be received.

Customized UI
useChat also provides ways to manage the chat message and input states via code, show status, and update messages without being triggered by user interactions.

Status
The useChat hook returns a status. It has the following possible values:

submitted: The message has been sent to the API and we're awaiting the start of the response stream.
streaming: The response is actively streaming in from the API, receiving chunks of data.
ready: The full response has been received and processed; a new user message can be submitted.
error: An error occurred during the API request, preventing successful completion.
You can use status for e.g. the following purposes:

To show a loading spinner while the chatbot is processing the user's message.
To show a "Stop" button to abort the current message.
To disable the submit button.
app/page.tsx

'use client';

import { useChat } from '@ai-sdk/react';

export default function Page() {
  const { messages, input, handleInputChange, handleSubmit, status, stop } =
    useChat({});

  return (
    <>
      {messages.map(message => (
        <div key={message.id}>
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.content}
        </div>
      ))}

      {(status === 'submitted' || status === 'streaming') && (
        <div>
          {status === 'submitted' && <Spinner />}
          <button type="button" onClick={() => stop()}>
            Stop
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          name="prompt"
          value={input}
          onChange={handleInputChange}
          disabled={status !== 'ready'}
        />
        <button type="submit">Submit</button>
      </form>
    </>
  );
}
Error State
Similarly, the error state reflects the error object thrown during the fetch request. It can be used to display an error message, disable the submit button, or show a retry button:

We recommend showing a generic error message to the user, such as "Something went wrong." This is a good practice to avoid leaking information from the server.


'use client';

import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, error, reload } =
    useChat({});

  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          {m.role}: {m.content}
        </div>
      ))}

      {error && (
        <>
          <div>An error occurred.</div>
          <button type="button" onClick={() => reload()}>
            Retry
          </button>
        </>
      )}

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          disabled={error != null}
        />
      </form>
    </div>
  );
}
Please also see the error handling guide for more information.

Modify messages
Sometimes, you may want to directly modify some existing messages. For example, a delete button can be added to each message to allow users to remove them from the chat history.

The setMessages function can help you achieve these tasks:


const { messages, setMessages, ... } = useChat()

const handleDelete = (id) => {
  setMessages(messages.filter(message => message.id !== id))
}

return <>
  {messages.map(message => (
    <div key={message.id}>
      {message.role === 'user' ? 'User: ' : 'AI: '}
      {message.content}
      <button onClick={() => handleDelete(message.id)}>Delete</button>
    </div>
  ))}
  ...
You can think of messages and setMessages as a pair of state and setState in React.

Controlled input
In the initial example, we have handleSubmit and handleInputChange callbacks that manage the input changes and form submissions. These are handy for common use cases, but you can also use uncontrolled APIs for more advanced scenarios such as form validation or customized components.

The following example demonstrates how to use more granular APIs like setInput and append with your custom input and submit button components:


const { input, setInput, append } = useChat()

return <>
  <MyCustomInput value={input} onChange={value => setInput(value)} />
  <MySubmitButton onClick={() => {
    // Send a new message to the AI provider
    append({
      role: 'user',
      content: input,
    })
  }}/>
  ...
Cancellation and regeneration
It's also a common use case to abort the response message while it's still streaming back from the AI provider. You can do this by calling the stop function returned by the useChat hook.


const { stop, status, ... } = useChat()

return <>
  <button onClick={stop} disabled={!(status === 'streaming' || status === 'submitted')}>Stop</button>
  ...
When the user clicks the "Stop" button, the fetch request will be aborted. This avoids consuming unnecessary resources and improves the UX of your chatbot application.

Similarly, you can also request the AI provider to reprocess the last message by calling the reload function returned by the useChat hook:


const { reload, status, ... } = useChat()

return <>
  <button onClick={reload} disabled={!(status === 'ready' || status === 'error')}>Regenerate</button>
  ...
</>
When the user clicks the "Regenerate" button, the AI provider will regenerate the last message and replace the current one correspondingly.

Throttling UI Updates
This feature is currently only available for React.
By default, the useChat hook will trigger a render every time a new chunk is received. You can throttle the UI updates with the experimental_throttle option.

page.tsx

const { messages, ... } = useChat({
  // Throttle the messages and data updates to 50ms:
  experimental_throttle: 50
})
Event Callbacks
useChat provides optional event callbacks that you can use to handle different stages of the chatbot lifecycle:

onFinish: Called when the assistant message is completed
onError: Called when an error occurs during the fetch request.
onResponse: Called when the response from the API is received.
These callbacks can be used to trigger additional actions, such as logging, analytics, or custom UI updates.


import { Message } from '@ai-sdk/react';

const {
  /* ... */
} = useChat({
  onFinish: (message, { usage, finishReason }) => {
    console.log('Finished streaming message:', message);
    console.log('Token usage:', usage);
    console.log('Finish reason:', finishReason);
  },
  onError: error => {
    console.error('An error occurred:', error);
  },
  onResponse: response => {
    console.log('Received HTTP response from server:', response);
  },
});
It's worth noting that you can abort the processing by throwing an error in the onResponse callback. This will trigger the onError callback and stop the message from being appended to the chat UI. This can be useful for handling unexpected responses from the AI provider.

Request Configuration
Custom headers, body, and credentials
By default, the useChat hook sends a HTTP POST request to the /api/chat endpoint with the message list as the request body. You can customize the request by passing additional options to the useChat hook:


const { messages, input, handleInputChange, handleSubmit } = useChat({
  api: '/api/custom-chat',
  headers: {
    Authorization: 'your_token',
  },
  body: {
    user_id: '123',
  },
  credentials: 'same-origin',
});
In this example, the useChat hook sends a POST request to the /api/custom-chat endpoint with the specified headers, additional body fields, and credentials for that fetch request. On your server side, you can handle the request with these additional information.

Setting custom body fields per request
You can configure custom body fields on a per-request basis using the body option of the handleSubmit function. This is useful if you want to pass in additional information to your backend that is not part of the message list.

app/page.tsx

'use client';

import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          {m.role}: {m.content}
        </div>
      ))}

      <form
        onSubmit={event => {
          handleSubmit(event, {
            body: {
              customKey: 'customValue',
            },
          });
        }}
      >
        <input value={input} onChange={handleInputChange} />
      </form>
    </div>
  );
}
You can retrieve these custom fields on your server side by destructuring the request body:

app/api/chat/route.ts

export async function POST(req: Request) {
  // Extract addition information ("customKey") from the body of the request:
  const { messages, customKey } = await req.json();
  //...
}
Controlling the response stream
With streamText, you can control how error messages and usage information are sent back to the client.

Error Messages
By default, the error message is masked for security reasons. The default error message is "An error occurred." You can forward error messages or send your own error message by providing a getErrorMessage function:

app/api/chat/route.ts

import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
  });

  return result.toDataStreamResponse({
    getErrorMessage: error => {
      if (error == null) {
        return 'unknown error';
      }

      if (typeof error === 'string') {
        return error;
      }

      if (error instanceof Error) {
        return error.message;
      }

      return JSON.stringify(error);
    },
  });
}
Usage Information
By default, the usage information is sent back to the client. You can disable it by setting the sendUsage option to false:

app/api/chat/route.ts

import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
  });

  return result.toDataStreamResponse({
    sendUsage: false,
  });
}
Text Streams
useChat can handle plain text streams by setting the streamProtocol option to text:

app/page.tsx

'use client';

import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages } = useChat({
    streamProtocol: 'text',
  });

  return <>...</>;
}
This configuration also works with other backend servers that stream plain text. Check out the stream protocol guide for more information.

When using streamProtocol: 'text', tool calls, usage information and finish reasons are not available.

Empty Submissions
You can configure the useChat hook to allow empty submissions by setting the allowEmptySubmit option to true.

app/page.tsx

'use client';

import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          {m.role}: {m.content}
        </div>
      ))}

      <form
        onSubmit={event => {
          handleSubmit(event, {
            allowEmptySubmit: true,
          });
        }}
      >
        <input value={input} onChange={handleInputChange} />
      </form>
    </div>
  );
}
Reasoning
Some models such as as DeepSeek deepseek-reasoner and Anthropic claude-3-7-sonnet-20250219 support reasoning tokens. These tokens are typically sent before the message content. You can forward them to the client with the sendReasoning option:

app/api/chat/route.ts

import { deepseek } from '@ai-sdk/deepseek';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: deepseek('deepseek-reasoner'),
    messages,
  });

  return result.toDataStreamResponse({
    sendReasoning: true,
  });
}
On the client side, you can access the reasoning parts of the message object.

They have a details property that contains the reasoning and redacted reasoning parts. You can also use reasoning to access just the reasoning as a string.

app/page.tsx

messages.map(message => (
  <div key={message.id}>
    {message.role === 'user' ? 'User: ' : 'AI: '}
    {message.parts.map((part, index) => {
      // text parts:
      if (part.type === 'text') {
        return <div key={index}>{part.text}</div>;
      }

      // reasoning parts:
      if (part.type === 'reasoning') {
        return (
          <pre key={index}>
            {part.details.map(detail =>
              detail.type === 'text' ? detail.text : '<redacted>',
            )}
          </pre>
        );
      }
    })}
  </div>
));
Sources
Some providers such as Perplexity and Google Generative AI include sources in the response.

Currently sources are limited to web pages that ground the response. You can forward them to the client with the sendSources option:

app/api/chat/route.ts

import { perplexity } from '@ai-sdk/perplexity';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: perplexity('sonar-pro'),
    messages,
  });

  return result.toDataStreamResponse({
    sendSources: true,
  });
}
On the client side, you can access source parts of the message object. Here is an example that renders the sources as links at the bottom of the message:

app/page.tsx

messages.map(message => (
  <div key={message.id}>
    {message.role === 'user' ? 'User: ' : 'AI: '}
    {message.parts
      .filter(part => part.type !== 'source')
      .map((part, index) => {
        if (part.type === 'text') {
          return <div key={index}>{part.text}</div>;
        }
      })}
    {message.parts
      .filter(part => part.type === 'source')
      .map(part => (
        <span key={`source-${part.source.id}`}>
          [
          <a href={part.source.url} target="_blank">
            {part.source.title ?? new URL(part.source.url).hostname}
          </a>
          ]
        </span>
      ))}
  </div>
));
Image Generation
Some models such as Google gemini-2.0-flash-exp support image generation. When images are generated, they are exposed as files to the client. On the client side, you can access file parts of the message object and render them as images.

app/page.tsx

messages.map(message => (
  <div key={message.id}>
    {message.role === 'user' ? 'User: ' : 'AI: '}
    {message.parts.map((part, index) => {
      if (part.type === 'text') {
        return <div key={index}>{part.text}</div>;
      } else if (part.type === 'file' && part.mimeType.startsWith('image/')) {
        return (
          <img key={index} src={`data:${part.mimeType};base64,${part.data}`} />
        );
      }
    })}
  </div>
));
Attachments (Experimental)
The useChat hook supports sending attachments along with a message as well as rendering them on the client. This can be useful for building applications that involve sending images, files, or other media content to the AI provider.

There are two ways to send attachments with a message, either by providing a FileList object or a list of URLs to the handleSubmit function:

FileList
By using FileList, you can send multiple files as attachments along with a message using the file input element. The useChat hook will automatically convert them into data URLs and send them to the AI provider.

Currently, only image/* and text/* content types get automatically converted into multi-modal content parts. You will need to handle other content types manually.

app/page.tsx

'use client';

import { useChat } from '@ai-sdk/react';
import { useRef, useState } from 'react';

export default function Page() {
  const { messages, input, handleSubmit, handleInputChange, status } =
    useChat();

  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <div>
        {messages.map(message => (
          <div key={message.id}>
            <div>{`${message.role}: `}</div>

            <div>
              {message.content}

              <div>
                {message.experimental_attachments
                  ?.filter(attachment =>
                    attachment.contentType.startsWith('image/'),
                  )
                  .map((attachment, index) => (
                    <img
                      key={`${message.id}-${index}`}
                      src={attachment.url}
                      alt={attachment.name}
                    />
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={event => {
          handleSubmit(event, {
            experimental_attachments: files,
          });

          setFiles(undefined);

          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }}
      >
        <input
          type="file"
          onChange={event => {
            if (event.target.files) {
              setFiles(event.target.files);
            }
          }}
          multiple
          ref={fileInputRef}
        />
        <input
          value={input}
          placeholder="Send message..."
          onChange={handleInputChange}
          disabled={status !== 'ready'}
        />
      </form>
    </div>
  );
}
URLs
You can also send URLs as attachments along with a message. This can be useful for sending links to external resources or media content.

Note: The URL can also be a data URL, which is a base64-encoded string that represents the content of a file. Currently, only image/* content types get automatically converted into multi-modal content parts. You will need to handle other content types manually.

app/page.tsx

'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { Attachment } from '@ai-sdk/ui-utils';

export default function Page() {
  const { messages, input, handleSubmit, handleInputChange, status } =
    useChat();

  const [attachments] = useState<Attachment[]>([
    {
      name: 'earth.png',
      contentType: 'image/png',
      url: 'https://example.com/earth.png',
    },
    {
      name: 'moon.png',
      contentType: 'image/png',
      url: 'data:image/png;base64,iVBORw0KGgo...',
    },
  ]);

  return (
    <div>
      <div>
        {messages.map(message => (
          <div key={message.id}>
            <div>{`${message.role}: `}</div>

            <div>
              {message.content}

              <div>
                {message.experimental_attachments
                  ?.filter(attachment =>
                    attachment.contentType?.startsWith('image/'),
                  )
                  .map((attachment, index) => (
                    <img
                      key={`${message.id}-${index}`}
                      src={attachment.url}
                      alt={attachment.name}
                    />
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={event => {
          handleSubmit(event, {
            experimental_attachments: attachments,
          });
        }}
      >
        <input
          value={input}
          placeholder="Send message..."
          onChange={handleInputChange}
          disabled={status !== 'ready'}
        />
      </form>
    </div>
  );
}

Chatbot Message Persistence
Being able to store and load chat messages is crucial for most AI chatbots. In this guide, we'll show how to implement message persistence with useChat and streamText.

This guide does not cover authorization, error handling, or other real-world considerations. It is intended to be a simple example of how to implement message persistence.

Starting a new chat
When the user navigates to the chat page without providing a chat ID, we need to create a new chat and redirect to the chat page with the new chat ID.

app/chat/page.tsx

import { redirect } from 'next/navigation';
import { createChat } from '@tools/chat-store';

export default async function Page() {
  const id = await createChat(); // create a new chat
  redirect(`/chat/${id}`); // redirect to chat page, see below
}
Our example chat store implementation uses files to store the chat messages. In a real-world application, you would use a database or a cloud storage service, and get the chat ID from the database. That being said, the function interfaces are designed to be easily replaced with other implementations.

tools/chat-store.ts

import { generateId } from 'ai';
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function createChat(): Promise<string> {
  const id = generateId(); // generate a unique chat ID
  await writeFile(getChatFile(id), '[]'); // create an empty chat file
  return id;
}

function getChatFile(id: string): string {
  const chatDir = path.join(process.cwd(), '.chats');
  if (!existsSync(chatDir)) mkdirSync(chatDir, { recursive: true });
  return path.join(chatDir, `${id}.json`);
}
Loading an existing chat
When the user navigates to the chat page with a chat ID, we need to load the chat messages and display them.

app/chat/[id]/page.tsx

import { loadChat } from '@tools/chat-store';
import Chat from '@ui/chat';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params; // get the chat ID from the URL
  const messages = await loadChat(id); // load the chat messages
  return <Chat id={id} initialMessages={messages} />; // display the chat
}
The loadChat function in our file-based chat store is implemented as follows:

tools/chat-store.ts

import { Message } from 'ai';
import { readFile } from 'fs/promises';

export async function loadChat(id: string): Promise<Message[]> {
  return JSON.parse(await readFile(getChatFile(id), 'utf8'));
}

// ... rest of the file
The display component is a simple chat component that uses the useChat hook to send and receive messages:

ui/chat.tsx

'use client';

import { Message, useChat } from '@ai-sdk/react';

export default function Chat({
  id,
  initialMessages,
}: { id?: string | undefined; initialMessages?: Message[] } = {}) {
  const { input, handleInputChange, handleSubmit, messages } = useChat({
    id, // use the provided chat ID
    initialMessages, // initial messages if provided
    sendExtraMessageFields: true, // send id and createdAt for each message
  });

  // simplified rendering code, extend as needed:
  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          {m.role === 'user' ? 'User: ' : 'AI: '}
          {m.content}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
      </form>
    </div>
  );
}
Storing messages
useChat sends the chat id and the messages to the backend. We have enabled the sendExtraMessageFields option to send the id and createdAt fields, meaning that we store messages in the useChat message format.

The useChat message format is different from the CoreMessage format. The useChat message format is designed for frontend display, and contains additional fields such as id and createdAt. We recommend storing the messages in the useChat message format.

Storing messages is done in the onFinish callback of the streamText function. onFinish receives the messages from the AI response as a CoreMessage[], and we use the appendResponseMessages helper to append the AI response messages to the chat messages.

app/api/chat/route.ts

import { openai } from '@ai-sdk/openai';
import { appendResponseMessages, streamText } from 'ai';
import { saveChat } from '@tools/chat-store';

export async function POST(req: Request) {
  const { messages, id } = await req.json();

  const result = streamText({
    model: openai('gpt-4o-mini'),
    messages,
    async onFinish({ response }) {
      await saveChat({
        id,
        messages: appendResponseMessages({
          messages,
          responseMessages: response.messages,
        }),
      });
    },
  });

  return result.toDataStreamResponse();
}
The actual storage of the messages is done in the saveChat function, which in our file-based chat store is implemented as follows:

tools/chat-store.ts

import { Message } from 'ai';
import { writeFile } from 'fs/promises';

export async function saveChat({
  id,
  messages,
}: {
  id: string;
  messages: Message[];
}): Promise<void> {
  const content = JSON.stringify(messages, null, 2);
  await writeFile(getChatFile(id), content);
}

// ... rest of the file
Message IDs
In addition to a chat ID, each message has an ID. You can use this message ID to e.g. manipulate individual messages.

The IDs for user messages are generated by the useChat hook on the client, and the IDs for AI response messages are generated by streamText.

You can control the ID format by providing ID generators (see createIdGenerator():

ui/chat.tsx

import { createIdGenerator } from 'ai';
import { useChat } from '@ai-sdk/react';

const {
  // ...
} = useChat({
  // ...
  // id format for client-side messages:
  generateId: createIdGenerator({
    prefix: 'msgc',
    size: 16,
  }),
});
app/api/chat/route.ts

import { createIdGenerator, streamText } from 'ai';

export async function POST(req: Request) {
  // ...
  const result = streamText({
    // ...
    // id format for server-side messages:
    experimental_generateMessageId: createIdGenerator({
      prefix: 'msgs',
      size: 16,
    }),
  });
  // ...
}
Sending only the last message
Once you have implemented message persistence, you might want to send only the last message to the server. This reduces the amount of data sent to the server on each request and can improve performance.

To achieve this, you can provide an experimental_prepareRequestBody function to the useChat hook (React only). This function receives the messages and the chat ID, and returns the request body to be sent to the server.

ui/chat.tsx

import { useChat } from '@ai-sdk/react';

const {
  // ...
} = useChat({
  // ...
  // only send the last message to the server:
  experimental_prepareRequestBody({ messages, id }) {
    return { message: messages[messages.length - 1], id };
  },
});
On the server, you can then load the previous messages and append the new message to the previous messages:

app/api/chat/route.ts

import { appendClientMessage } from 'ai';

export async function POST(req: Request) {
  // get the last message from the client:
  const { message, id } = await req.json();

  // load the previous messages from the server:
  const previousMessages = await loadChat(id);

  // append the new message to the previous messages:
  const messages = appendClientMessage({
    messages: previousMessages,
    message,
  });

  const result = streamText({
    // ...
    messages,
  });

  // ...
}
Handling client disconnects
By default, the AI SDK streamText function uses backpressure to the language model provider to prevent the consumption of tokens that are not yet requested.

However, this means that when the client disconnects, e.g. by closing the browser tab or because of a network issue, the stream from the LLM will be aborted and the conversation may end up in a broken state.

Assuming that you have a storage solution in place, you can use the consumeStream method to consume the stream on the backend, and then save the result as usual. consumeStream effectively removes the backpressure, meaning that the result is stored even when the client has already disconnected.

app/api/chat/route.ts

import { appendResponseMessages, streamText } from 'ai';
import { saveChat } from '@tools/chat-store';

export async function POST(req: Request) {
  const { messages, id } = await req.json();

  const result = streamText({
    model,
    messages,
    async onFinish({ response }) {
      await saveChat({
        id,
        messages: appendResponseMessages({
          messages,
          responseMessages: response.messages,
        }),
      });
    },
  });

  // consume the stream to ensure it runs to completion & triggers onFinish
  // even when the client response is aborted:
  result.consumeStream(); // no await

  return result.toDataStreamResponse();
}
When the client reloads the page after a disconnect, the chat will be restored from the storage solution.

In production applications, you would also track the state of the request (in progress, complete) in your stored messages and use it on the client to cover the case where the client reloads the page after a disconnection, but the streaming is not yet complete.

Resuming ongoing streams
This feature is experimental and may change in future versions.
The useChat hook has experimental support for resuming an ongoing chat generation stream by any client, either after a network disconnect or by reloading the chat page. This can be useful for building applications that involve long-running conversations or for ensuring that messages are not lost in case of network failures.

The following are the pre-requisities for your chat application to support resumable streams:

Installing the resumable-stream package that helps create and manage the publisher/subscriber mechanism of the streams.
Creating a Redis instance to store the stream state.
Creating a table that tracks the stream IDs associated with a chat.
To resume a chat stream, you will use the experimental_resume function returned by the useChat hook. You will call this function during the initial mount of the hook inside the main chat component.

app/components/chat.tsx

'use client';

import { useChat } from '@ai-sdk/react';
import { Input } from '@/components/input';
import { Messages } from '@/components/messages';

export function Chat() {
  const { experimental_resume } = useChat({ id });

  useEffect(() => {
    experimental_resume();

    // we use an empty dependency array to
    // ensure this effect runs only once
  }, []);

  return (
    <div>
      <Messages />
      <Input />
    </div>
  );
}
For a more resilient implementation that handles race conditions that can occur in-flight during a resume request, you can use the following useAutoResume hook. This will automatically process the append-message SSE data part streamed by the server.

app/hooks/use-auto-resume.ts

'use client';

import { useEffect } from 'react';
import type { UIMessage } from 'ai';
import type { UseChatHelpers } from '@ai-sdk/react';

export type DataPart = { type: 'append-message'; message: string };

export interface Props {
  autoResume: boolean;
  initialMessages: UIMessage[];
  experimental_resume: UseChatHelpers['experimental_resume'];
  data: UseChatHelpers['data'];
  setMessages: UseChatHelpers['setMessages'];
}

export function useAutoResume({
  autoResume,
  initialMessages,
  experimental_resume,
  data,
  setMessages,
}: Props) {
  useEffect(() => {
    if (!autoResume) return;

    const mostRecentMessage = initialMessages.at(-1);

    if (mostRecentMessage?.role === 'user') {
      experimental_resume();
    }

    // we intentionally run this once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const dataPart = data[0] as DataPart;

    if (dataPart.type === 'append-message') {
      const message = JSON.parse(dataPart.message) as UIMessage;
      setMessages([...initialMessages, message]);
    }
  }, [data, initialMessages, setMessages]);
}
You can then use this hook in your chat component as follows.

app/components/chat.tsx

'use client';

import { useChat } from '@ai-sdk/react';
import { Input } from '@/components/input';
import { Messages } from '@/components/messages';
import { useAutoResume } from '@/hooks/use-auto-resume';

export function Chat() {
  const { experimental_resume, data, setMessages } = useChat({ id });

  useAutoResume({
    autoResume: true,
    initialMessages: [],
    experimental_resume,
    data,
    setMessages,
  });

  return (
    <div>
      <Messages />
      <Input />
    </div>
  );
}
The experimental_resume function makes a GET request to your configured chat endpoint (or /api/chat by default) whenever your client calls it. If there’s an active stream, it will pick up where it left off, otherwise it simply finishes without error.

The GET request automatically appends the chatId query parameter to the URL to help identify the chat the request belongs to. Using the chatId, you can look up the most recent stream ID from the database and resume the stream.


GET /api/chat?chatId=<your-chat-id>
Earlier, you must've implemented the POST handler for the /api/chat route to create new chat generations. When using experimental_resume, you must also implement the GET handler for /api/chat route to resume streams.

1. Implement the GET handler
Add a GET method to /api/chat that:

Reads chatId from the query string
Validates it’s present
Loads any stored stream IDs for that chat
Returns the latest one to streamContext.resumableStream()
Falls back to an empty stream if it’s already closed
app/api/chat/route.ts

import { loadStreams } from '@/util/chat-store';
import { createDataStream, getMessagesByChatId } from 'ai';
import { after } from 'next/server';
import { createResumableStreamContext } from 'resumable-stream';

const streamContext = createResumableStreamContext({
  waitUntil: after,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    return new Response('id is required', { status: 400 });
  }

  const streamIds = await loadStreams(chatId);

  if (!streamIds.length) {
    return new Response('No streams found', { status: 404 });
  }

  const recentStreamId = streamIds.at(-1);

  if (!recentStreamId) {
    return new Response('No recent stream found', { status: 404 });
  }

  const emptyDataStream = createDataStream({
    execute: () => {},
  });

  const stream = await streamContext.resumableStream(
    recentStreamId,
    () => emptyDataStream,
  );

  if (stream) {
    return new Response(stream, { status: 200 });
  }

  /*
   * For when the generation is "active" during SSR but the
   * resumable stream has concluded after reaching this point.
   */

  const messages = await getMessagesByChatId({ id: chatId });
  const mostRecentMessage = messages.at(-1);

  if (!mostRecentMessage || mostRecentMessage.role !== 'assistant') {
    return new Response(emptyDataStream, { status: 200 });
  }

  const messageCreatedAt = new Date(mostRecentMessage.createdAt);

  const streamWithMessage = createDataStream({
    execute: buffer => {
      buffer.writeData({
        type: 'append-message',
        message: JSON.stringify(mostRecentMessage),
      });
    },
  });

  return new Response(streamWithMessage, { status: 200 });
}
After you've implemented the GET handler, you can update the POST handler to handle the creation of resumable streams.

2. Update the POST handler
When you create a brand-new chat completion, you must:

Generate a fresh streamId
Persist it alongside your chatId
Kick off a createDataStream that pipes tokens as they arrive
Hand that new stream to streamContext.resumableStream()
app/api/chat/route.ts

import {
  appendResponseMessages,
  createDataStream,
  generateId,
  streamText,
} from 'ai';
import { appendStreamId, saveChat } from '@/util/chat-store';
import { createResumableStreamContext } from 'resumable-stream';

const streamContext = createResumableStreamContext({
  waitUntil: after,
});

async function POST(request: Request) {
  const { id, messages } = await req.json();
  const streamId = generateId();

  // Record this new stream so we can resume later
  await appendStreamId({ chatId: id, streamId });

  // Build the data stream that will emit tokens
  const stream = createDataStream({
    execute: dataStream => {
      const result = streamText({
        model: openai('gpt-4o'),
        messages,
        onFinish: async ({ response }) => {
          await saveChat({
            id,
            messages: appendResponseMessages({
              messages,
              responseMessages: response.messages,
            }),
          });
        },
      });

      // Return a resumable stream to the client
      result.mergeIntoDataStream(dataStream);
    },
  });

  return new Response(
    await streamContext.resumableStream(streamId, () => stream),
  );
}
With both handlers, your clients can now gracefully resume ongoing streams.

Chatbot Tool Usage
With useChat and streamText, you can use tools in your chatbot application. The AI SDK supports three types of tools in this context:

Automatically executed server-side tools
Automatically executed client-side tools
Tools that require user interaction, such as confirmation dialogs
The flow is as follows:

The user enters a message in the chat UI.
The message is sent to the API route.
In your server side route, the language model generates tool calls during the streamText call.
All tool calls are forwarded to the client.
Server-side tools are executed using their execute method and their results are forwarded to the client.
Client-side tools that should be automatically executed are handled with the onToolCall callback. You can return the tool result from the callback.
Client-side tool that require user interactions can be displayed in the UI. The tool calls and results are available as tool invocation parts in the parts property of the last assistant message.
When the user interaction is done, addToolResult can be used to add the tool result to the chat.
When there are tool calls in the last assistant message and all tool results are available, the client sends the updated messages back to the server. This triggers another iteration of this flow.
The tool call and tool executions are integrated into the assistant message as tool invocation parts. A tool invocation is at first a tool call, and then it becomes a tool result when the tool is executed. The tool result contains all information about the tool call as well as the result of the tool execution.

In order to automatically send another request to the server when all tool calls are server-side, you need to set maxSteps to a value greater than 1 in the useChat options. It is disabled by default for backward compatibility.

Example
In this example, we'll use three tools:

getWeatherInformation: An automatically executed server-side tool that returns the weather in a given city.
askForConfirmation: A user-interaction client-side tool that asks the user for confirmation.
getLocation: An automatically executed client-side tool that returns a random city.
API route
app/api/chat/route.ts

import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    tools: {
      // server-side tool with execute function:
      getWeatherInformation: {
        description: 'show the weather in a given city to the user',
        parameters: z.object({ city: z.string() }),
        execute: async ({}: { city: string }) => {
          const weatherOptions = ['sunny', 'cloudy', 'rainy', 'snowy', 'windy'];
          return weatherOptions[
            Math.floor(Math.random() * weatherOptions.length)
          ];
        },
      },
      // client-side tool that starts user interaction:
      askForConfirmation: {
        description: 'Ask the user for confirmation.',
        parameters: z.object({
          message: z.string().describe('The message to ask for confirmation.'),
        }),
      },
      // client-side tool that is automatically executed on the client:
      getLocation: {
        description:
          'Get the user location. Always ask for confirmation before using this tool.',
        parameters: z.object({}),
      },
    },
  });

  return result.toDataStreamResponse();
}
Client-side page
The client-side page uses the useChat hook to create a chatbot application with real-time message streaming. Tool invocations are displayed in the chat UI as tool invocation parts. Please make sure to render the messages using the parts property of the message.

There are three things worth mentioning:

The onToolCall callback is used to handle client-side tools that should be automatically executed. In this example, the getLocation tool is a client-side tool that returns a random city.

The toolInvocations property of the last assistant message contains all tool calls and results. The client-side tool askForConfirmation is displayed in the UI. It asks the user for confirmation and displays the result once the user confirms or denies the execution. The result is added to the chat using addToolResult.

The maxSteps option is set to 5. This enables several tool use iterations between the client and the server.

app/page.tsx

'use client';

import { ToolInvocation } from 'ai';
import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, addToolResult } =
    useChat({
      maxSteps: 5,

      // run client-side tools that are automatically executed:
      async onToolCall({ toolCall }) {
        if (toolCall.toolName === 'getLocation') {
          const cities = [
            'New York',
            'Los Angeles',
            'Chicago',
            'San Francisco',
          ];
          return cities[Math.floor(Math.random() * cities.length)];
        }
      },
    });

  return (
    <>
      {messages?.map(message => (
        <div key={message.id}>
          <strong>{`${message.role}: `}</strong>
          {message.parts.map(part => {
            switch (part.type) {
              // render text parts as simple text:
              case 'text':
                return part.text;

              // for tool invocations, distinguish between the tools and the state:
              case 'tool-invocation': {
                const callId = part.toolInvocation.toolCallId;

                switch (part.toolInvocation.toolName) {
                  case 'askForConfirmation': {
                    switch (part.toolInvocation.state) {
                      case 'call':
                        return (
                          <div key={callId}>
                            {part.toolInvocation.args.message}
                            <div>
                              <button
                                onClick={() =>
                                  addToolResult({
                                    toolCallId: callId,
                                    result: 'Yes, confirmed.',
                                  })
                                }
                              >
                                Yes
                              </button>
                              <button
                                onClick={() =>
                                  addToolResult({
                                    toolCallId: callId,
                                    result: 'No, denied',
                                  })
                                }
                              >
                                No
                              </button>
                            </div>
                          </div>
                        );
                      case 'result':
                        return (
                          <div key={callId}>
                            Location access allowed:{' '}
                            {part.toolInvocation.result}
                          </div>
                        );
                    }
                    break;
                  }

                  case 'getLocation': {
                    switch (part.toolInvocation.state) {
                      case 'call':
                        return <div key={callId}>Getting location...</div>;
                      case 'result':
                        return (
                          <div key={callId}>
                            Location: {part.toolInvocation.result}
                          </div>
                        );
                    }
                    break;
                  }

                  case 'getWeatherInformation': {
                    switch (part.toolInvocation.state) {
                      // example of pre-rendering streaming tool calls:
                      case 'partial-call':
                        return (
                          <pre key={callId}>
                            {JSON.stringify(part.toolInvocation, null, 2)}
                          </pre>
                        );
                      case 'call':
                        return (
                          <div key={callId}>
                            Getting weather information for{' '}
                            {part.toolInvocation.args.city}...
                          </div>
                        );
                      case 'result':
                        return (
                          <div key={callId}>
                            Weather in {part.toolInvocation.args.city}:{' '}
                            {part.toolInvocation.result}
                          </div>
                        );
                    }
                    break;
                  }
                }
              }
            }
          })}
          <br />
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
      </form>
    </>
  );
}
Tool call streaming
You can stream tool calls while they are being generated by enabling the toolCallStreaming option in streamText.

app/api/chat/route.ts

export async function POST(req: Request) {
  // ...

  const result = streamText({
    toolCallStreaming: true,
    // ...
  });

  return result.toDataStreamResponse();
}
When the flag is enabled, partial tool calls will be streamed as part of the data stream. They are available through the useChat hook. The tool invocation parts of assistant messages will also contain partial tool calls. You can use the state property of the tool invocation to render the correct UI.

app/page.tsx

export default function Chat() {
  // ...
  return (
    <>
      {messages?.map(message => (
        <div key={message.id}>
          {message.parts.map(part => {
            if (part.type === 'tool-invocation') {
              switch (part.toolInvocation.state) {
                case 'partial-call':
                  return <>render partial tool call</>;
                case 'call':
                  return <>render full tool call</>;
                case 'result':
                  return <>render tool result</>;
              }
            }
          })}
        </div>
      ))}
    </>
  );
}
Step start parts
When you are using multi-step tool calls, the AI SDK will add step start parts to the assistant messages. If you want to display boundaries between tool invocations, you can use the step-start parts as follows:

app/page.tsx

// ...
// where you render the message parts:
message.parts.map((part, index) => {
  switch (part.type) {
    case 'step-start':
      // show step boundaries as horizontal lines:
      return index > 0 ? (
        <div key={index} className="text-gray-500">
          <hr className="my-2 border-gray-300" />
        </div>
      ) : null;
    case 'text':
    // ...
    case 'tool-invocation':
    // ...
  }
});
// ...
Server-side Multi-Step Calls
You can also use multi-step calls on the server-side with streamText. This works when all invoked tools have an execute function on the server side.

app/api/chat/route.ts

import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    tools: {
      getWeatherInformation: {
        description: 'show the weather in a given city to the user',
        parameters: z.object({ city: z.string() }),
        // tool has execute function:
        execute: async ({}: { city: string }) => {
          const weatherOptions = ['sunny', 'cloudy', 'rainy', 'snowy', 'windy'];
          return weatherOptions[
            Math.floor(Math.random() * weatherOptions.length)
          ];
        },
      },
    },
    maxSteps: 5,
  });

  return result.toDataStreamResponse();
}
Errors
Language models can make errors when calling tools. By default, these errors are masked for security reasons, and show up as "An error occurred" in the UI.

To surface the errors, you can use the getErrorMessage function when calling toDataStreamResponse.


export function errorHandler(error: unknown) {
  if (error == null) {
    return 'unknown error';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return JSON.stringify(error);
}

const result = streamText({
  // ...
});

return result.toDataStreamResponse({
  getErrorMessage: errorHandler,
});
In case you are using createDataStreamResponse, you can use the onError function when calling toDataStreamResponse:


const response = createDataStreamResponse({
  // ...
  async execute(dataStream) {
    // ...
  },
  onError: error => `Custom error: ${error.message}`,
});


Generative User Interfaces
Generative user interfaces (generative UI) is the process of allowing a large language model (LLM) to go beyond text and "generate UI". This creates a more engaging and AI-native experience for users.

What is the weather in SF?
getWeather("San Francisco")
Thursday, March 7
47°
sunny
7am
48°
8am
50°
9am
52°
10am
54°
11am
56°
12pm
58°
1pm
60°
Thanks!
At the core of generative UI are tools , which are functions you provide to the model to perform specialized tasks like getting the weather in a location. The model can decide when and how to use these tools based on the context of the conversation.

Generative UI is the process of connecting the results of a tool call to a React component. Here's how it works:

You provide the model with a prompt or conversation history, along with a set of tools.
Based on the context, the model may decide to call a tool.
If a tool is called, it will execute and return data.
This data can then be passed to a React component for rendering.
By passing the tool results to React components, you can create a generative UI experience that's more engaging and adaptive to your needs.

Build a Generative UI Chat Interface
Let's create a chat interface that handles text-based conversations and incorporates dynamic UI elements based on model responses.

Basic Chat Implementation
Start with a basic chat implementation using the useChat hook:

app/page.tsx

'use client';

import { useChat } from '@ai-sdk/react';

export default function Page() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div>
      {messages.map(message => (
        <div key={message.id}>
          <div>{message.role === 'user' ? 'User: ' : 'AI: '}</div>
          <div>{message.content}</div>
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
To handle the chat requests and model responses, set up an API route:

app/api/chat/route.ts

import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(request: Request) {
  const { messages } = await request.json();

  const result = streamText({
    model: openai('gpt-4o'),
    system: 'You are a friendly assistant!',
    messages,
    maxSteps: 5,
  });

  return result.toDataStreamResponse();
}
This API route uses the streamText function to process chat messages and stream the model's responses back to the client.

Create a Tool
Before enhancing your chat interface with dynamic UI elements, you need to create a tool and corresponding React component. A tool will allow the model to perform a specific action, such as fetching weather information.

Create a new file called ai/tools.ts with the following content:

ai/tools.ts

import { tool as createTool } from 'ai';
import { z } from 'zod';

export const weatherTool = createTool({
  description: 'Display the weather for a location',
  parameters: z.object({
    location: z.string().describe('The location to get the weather for'),
  }),
  execute: async function ({ location }) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { weather: 'Sunny', temperature: 75, location };
  },
});

export const tools = {
  displayWeather: weatherTool,
};
In this file, you've created a tool called weatherTool. This tool simulates fetching weather information for a given location. This tool will return simulated data after a 2-second delay. In a real-world application, you would replace this simulation with an actual API call to a weather service.

Update the API Route
Update the API route to include the tool you've defined:

app/api/chat/route.ts

import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { tools } from '@/ai/tools';

export async function POST(request: Request) {
  const { messages } = await request.json();

  const result = streamText({
    model: openai('gpt-4o'),
    system: 'You are a friendly assistant!',
    messages,
    maxSteps: 5,
    tools,
  });

  return result.toDataStreamResponse();
}
Now that you've defined the tool and added it to your streamText call, let's build a React component to display the weather information it returns.

Create UI Components
Create a new file called components/weather.tsx:

components/weather.tsx

type WeatherProps = {
  temperature: number;
  weather: string;
  location: string;
};

export const Weather = ({ temperature, weather, location }: WeatherProps) => {
  return (
    <div>
      <h2>Current Weather for {location}</h2>
      <p>Condition: {weather}</p>
      <p>Temperature: {temperature}°C</p>
    </div>
  );
};
This component will display the weather information for a given location. It takes three props: temperature, weather, and location (exactly what the weatherTool returns).

Render the Weather Component
Now that you have your tool and corresponding React component, let's integrate them into your chat interface. You'll render the Weather component when the model calls the weather tool.

To check if the model has called a tool, you can use the toolInvocations property of the message object. This property contains information about any tools that were invoked in that generation including toolCallId, toolName, args, toolState, and result.

Update your page.tsx file:

app/page.tsx

'use client';

import { useChat } from '@ai-sdk/react';
import { Weather } from '@/components/weather';

export default function Page() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div>
      {messages.map(message => (
        <div key={message.id}>
          <div>{message.role === 'user' ? 'User: ' : 'AI: '}</div>
          <div>{message.content}</div>

          <div>
            {message.toolInvocations?.map(toolInvocation => {
              const { toolName, toolCallId, state } = toolInvocation;

              if (state === 'result') {
                if (toolName === 'displayWeather') {
                  const { result } = toolInvocation;
                  return (
                    <div key={toolCallId}>
                      <Weather {...result} />
                    </div>
                  );
                }
              } else {
                return (
                  <div key={toolCallId}>
                    {toolName === 'displayWeather' ? (
                      <div>Loading weather...</div>
                    ) : null}
                  </div>
                );
              }
            })}
          </div>
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
In this updated code snippet, you:

Check if the message has toolInvocations.
Check if the tool invocation state is 'result'.
If it's a result and the tool name is 'displayWeather', render the Weather component.
If the tool invocation state is not 'result', show a loading message.
This approach allows you to dynamically render UI components based on the model's responses, creating a more interactive and context-aware chat experience.

Expanding Your Generative UI Application
You can enhance your chat application by adding more tools and components, creating a richer and more versatile user experience. Here's how you can expand your application:

Adding More Tools
To add more tools, simply define them in your ai/tools.ts file:


// Add a new stock tool
export const stockTool = createTool({
  description: 'Get price for a stock',
  parameters: z.object({
    symbol: z.string().describe('The stock symbol to get the price for'),
  }),
  execute: async function ({ symbol }) {
    // Simulated API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { symbol, price: 100 };
  },
});

// Update the tools object
export const tools = {
  displayWeather: weatherTool,
  getStockPrice: stockTool,
};
Now, create a new file called components/stock.tsx:


type StockProps = {
  price: number;
  symbol: string;
};

export const Stock = ({ price, symbol }: StockProps) => {
  return (
    <div>
      <h2>Stock Information</h2>
      <p>Symbol: {symbol}</p>
      <p>Price: ${price}</p>
    </div>
  );
};
Finally, update your page.tsx file to include the new Stock component:


'use client';

import { useChat } from '@ai-sdk/react';
import { Weather } from '@/components/weather';
import { Stock } from '@/components/stock';

export default function Page() {
  const { messages, input, setInput, handleSubmit } = useChat();

  return (
    <div>
      {messages.map(message => (
        <div key={message.id}>
          <div>{message.role}</div>
          <div>{message.content}</div>

          <div>
            {message.toolInvocations?.map(toolInvocation => {
              const { toolName, toolCallId, state } = toolInvocation;

              if (state === 'result') {
                if (toolName === 'displayWeather') {
                  const { result } = toolInvocation;
                  return (
                    <div key={toolCallId}>
                      <Weather {...result} />
                    </div>
                  );
                } else if (toolName === 'getStockPrice') {
                  const { result } = toolInvocation;
                  return <Stock key={toolCallId} {...result} />;
                }
              } else {
                return (
                  <div key={toolCallId}>
                    {toolName === 'displayWeather' ? (
                      <div>Loading weather...</div>
                    ) : toolName === 'getStockPrice' ? (
                      <div>Loading stock price...</div>
                    ) : (
                      <div>Loading...</div>
                    )}
                  </div>
                );
              }
            })}
          </div>
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={event => {
            setInput(event.target.value);
          }}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
By following this pattern, you can continue to add more tools and components, expanding the capabilities of your Generative UI application.

Completion
The useCompletion hook allows you to create a user interface to handle text completions in your application. It enables the streaming of text completions from your AI provider, manages the state for chat input, and updates the UI automatically as new messages are received.

In this guide, you will learn how to use the useCompletion hook in your application to generate text completions and stream them in real-time to your users.

Example
app/page.tsx

'use client';

import { useCompletion } from '@ai-sdk/react';

export default function Page() {
  const { completion, input, handleInputChange, handleSubmit } = useCompletion({
    api: '/api/completion',
  });

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="prompt"
        value={input}
        onChange={handleInputChange}
        id="input"
      />
      <button type="submit">Submit</button>
      <div>{completion}</div>
    </form>
  );
}
app/api/completion/route.ts

import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { prompt }: { prompt: string } = await req.json();

  const result = streamText({
    model: openai('gpt-3.5-turbo'),
    prompt,
  });

  return result.toDataStreamResponse();
}
In the Page component, the useCompletion hook will request to your AI provider endpoint whenever the user submits a message. The completion is then streamed back in real-time and displayed in the UI.

This enables a seamless text completion experience where the user can see the AI response as soon as it is available, without having to wait for the entire response to be received.

Customized UI
useCompletion also provides ways to manage the prompt via code, show loading and error states, and update messages without being triggered by user interactions.

Loading and error states
To show a loading spinner while the chatbot is processing the user's message, you can use the isLoading state returned by the useCompletion hook:


const { isLoading, ... } = useCompletion()

return(
  <>
    {isLoading ? <Spinner /> : null}
  </>
)
Similarly, the error state reflects the error object thrown during the fetch request. It can be used to display an error message, or show a toast notification:


const { error, ... } = useCompletion()

useEffect(() => {
  if (error) {
    toast.error(error.message)
  }
}, [error])

// Or display the error message in the UI:
return (
  <>
    {error ? <div>{error.message}</div> : null}
  </>
)
Controlled input
In the initial example, we have handleSubmit and handleInputChange callbacks that manage the input changes and form submissions. These are handy for common use cases, but you can also use uncontrolled APIs for more advanced scenarios such as form validation or customized components.

The following example demonstrates how to use more granular APIs like setInput with your custom input and submit button components:


const { input, setInput } = useCompletion();

return (
  <>
    <MyCustomInput value={input} onChange={value => setInput(value)} />
  </>
);
Cancelation
It's also a common use case to abort the response message while it's still streaming back from the AI provider. You can do this by calling the stop function returned by the useCompletion hook.


const { stop, isLoading, ... } = useCompletion()

return (
  <>
    <button onClick={stop} disabled={!isLoading}>Stop</button>
  </>
)
When the user clicks the "Stop" button, the fetch request will be aborted. This avoids consuming unnecessary resources and improves the UX of your application.

Throttling UI Updates
This feature is currently only available for React.
By default, the useCompletion hook will trigger a render every time a new chunk is received. You can throttle the UI updates with the experimental_throttle option.

page.tsx

const { completion, ... } = useCompletion({
  // Throttle the completion and data updates to 50ms:
  experimental_throttle: 50
})
Event Callbacks
useCompletion also provides optional event callbacks that you can use to handle different stages of the chatbot lifecycle. These callbacks can be used to trigger additional actions, such as logging, analytics, or custom UI updates.


const { ... } = useCompletion({
  onResponse: (response: Response) => {
    console.log('Received response from server:', response)
  },
  onFinish: (message: Message) => {
    console.log('Finished streaming message:', message)
  },
  onError: (error: Error) => {
    console.error('An error occurred:', error)
  },
})
It's worth noting that you can abort the processing by throwing an error in the onResponse callback. This will trigger the onError callback and stop the message from being appended to the chat UI. This can be useful for handling unexpected responses from the AI provider.

Configure Request Options
By default, the useCompletion hook sends a HTTP POST request to the /api/completion endpoint with the prompt as part of the request body. You can customize the request by passing additional options to the useCompletion hook:


const { messages, input, handleInputChange, handleSubmit } = useCompletion({
  api: '/api/custom-completion',
  headers: {
    Authorization: 'your_token',
  },
  body: {
    user_id: '123',
  },
  credentials: 'same-origin',
});
In this example, the useCompletion hook sends a POST request to the /api/completion endpoint with the specified headers, additional body fields, and credentials for that fetch request. On your server side, you can handle the request with these additional information.

Object Generation
useObject is an experimental feature and only available in React.
The useObject hook allows you to create interfaces that represent a structured JSON object that is being streamed.

In this guide, you will learn how to use the useObject hook in your application to generate UIs for structured data on the fly.

Example
The example shows a small notifications demo app that generates fake notifications in real-time.

Schema
It is helpful to set up the schema in a separate file that is imported on both the client and server.

app/api/notifications/schema.ts

import { z } from 'zod';

// define a schema for the notifications
export const notificationSchema = z.object({
  notifications: z.array(
    z.object({
      name: z.string().describe('Name of a fictional person.'),
      message: z.string().describe('Message. Do not use emojis or links.'),
    }),
  ),
});
Client
The client uses useObject to stream the object generation process.

The results are partial and are displayed as they are received. Please note the code for handling undefined values in the JSX.

app/page.tsx

'use client';

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { notificationSchema } from './api/notifications/schema';

export default function Page() {
  const { object, submit } = useObject({
    api: '/api/notifications',
    schema: notificationSchema,
  });

  return (
    <>
      <button onClick={() => submit('Messages during finals week.')}>
        Generate notifications
      </button>

      {object?.notifications?.map((notification, index) => (
        <div key={index}>
          <p>{notification?.name}</p>
          <p>{notification?.message}</p>
        </div>
      ))}
    </>
  );
}
Server
On the server, we use streamObject to stream the object generation process.

app/api/notifications/route.ts

import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { notificationSchema } from './schema';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const context = await req.json();

  const result = streamObject({
    model: openai('gpt-4-turbo'),
    schema: notificationSchema,
    prompt:
      `Generate 3 notifications for a messages app in this context:` + context,
  });

  return result.toTextStreamResponse();
}
Customized UI
useObject also provides ways to show loading and error states:

Loading State
The isLoading state returned by the useObject hook can be used for several purposes:

To show a loading spinner while the object is generated.
To disable the submit button.
app/page.tsx

'use client';

import { useObject } from '@ai-sdk/react';

export default function Page() {
  const { isLoading, object, submit } = useObject({
    api: '/api/notifications',
    schema: notificationSchema,
  });

  return (
    <>
      {isLoading && <Spinner />}

      <button
        onClick={() => submit('Messages during finals week.')}
        disabled={isLoading}
      >
        Generate notifications
      </button>

      {object?.notifications?.map((notification, index) => (
        <div key={index}>
          <p>{notification?.name}</p>
          <p>{notification?.message}</p>
        </div>
      ))}
    </>
  );
}
Stop Handler
The stop function can be used to stop the object generation process. This can be useful if the user wants to cancel the request or if the server is taking too long to respond.

app/page.tsx

'use client';

import { useObject } from '@ai-sdk/react';

export default function Page() {
  const { isLoading, stop, object, submit } = useObject({
    api: '/api/notifications',
    schema: notificationSchema,
  });

  return (
    <>
      {isLoading && (
        <button type="button" onClick={() => stop()}>
          Stop
        </button>
      )}

      <button onClick={() => submit('Messages during finals week.')}>
        Generate notifications
      </button>

      {object?.notifications?.map((notification, index) => (
        <div key={index}>
          <p>{notification?.name}</p>
          <p>{notification?.message}</p>
        </div>
      ))}
    </>
  );
}
Error State
Similarly, the error state reflects the error object thrown during the fetch request. It can be used to display an error message, or to disable the submit button:

We recommend showing a generic error message to the user, such as "Something went wrong." This is a good practice to avoid leaking information from the server.


'use client';

import { useObject } from '@ai-sdk/react';

export default function Page() {
  const { error, object, submit } = useObject({
    api: '/api/notifications',
    schema: notificationSchema,
  });

  return (
    <>
      {error && <div>An error occurred.</div>}

      <button onClick={() => submit('Messages during finals week.')}>
        Generate notifications
      </button>

      {object?.notifications?.map((notification, index) => (
        <div key={index}>
          <p>{notification?.name}</p>
          <p>{notification?.message}</p>
        </div>
      ))}
    </>
  );
}
Event Callbacks
useObject provides optional event callbacks that you can use to handle life-cycle events.

onFinish: Called when the object generation is completed.
onError: Called when an error occurs during the fetch request.
These callbacks can be used to trigger additional actions, such as logging, analytics, or custom UI updates.

app/page.tsx

'use client';

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { notificationSchema } from './api/notifications/schema';

export default function Page() {
  const { object, submit } = useObject({
    api: '/api/notifications',
    schema: notificationSchema,
    onFinish({ object, error }) {
      // typed object, undefined if schema validation fails:
      console.log('Object generation completed:', object);

      // error, undefined if schema validation succeeds:
      console.log('Schema validation error:', error);
    },
    onError(error) {
      // error during fetch request:
      console.error('An error occurred:', error);
    },
  });

  return (
    <div>
      <button onClick={() => submit('Messages during finals week.')}>
        Generate notifications
      </button>

      {object?.notifications?.map((notification, index) => (
        <div key={index}>
          <p>{notification?.name}</p>
          <p>{notification?.message}</p>
        </div>
      ))}
    </div>
  );
}
Configure Request Options
You can configure the API endpoint, optional headers and credentials using the api, headers and credentials settings.


const { submit, object } = useObject({
  api: '/api/use-object',
  headers: {
    'X-Custom-Header': 'CustomValue',
  },
  credentials: 'include',
  schema: yourSchema,
});
