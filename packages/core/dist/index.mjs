// shared/utils.ts
import { customAlphabet } from "nanoid/non-secure";

// shared/stream-parts.ts
var textStreamPart = {
  code: "0",
  name: "text",
  parse: (value) => {
    if (typeof value !== "string") {
      throw new Error('"text" parts expect a string value.');
    }
    return { type: "text", value };
  }
};
var functionCallStreamPart = {
  code: "1",
  name: "function_call",
  parse: (value) => {
    if (value == null || typeof value !== "object" || !("function_call" in value) || typeof value.function_call !== "object" || value.function_call == null || !("name" in value.function_call) || !("arguments" in value.function_call) || typeof value.function_call.name !== "string" || typeof value.function_call.arguments !== "string") {
      throw new Error(
        '"function_call" parts expect an object with a "function_call" property.'
      );
    }
    return {
      type: "function_call",
      value
    };
  }
};
var dataStreamPart = {
  code: "2",
  name: "data",
  parse: (value) => {
    if (!Array.isArray(value)) {
      throw new Error('"data" parts expect an array value.');
    }
    return { type: "data", value };
  }
};
var errorStreamPart = {
  code: "3",
  name: "error",
  parse: (value) => {
    if (typeof value !== "string") {
      throw new Error('"error" parts expect a string value.');
    }
    return { type: "error", value };
  }
};
var assistantMessageStreamPart = {
  code: "4",
  name: "assistant_message",
  parse: (value) => {
    if (value == null || typeof value !== "object" || !("id" in value) || !("role" in value) || !("content" in value) || typeof value.id !== "string" || typeof value.role !== "string" || value.role !== "assistant" || !Array.isArray(value.content) || !value.content.every(
      (item) => item != null && typeof item === "object" && "type" in item && item.type === "text" && "text" in item && item.text != null && typeof item.text === "object" && "value" in item.text && typeof item.text.value === "string"
    )) {
      throw new Error(
        '"assistant_message" parts expect an object with an "id", "role", and "content" property.'
      );
    }
    return {
      type: "assistant_message",
      value
    };
  }
};
var assistantControlDataStreamPart = {
  code: "5",
  name: "assistant_control_data",
  parse: (value) => {
    if (value == null || typeof value !== "object" || !("threadId" in value) || !("messageId" in value) || typeof value.threadId !== "string" || typeof value.messageId !== "string") {
      throw new Error(
        '"assistant_control_data" parts expect an object with a "threadId" and "messageId" property.'
      );
    }
    return {
      type: "assistant_control_data",
      value: {
        threadId: value.threadId,
        messageId: value.messageId
      }
    };
  }
};
var dataMessageStreamPart = {
  code: "6",
  name: "data_message",
  parse: (value) => {
    if (value == null || typeof value !== "object" || !("role" in value) || !("data" in value) || typeof value.role !== "string" || value.role !== "data") {
      throw new Error(
        '"data_message" parts expect an object with a "role" and "data" property.'
      );
    }
    return {
      type: "data_message",
      value
    };
  }
};
var toolCallStreamPart = {
  code: "7",
  name: "tool_calls",
  parse: (value) => {
    if (value == null || typeof value !== "object" || !("tool_calls" in value) || typeof value.tool_calls !== "object" || value.tool_calls == null || !Array.isArray(value.tool_calls) || value.tool_calls.some((tc) => {
      tc == null || typeof tc !== "object" || !("id" in tc) || typeof tc.id !== "string" || !("type" in tc) || typeof tc.type !== "string" || !("function" in tc) || tc.function == null || typeof tc.function !== "object" || !("arguments" in tc.function) || typeof tc.function.name !== "string" || typeof tc.function.arguments !== "string";
    })) {
      throw new Error(
        '"tool_calls" parts expect an object with a ToolCallPayload.'
      );
    }
    return {
      type: "tool_calls",
      value
    };
  }
};
var streamParts = [
  textStreamPart,
  functionCallStreamPart,
  dataStreamPart,
  errorStreamPart,
  assistantMessageStreamPart,
  assistantControlDataStreamPart,
  dataMessageStreamPart,
  toolCallStreamPart
];
var streamPartsByCode = {
  [textStreamPart.code]: textStreamPart,
  [functionCallStreamPart.code]: functionCallStreamPart,
  [dataStreamPart.code]: dataStreamPart,
  [errorStreamPart.code]: errorStreamPart,
  [assistantMessageStreamPart.code]: assistantMessageStreamPart,
  [assistantControlDataStreamPart.code]: assistantControlDataStreamPart,
  [dataMessageStreamPart.code]: dataMessageStreamPart,
  [toolCallStreamPart.code]: toolCallStreamPart
};
var StreamStringPrefixes = {
  [textStreamPart.name]: textStreamPart.code,
  [functionCallStreamPart.name]: functionCallStreamPart.code,
  [dataStreamPart.name]: dataStreamPart.code,
  [errorStreamPart.name]: errorStreamPart.code,
  [assistantMessageStreamPart.name]: assistantMessageStreamPart.code,
  [assistantControlDataStreamPart.name]: assistantControlDataStreamPart.code,
  [dataMessageStreamPart.name]: dataMessageStreamPart.code,
  [toolCallStreamPart.name]: toolCallStreamPart.code
};
var validCodes = streamParts.map((part) => part.code);
var parseStreamPart = (line) => {
  const firstSeparatorIndex = line.indexOf(":");
  if (firstSeparatorIndex === -1) {
    throw new Error("Failed to parse stream string. No separator found.");
  }
  const prefix = line.slice(0, firstSeparatorIndex);
  if (!validCodes.includes(prefix)) {
    throw new Error(`Failed to parse stream string. Invalid code ${prefix}.`);
  }
  const code = prefix;
  const textValue = line.slice(firstSeparatorIndex + 1);
  const jsonValue = JSON.parse(textValue);
  return streamPartsByCode[code].parse(jsonValue);
};
function formatStreamPart(type, value) {
  const streamPart = streamParts.find((part) => part.name === type);
  if (!streamPart) {
    throw new Error(`Invalid stream part type: ${type}`);
  }
  return `${streamPart.code}:${JSON.stringify(value)}
`;
}

// shared/utils.ts
var nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  7
);
function createChunkDecoder(complex) {
  const decoder = new TextDecoder();
  if (!complex) {
    return function(chunk) {
      if (!chunk)
        return "";
      return decoder.decode(chunk, { stream: true });
    };
  }
  return function(chunk) {
    const decoded = decoder.decode(chunk, { stream: true }).split("\n").filter((line) => line !== "");
    return decoded.map(parseStreamPart).filter(Boolean);
  };
}
var isStreamStringEqualToType = (type, value) => value.startsWith(`${StreamStringPrefixes[type]}:`) && value.endsWith("\n");
var COMPLEX_HEADER = "X-Experimental-Stream-Data";

// streams/ai-stream.ts
import {
  createParser
} from "eventsource-parser";
function createEventStreamTransformer(customParser) {
  const textDecoder = new TextDecoder();
  let eventSourceParser;
  return new TransformStream({
    async start(controller) {
      eventSourceParser = createParser(
        (event) => {
          if ("data" in event && event.type === "event" && event.data === "[DONE]" || // Replicate doesn't send [DONE] but does send a 'done' event
          // @see https://replicate.com/docs/streaming
          event.event === "done") {
            controller.terminate();
            return;
          }
          if ("data" in event) {
            const parsedMessage = customParser ? customParser(event.data) : event.data;
            if (parsedMessage)
              controller.enqueue(parsedMessage);
          }
        }
      );
    },
    transform(chunk) {
      eventSourceParser.feed(textDecoder.decode(chunk));
    }
  });
}
function createCallbacksTransformer(cb) {
  const textEncoder = new TextEncoder();
  let aggregatedResponse = "";
  const callbacks = cb || {};
  return new TransformStream({
    async start() {
      if (callbacks.onStart)
        await callbacks.onStart();
    },
    async transform(message, controller) {
      controller.enqueue(textEncoder.encode(message));
      aggregatedResponse += message;
      if (callbacks.onToken)
        await callbacks.onToken(message);
    },
    async flush() {
      const isOpenAICallbacks = isOfTypeOpenAIStreamCallbacks(callbacks);
      if (callbacks.onCompletion) {
        await callbacks.onCompletion(aggregatedResponse);
      }
      if (callbacks.onFinal && !isOpenAICallbacks) {
        await callbacks.onFinal(aggregatedResponse);
      }
    }
  });
}
function isOfTypeOpenAIStreamCallbacks(callbacks) {
  return "experimental_onFunctionCall" in callbacks;
}
function trimStartOfStreamHelper() {
  let isStreamStart = true;
  return (text) => {
    if (isStreamStart) {
      text = text.trimStart();
      if (text)
        isStreamStart = false;
    }
    return text;
  };
}
function AIStream(response, customParser, callbacks) {
  if (!response.ok) {
    if (response.body) {
      const reader = response.body.getReader();
      return new ReadableStream({
        async start(controller) {
          const { done, value } = await reader.read();
          if (!done) {
            const errorText = new TextDecoder().decode(value);
            controller.error(new Error(`Response error: ${errorText}`));
          }
        }
      });
    } else {
      return new ReadableStream({
        start(controller) {
          controller.error(new Error("Response error: No response body"));
        }
      });
    }
  }
  const responseBodyStream = response.body || createEmptyReadableStream();
  return responseBodyStream.pipeThrough(createEventStreamTransformer(customParser)).pipeThrough(createCallbacksTransformer(callbacks));
}
function createEmptyReadableStream() {
  return new ReadableStream({
    start(controller) {
      controller.close();
    }
  });
}
function readableFromAsyncIterable(iterable) {
  let it = iterable[Symbol.asyncIterator]();
  return new ReadableStream({
    async pull(controller) {
      const { done, value } = await it.next();
      if (done)
        controller.close();
      else
        controller.enqueue(value);
    },
    async cancel(reason) {
      var _a;
      await ((_a = it.return) == null ? void 0 : _a.call(it, reason));
    }
  });
}

// streams/stream-data.ts
var experimental_StreamData = class {
  constructor() {
    this.encoder = new TextEncoder();
    this.controller = null;
    // closing the stream is synchronous, but we want to return a promise
    // in case we're doing async work
    this.isClosedPromise = null;
    this.isClosedPromiseResolver = void 0;
    this.isClosed = false;
    // array to store appended data
    this.data = [];
    this.isClosedPromise = new Promise((resolve) => {
      this.isClosedPromiseResolver = resolve;
    });
    const self = this;
    this.stream = new TransformStream({
      start: async (controller) => {
        self.controller = controller;
      },
      transform: async (chunk, controller) => {
        if (self.data.length > 0) {
          const encodedData = self.encoder.encode(
            formatStreamPart("data", self.data)
          );
          self.data = [];
          controller.enqueue(encodedData);
        }
        controller.enqueue(chunk);
      },
      async flush(controller) {
        const warningTimeout = process.env.NODE_ENV === "development" ? setTimeout(() => {
          console.warn(
            "The data stream is hanging. Did you forget to close it with `data.close()`?"
          );
        }, 3e3) : null;
        await self.isClosedPromise;
        if (warningTimeout !== null) {
          clearTimeout(warningTimeout);
        }
        if (self.data.length) {
          const encodedData = self.encoder.encode(
            formatStreamPart("data", self.data)
          );
          controller.enqueue(encodedData);
        }
      }
    });
  }
  async close() {
    var _a;
    if (this.isClosed) {
      throw new Error("Data Stream has already been closed.");
    }
    if (!this.controller) {
      throw new Error("Stream controller is not initialized.");
    }
    (_a = this.isClosedPromiseResolver) == null ? void 0 : _a.call(this);
    this.isClosed = true;
  }
  append(value) {
    if (this.isClosed) {
      throw new Error("Data Stream has already been closed.");
    }
    this.data.push(value);
  }
};
function createStreamDataTransformer(experimental_streamData) {
  if (!experimental_streamData) {
    return new TransformStream({
      transform: async (chunk, controller) => {
        controller.enqueue(chunk);
      }
    });
  }
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  return new TransformStream({
    transform: async (chunk, controller) => {
      const message = decoder.decode(chunk);
      controller.enqueue(encoder.encode(formatStreamPart("text", message)));
    }
  });
}

// streams/anthropic-stream.ts
function parseAnthropicStream() {
  let previous = "";
  return (data) => {
    const json = JSON.parse(data);
    if ("error" in json) {
      throw new Error(`${json.error.type}: ${json.error.message}`);
    }
    if (!("completion" in json)) {
      return;
    }
    const text = json.completion;
    if (!previous || text.length > previous.length && text.startsWith(previous)) {
      const delta = text.slice(previous.length);
      previous = text;
      return delta;
    }
    return text;
  };
}
async function* streamable(stream) {
  for await (const chunk of stream) {
    if ("completion" in chunk) {
      const text = chunk.completion;
      if (text)
        yield text;
    } else if ("delta" in chunk) {
      const { delta } = chunk;
      if ("text" in delta) {
        const text = delta.text;
        if (text)
          yield text;
      }
    }
  }
}
function AnthropicStream(res, cb) {
  if (Symbol.asyncIterator in res) {
    return readableFromAsyncIterable(streamable(res)).pipeThrough(createCallbacksTransformer(cb)).pipeThrough(createStreamDataTransformer(cb == null ? void 0 : cb.experimental_streamData));
  } else {
    return AIStream(res, parseAnthropicStream(), cb).pipeThrough(
      createStreamDataTransformer(cb == null ? void 0 : cb.experimental_streamData)
    );
  }
}

// streams/assistant-response.ts
function experimental_AssistantResponse({ threadId, messageId }, process2) {
  const stream = new ReadableStream({
    async start(controller) {
      var _a;
      const textEncoder = new TextEncoder();
      const sendMessage = (message) => {
        controller.enqueue(
          textEncoder.encode(formatStreamPart("assistant_message", message))
        );
      };
      const sendDataMessage = (message) => {
        controller.enqueue(
          textEncoder.encode(formatStreamPart("data_message", message))
        );
      };
      const sendError = (errorMessage) => {
        controller.enqueue(
          textEncoder.encode(formatStreamPart("error", errorMessage))
        );
      };
      controller.enqueue(
        textEncoder.encode(
          formatStreamPart("assistant_control_data", {
            threadId,
            messageId
          })
        )
      );
      try {
        await process2({
          threadId,
          messageId,
          sendMessage,
          sendDataMessage
        });
      } catch (error) {
        sendError((_a = error.message) != null ? _a : `${error}`);
      } finally {
        controller.close();
      }
    },
    pull(controller) {
    },
    cancel() {
    }
  });
  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}

// streams/aws-bedrock-stream.ts
async function* asDeltaIterable(response, extractTextDeltaFromChunk) {
  var _a, _b;
  const decoder = new TextDecoder();
  for await (const chunk of (_a = response.body) != null ? _a : []) {
    const bytes = (_b = chunk.chunk) == null ? void 0 : _b.bytes;
    if (bytes != null) {
      const chunkText = decoder.decode(bytes);
      const chunkJSON = JSON.parse(chunkText);
      const delta = extractTextDeltaFromChunk(chunkJSON);
      if (delta != null) {
        yield delta;
      }
    }
  }
}
function AWSBedrockAnthropicStream(response, callbacks) {
  return AWSBedrockStream(response, callbacks, (chunk) => chunk.completion);
}
function AWSBedrockCohereStream(response, callbacks) {
  return AWSBedrockStream(
    response,
    callbacks,
    // As of 2023-11-17, Bedrock does not support streaming for Cohere,
    // so we take the full generation:
    (chunk) => {
      var _a, _b;
      return (_b = (_a = chunk.generations) == null ? void 0 : _a[0]) == null ? void 0 : _b.text;
    }
  );
}
function AWSBedrockLlama2Stream(response, callbacks) {
  return AWSBedrockStream(response, callbacks, (chunk) => chunk.generation);
}
function AWSBedrockStream(response, callbacks, extractTextDeltaFromChunk) {
  return readableFromAsyncIterable(
    asDeltaIterable(response, extractTextDeltaFromChunk)
  ).pipeThrough(createCallbacksTransformer(callbacks)).pipeThrough(
    createStreamDataTransformer(callbacks == null ? void 0 : callbacks.experimental_streamData)
  );
}

// streams/cohere-stream.ts
var utf8Decoder = new TextDecoder("utf-8");
async function processLines(lines, controller) {
  for (const line of lines) {
    const { text, is_finished } = JSON.parse(line);
    if (!is_finished) {
      controller.enqueue(text);
    }
  }
}
async function readAndProcessLines(reader, controller) {
  let segment = "";
  while (true) {
    const { value: chunk, done } = await reader.read();
    if (done) {
      break;
    }
    segment += utf8Decoder.decode(chunk, { stream: true });
    const linesArray = segment.split(/\r\n|\n|\r/g);
    segment = linesArray.pop() || "";
    await processLines(linesArray, controller);
  }
  if (segment) {
    const linesArray = [segment];
    await processLines(linesArray, controller);
  }
  controller.close();
}
function createParser2(res) {
  var _a;
  const reader = (_a = res.body) == null ? void 0 : _a.getReader();
  return new ReadableStream({
    async start(controller) {
      if (!reader) {
        controller.close();
        return;
      }
      await readAndProcessLines(reader, controller);
    }
  });
}
function CohereStream(reader, callbacks) {
  return createParser2(reader).pipeThrough(createCallbacksTransformer(callbacks)).pipeThrough(
    createStreamDataTransformer(callbacks == null ? void 0 : callbacks.experimental_streamData)
  );
}

// streams/google-generative-ai-stream.ts
async function* streamable2(response) {
  var _a, _b, _c;
  for await (const chunk of response.stream) {
    const parts = (_c = (_b = (_a = chunk.candidates) == null ? void 0 : _a[0]) == null ? void 0 : _b.content) == null ? void 0 : _c.parts;
    if (parts === void 0) {
      continue;
    }
    const firstPart = parts[0];
    if (typeof firstPart.text === "string") {
      yield firstPart.text;
    }
  }
}
function GoogleGenerativeAIStream(response, cb) {
  return readableFromAsyncIterable(streamable2(response)).pipeThrough(createCallbacksTransformer(cb)).pipeThrough(createStreamDataTransformer(cb == null ? void 0 : cb.experimental_streamData));
}

// streams/huggingface-stream.ts
function createParser3(res) {
  const trimStartOfStream = trimStartOfStreamHelper();
  return new ReadableStream({
    async pull(controller) {
      var _a, _b;
      const { value, done } = await res.next();
      if (done) {
        controller.close();
        return;
      }
      const text = trimStartOfStream((_b = (_a = value.token) == null ? void 0 : _a.text) != null ? _b : "");
      if (!text)
        return;
      if (value.generated_text != null && value.generated_text.length > 0) {
        return;
      }
      if (text === "</s>" || text === "<|endoftext|>" || text === "<|end|>") {
        return;
      }
      controller.enqueue(text);
    }
  });
}
function HuggingFaceStream(res, callbacks) {
  return createParser3(res).pipeThrough(createCallbacksTransformer(callbacks)).pipeThrough(
    createStreamDataTransformer(callbacks == null ? void 0 : callbacks.experimental_streamData)
  );
}

// streams/langchain-stream.ts
function LangChainStream(callbacks) {
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const runs = /* @__PURE__ */ new Set();
  const handleError = async (e, runId) => {
    runs.delete(runId);
    await writer.ready;
    await writer.abort(e);
  };
  const handleStart = async (runId) => {
    runs.add(runId);
  };
  const handleEnd = async (runId) => {
    runs.delete(runId);
    if (runs.size === 0) {
      await writer.ready;
      await writer.close();
    }
  };
  return {
    stream: stream.readable.pipeThrough(createCallbacksTransformer(callbacks)).pipeThrough(
      createStreamDataTransformer(callbacks == null ? void 0 : callbacks.experimental_streamData)
    ),
    writer,
    handlers: {
      handleLLMNewToken: async (token) => {
        await writer.ready;
        await writer.write(token);
      },
      handleLLMStart: async (_llm, _prompts, runId) => {
        handleStart(runId);
      },
      handleLLMEnd: async (_output, runId) => {
        await handleEnd(runId);
      },
      handleLLMError: async (e, runId) => {
        await handleError(e, runId);
      },
      handleChainStart: async (_chain, _inputs, runId) => {
        handleStart(runId);
      },
      handleChainEnd: async (_outputs, runId) => {
        await handleEnd(runId);
      },
      handleChainError: async (e, runId) => {
        await handleError(e, runId);
      },
      handleToolStart: async (_tool, _input, runId) => {
        handleStart(runId);
      },
      handleToolEnd: async (_output, runId) => {
        await handleEnd(runId);
      },
      handleToolError: async (e, runId) => {
        await handleError(e, runId);
      }
    }
  };
}

// streams/openai-stream.ts
function parseOpenAIStream() {
  const extract = chunkToText();
  return (data) => extract(JSON.parse(data));
}
async function* streamable3(stream) {
  const extract = chunkToText();
  for await (const chunk of stream) {
    const text = extract(chunk);
    if (text)
      yield text;
  }
}
function chunkToText() {
  const trimStartOfStream = trimStartOfStreamHelper();
  let isFunctionStreamingIn;
  return (json) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q;
    if (isChatCompletionChunk(json)) {
      const delta = (_a = json.choices[0]) == null ? void 0 : _a.delta;
      if ((_b = delta.function_call) == null ? void 0 : _b.name) {
        isFunctionStreamingIn = true;
        return `{"function_call": {"name": "${delta.function_call.name}", "arguments": "`;
      } else if ((_e = (_d = (_c = delta.tool_calls) == null ? void 0 : _c[0]) == null ? void 0 : _d.function) == null ? void 0 : _e.name) {
        isFunctionStreamingIn = true;
        const toolCall = delta.tool_calls[0];
        if (toolCall.index === 0) {
          return `{"tool_calls":[ {"id": "${toolCall.id}", "type": "function", "function": {"name": "${(_f = toolCall.function) == null ? void 0 : _f.name}", "arguments": "`;
        } else {
          return `"}}, {"id": "${toolCall.id}", "type": "function", "function": {"name": "${(_g = toolCall.function) == null ? void 0 : _g.name}", "arguments": "`;
        }
      } else if ((_h = delta.function_call) == null ? void 0 : _h.arguments) {
        return cleanupArguments((_i = delta.function_call) == null ? void 0 : _i.arguments);
      } else if ((_k = (_j = delta.tool_calls) == null ? void 0 : _j[0].function) == null ? void 0 : _k.arguments) {
        return cleanupArguments((_n = (_m = (_l = delta.tool_calls) == null ? void 0 : _l[0]) == null ? void 0 : _m.function) == null ? void 0 : _n.arguments);
      } else if (isFunctionStreamingIn && (((_o = json.choices[0]) == null ? void 0 : _o.finish_reason) === "function_call" || ((_p = json.choices[0]) == null ? void 0 : _p.finish_reason) === "stop")) {
        isFunctionStreamingIn = false;
        return '"}}';
      } else if (isFunctionStreamingIn && ((_q = json.choices[0]) == null ? void 0 : _q.finish_reason) === "tool_calls") {
        isFunctionStreamingIn = false;
        return '"}}]}';
      }
    }
    const text = trimStartOfStream(
      isChatCompletionChunk(json) && json.choices[0].delta.content ? json.choices[0].delta.content : isCompletion(json) ? json.choices[0].text : ""
    );
    return text;
  };
  function cleanupArguments(argumentChunk) {
    let escapedPartialJson = argumentChunk.replace(/\\/g, "\\\\").replace(/\//g, "\\/").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t").replace(/\f/g, "\\f");
    return `${escapedPartialJson}`;
  }
}
var __internal__OpenAIFnMessagesSymbol = Symbol(
  "internal_openai_fn_messages"
);
function isChatCompletionChunk(data) {
  return "choices" in data && data.choices && data.choices[0] && "delta" in data.choices[0];
}
function isCompletion(data) {
  return "choices" in data && data.choices && data.choices[0] && "text" in data.choices[0];
}
function OpenAIStream(res, callbacks) {
  const cb = callbacks;
  let stream;
  if (Symbol.asyncIterator in res) {
    stream = readableFromAsyncIterable(streamable3(res)).pipeThrough(
      createCallbacksTransformer(
        (cb == null ? void 0 : cb.experimental_onFunctionCall) || (cb == null ? void 0 : cb.experimental_onToolCall) ? {
          ...cb,
          onFinal: void 0
        } : {
          ...cb
        }
      )
    );
  } else {
    stream = AIStream(
      res,
      parseOpenAIStream(),
      (cb == null ? void 0 : cb.experimental_onFunctionCall) || (cb == null ? void 0 : cb.experimental_onToolCall) ? {
        ...cb,
        onFinal: void 0
      } : {
        ...cb
      }
    );
  }
  if (cb && (cb.experimental_onFunctionCall || cb.experimental_onToolCall)) {
    const functionCallTransformer = createFunctionCallTransformer(cb);
    return stream.pipeThrough(functionCallTransformer);
  } else {
    return stream.pipeThrough(
      createStreamDataTransformer(cb == null ? void 0 : cb.experimental_streamData)
    );
  }
}
function createFunctionCallTransformer(callbacks) {
  const textEncoder = new TextEncoder();
  let isFirstChunk = true;
  let aggregatedResponse = "";
  let aggregatedFinalCompletionResponse = "";
  let isFunctionStreamingIn = false;
  let functionCallMessages = callbacks[__internal__OpenAIFnMessagesSymbol] || [];
  const isComplexMode = callbacks == null ? void 0 : callbacks.experimental_streamData;
  const decode = createChunkDecoder();
  return new TransformStream({
    async transform(chunk, controller) {
      const message = decode(chunk);
      aggregatedFinalCompletionResponse += message;
      const shouldHandleAsFunction = isFirstChunk && (message.startsWith('{"function_call":') || message.startsWith('{"tool_calls":'));
      if (shouldHandleAsFunction) {
        isFunctionStreamingIn = true;
        aggregatedResponse += message;
        isFirstChunk = false;
        return;
      }
      if (!isFunctionStreamingIn) {
        controller.enqueue(
          isComplexMode ? textEncoder.encode(formatStreamPart("text", message)) : chunk
        );
        return;
      } else {
        aggregatedResponse += message;
      }
    },
    async flush(controller) {
      try {
        if (!isFirstChunk && isFunctionStreamingIn && (callbacks.experimental_onFunctionCall || callbacks.experimental_onToolCall)) {
          isFunctionStreamingIn = false;
          const payload = JSON.parse(aggregatedResponse);
          let newFunctionCallMessages = [
            ...functionCallMessages
          ];
          let functionResponse = void 0;
          if (callbacks.experimental_onFunctionCall) {
            if (payload.function_call === void 0) {
              console.warn(
                "experimental_onFunctionCall should not be defined when using tools"
              );
            }
            const argumentsPayload = JSON.parse(
              payload.function_call.arguments
            );
            functionResponse = await callbacks.experimental_onFunctionCall(
              {
                name: payload.function_call.name,
                arguments: argumentsPayload
              },
              (result) => {
                newFunctionCallMessages = [
                  ...functionCallMessages,
                  {
                    role: "assistant",
                    content: "",
                    function_call: payload.function_call
                  },
                  {
                    role: "function",
                    name: payload.function_call.name,
                    content: JSON.stringify(result)
                  }
                ];
                return newFunctionCallMessages;
              }
            );
          }
          if (callbacks.experimental_onToolCall) {
            const toolCalls = {
              tools: []
            };
            for (const tool of payload.tool_calls) {
              toolCalls.tools.push({
                id: tool.id,
                type: "function",
                func: {
                  name: tool.function.name,
                  arguments: tool.function.arguments
                }
              });
            }
            let responseIndex = 0;
            try {
              functionResponse = await callbacks.experimental_onToolCall(
                toolCalls,
                (result) => {
                  if (result) {
                    const { tool_call_id, function_name, tool_call_result } = result;
                    newFunctionCallMessages = [
                      ...newFunctionCallMessages,
                      // Only append the assistant message if it's the first response
                      ...responseIndex === 0 ? [
                        {
                          role: "assistant",
                          content: "",
                          tool_calls: payload.tool_calls.map(
                            (tc) => ({
                              id: tc.id,
                              type: "function",
                              function: {
                                name: tc.function.name,
                                // we send the arguments an object to the user, but as the API expects a string, we need to stringify it
                                arguments: JSON.stringify(
                                  tc.function.arguments
                                )
                              }
                            })
                          )
                        }
                      ] : [],
                      // Append the function call result message
                      {
                        role: "tool",
                        tool_call_id,
                        name: function_name,
                        content: JSON.stringify(tool_call_result)
                      }
                    ];
                    responseIndex++;
                  }
                  return newFunctionCallMessages;
                }
              );
            } catch (e) {
              console.error("Error calling experimental_onToolCall:", e);
            }
          }
          if (!functionResponse) {
            controller.enqueue(
              textEncoder.encode(
                isComplexMode ? formatStreamPart(
                  payload.function_call ? "function_call" : "tool_calls",
                  // parse to prevent double-encoding:
                  JSON.parse(aggregatedResponse)
                ) : aggregatedResponse
              )
            );
            return;
          } else if (typeof functionResponse === "string") {
            controller.enqueue(
              isComplexMode ? textEncoder.encode(formatStreamPart("text", functionResponse)) : textEncoder.encode(functionResponse)
            );
            return;
          }
          const filteredCallbacks = {
            ...callbacks,
            onStart: void 0
          };
          callbacks.onFinal = void 0;
          const openAIStream = OpenAIStream(functionResponse, {
            ...filteredCallbacks,
            [__internal__OpenAIFnMessagesSymbol]: newFunctionCallMessages
          });
          const reader = openAIStream.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              break;
            }
            controller.enqueue(value);
          }
        }
      } finally {
        if (callbacks.onFinal && aggregatedFinalCompletionResponse) {
          await callbacks.onFinal(aggregatedFinalCompletionResponse);
        }
      }
    }
  });
}

// streams/replicate-stream.ts
async function ReplicateStream(res, cb, options) {
  var _a;
  const url = (_a = res.urls) == null ? void 0 : _a.stream;
  if (!url) {
    if (res.error)
      throw new Error(res.error);
    else
      throw new Error("Missing stream URL in Replicate response");
  }
  const eventStream = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "text/event-stream",
      ...options == null ? void 0 : options.headers
    }
  });
  return AIStream(eventStream, void 0, cb).pipeThrough(
    createStreamDataTransformer(cb == null ? void 0 : cb.experimental_streamData)
  );
}

// shared/read-data-stream.ts
var NEWLINE = "\n".charCodeAt(0);
function concatChunks(chunks, totalLength) {
  const concatenatedChunks = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    concatenatedChunks.set(chunk, offset);
    offset += chunk.length;
  }
  chunks.length = 0;
  return concatenatedChunks;
}
async function* readDataStream(reader, {
  isAborted
} = {}) {
  const decoder = new TextDecoder();
  const chunks = [];
  let totalLength = 0;
  while (true) {
    const { value } = await reader.read();
    if (value) {
      chunks.push(value);
      totalLength += value.length;
      if (value[value.length - 1] !== NEWLINE) {
        continue;
      }
    }
    if (chunks.length === 0) {
      break;
    }
    const concatenatedChunks = concatChunks(chunks, totalLength);
    totalLength = 0;
    const streamParts2 = decoder.decode(concatenatedChunks, { stream: true }).split("\n").filter((line) => line !== "").map(parseStreamPart);
    for (const streamPart of streamParts2) {
      yield streamPart;
    }
    if (isAborted == null ? void 0 : isAborted()) {
      reader.cancel();
      break;
    }
  }
}

// shared/parse-complex-response.ts
async function parseComplexResponse({
  reader,
  abortControllerRef,
  update,
  onFinish,
  generateId = nanoid,
  getCurrentDate = () => /* @__PURE__ */ new Date()
}) {
  const createdAt = getCurrentDate();
  const prefixMap = {
    data: []
  };
  for await (const { type, value } of readDataStream(reader, {
    isAborted: () => (abortControllerRef == null ? void 0 : abortControllerRef.current) === null
  })) {
    if (type === "text") {
      if (prefixMap["text"]) {
        prefixMap["text"] = {
          ...prefixMap["text"],
          content: (prefixMap["text"].content || "") + value
        };
      } else {
        prefixMap["text"] = {
          id: generateId(),
          role: "assistant",
          content: value,
          createdAt
        };
      }
    }
    let functionCallMessage = null;
    if (type === "function_call") {
      prefixMap["function_call"] = {
        id: generateId(),
        role: "assistant",
        content: "",
        function_call: value.function_call,
        name: value.function_call.name,
        createdAt
      };
      functionCallMessage = prefixMap["function_call"];
    }
    let toolCallMessage = null;
    if (type === "tool_calls") {
      prefixMap["tool_calls"] = {
        id: generateId(),
        role: "assistant",
        content: "",
        tool_calls: value.tool_calls,
        createdAt
      };
      toolCallMessage = prefixMap["tool_calls"];
    }
    if (type === "data") {
      prefixMap["data"].push(...value);
    }
    const responseMessage = prefixMap["text"];
    const merged = [
      functionCallMessage,
      toolCallMessage,
      responseMessage
    ].filter(Boolean);
    update(merged, [...prefixMap["data"]]);
  }
  onFinish == null ? void 0 : onFinish(prefixMap);
  return {
    messages: [
      prefixMap.text,
      prefixMap.function_call,
      prefixMap.tool_calls
    ].filter(Boolean),
    data: prefixMap.data
  };
}

// streams/streaming-react-response.ts
var experimental_StreamingReactResponse = class {
  constructor(res, options) {
    var _a;
    let resolveFunc = () => {
    };
    let next = new Promise((resolve) => {
      resolveFunc = resolve;
    });
    if (options == null ? void 0 : options.data) {
      const processedStream = res.pipeThrough(
        options.data.stream
      );
      let lastPayload = void 0;
      parseComplexResponse({
        reader: processedStream.getReader(),
        update: (merged, data) => {
          var _a2, _b, _c;
          const content2 = (_b = (_a2 = merged[0]) == null ? void 0 : _a2.content) != null ? _b : "";
          const ui = ((_c = options == null ? void 0 : options.ui) == null ? void 0 : _c.call(options, { content: content2, data })) || content2;
          const payload = { ui, content: content2 };
          const resolvePrevious = resolveFunc;
          const nextRow = new Promise((resolve) => {
            resolveFunc = resolve;
          });
          resolvePrevious({
            next: nextRow,
            ...payload
          });
          lastPayload = payload;
        },
        generateId: (_a = options.generateId) != null ? _a : nanoid,
        onFinish: () => {
          if (lastPayload !== void 0) {
            resolveFunc({
              next: null,
              ...lastPayload
            });
          }
        }
      });
      return next;
    }
    let content = "";
    const decode = createChunkDecoder();
    const reader = res.getReader();
    async function readChunk() {
      var _a2;
      const { done, value } = await reader.read();
      if (!done) {
        content += decode(value);
      }
      const ui = ((_a2 = options == null ? void 0 : options.ui) == null ? void 0 : _a2.call(options, { content })) || content;
      const payload = {
        ui,
        content
      };
      const resolvePrevious = resolveFunc;
      const nextRow = done ? null : new Promise((resolve) => {
        resolveFunc = resolve;
      });
      resolvePrevious({
        next: nextRow,
        ...payload
      });
      if (done) {
        return;
      }
      await readChunk();
    }
    readChunk();
    return next;
  }
};

// streams/streaming-text-response.ts
var StreamingTextResponse = class extends Response {
  constructor(res, init, data) {
    let processedStream = res;
    if (data) {
      processedStream = res.pipeThrough(data.stream);
    }
    super(processedStream, {
      ...init,
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        [COMPLEX_HEADER]: data ? "true" : "false",
        ...init == null ? void 0 : init.headers
      }
    });
  }
};
function streamToResponse(res, response, init) {
  response.writeHead((init == null ? void 0 : init.status) || 200, {
    "Content-Type": "text/plain; charset=utf-8",
    ...init == null ? void 0 : init.headers
  });
  const reader = res.getReader();
  function read() {
    reader.read().then(({ done, value }) => {
      if (done) {
        response.end();
        return;
      }
      response.write(value);
      read();
    });
  }
  read();
}
export {
  AIStream,
  AWSBedrockAnthropicStream,
  AWSBedrockCohereStream,
  AWSBedrockLlama2Stream,
  AWSBedrockStream,
  AnthropicStream,
  COMPLEX_HEADER,
  CohereStream,
  GoogleGenerativeAIStream,
  HuggingFaceStream,
  LangChainStream,
  OpenAIStream,
  ReplicateStream,
  StreamingTextResponse,
  createCallbacksTransformer,
  createChunkDecoder,
  createEventStreamTransformer,
  createStreamDataTransformer,
  experimental_AssistantResponse,
  experimental_StreamData,
  experimental_StreamingReactResponse,
  isStreamStringEqualToType,
  nanoid,
  readableFromAsyncIterable,
  streamToResponse,
  trimStartOfStreamHelper
};
//# sourceMappingURL=index.mjs.map