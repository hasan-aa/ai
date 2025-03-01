import { ServerResponse } from 'node:http';

interface FunctionCall {
    /**
     * The arguments to call the function with, as generated by the model in JSON
     * format. Note that the model does not always generate valid JSON, and may
     * hallucinate parameters not defined by your function schema. Validate the
     * arguments in your code before calling your function.
     */
    arguments?: string;
    /**
     * The name of the function to call.
     */
    name?: string;
}
/**
 * The tool calls generated by the model, such as function calls.
 */
interface ToolCall {
    id: string;
    type: string;
    function: {
        name: string;
        arguments: string;
    };
}
/**
 * Controls which (if any) function is called by the model.
 * - none means the model will not call a function and instead generates a message.
 * - auto means the model can pick between generating a message or calling a function.
 * - Specifying a particular function via {"type: "function", "function": {"name": "my_function"}} forces the model to call that function.
 * none is the default when no functions are present. auto is the default if functions are present.
 */
type ToolChoice = 'none' | 'auto' | {
    type: 'function';
    function: {
        name: string;
    };
};
/**
 * A list of tools the model may call. Currently, only functions are supported as a tool.
 * Use this to provide a list of functions the model may generate JSON inputs for.
 */
interface Tool {
    type: 'function';
    function: Function;
}
interface Function {
    /**
     * The name of the function to be called. Must be a-z, A-Z, 0-9, or contain
     * underscores and dashes, with a maximum length of 64.
     */
    name: string;
    /**
     * The parameters the functions accepts, described as a JSON Schema object. See the
     * [guide](/docs/guides/gpt/function-calling) for examples, and the
     * [JSON Schema reference](https://json-schema.org/understanding-json-schema/) for
     * documentation about the format.
     *
     * To describe a function that accepts no parameters, provide the value
     * `{"type": "object", "properties": {}}`.
     */
    parameters: Record<string, unknown>;
    /**
     * A description of what the function does, used by the model to choose when and
     * how to call the function.
     */
    description?: string;
}
type IdGenerator = () => string;
/**
 * Shared types between the API and UI packages.
 */
interface Message$1 {
    id: string;
    tool_call_id?: string;
    createdAt?: Date;
    content: string;
    ui?: string | JSX.Element | JSX.Element[] | null | undefined;
    role: 'system' | 'user' | 'assistant' | 'function' | 'data' | 'tool';
    /**
     * If the message has a role of `function`, the `name` field is the name of the function.
     * Otherwise, the name field should not be set.
     */
    name?: string;
    /**
     * If the assistant role makes a function call, the `function_call` field
     * contains the function call name and arguments. Otherwise, the field should
     * not be set. (Deprecated and replaced by tool_calls.)
     */
    function_call?: string | FunctionCall;
    data?: JSONValue;
    /**
     * If the assistant role makes a tool call, the `tool_calls` field contains
     * the tool call name and arguments. Otherwise, the field should not be set.
     */
    tool_calls?: string | ToolCall[];
}
type CreateMessage = Omit<Message$1, 'id'> & {
    id?: Message$1['id'];
};
type ChatRequest = {
    messages: Message$1[];
    options?: RequestOptions;
    functions?: Array<Function>;
    function_call?: FunctionCall;
    data?: Record<string, string>;
    tools?: Array<Tool>;
    tool_choice?: ToolChoice;
};
type FunctionCallHandler = (chatMessages: Message$1[], functionCall: FunctionCall) => Promise<ChatRequest | void>;
type ToolCallHandler = (chatMessages: Message$1[], toolCalls: ToolCall[]) => Promise<ChatRequest | void>;
type RequestOptions = {
    headers?: Record<string, string> | Headers;
    body?: object;
};
type ChatRequestOptions = {
    options?: RequestOptions;
    functions?: Array<Function>;
    function_call?: FunctionCall;
    tools?: Array<Tool>;
    tool_choice?: ToolChoice;
    data?: Record<string, string>;
};
type UseChatOptions = {
    /**
     * The API endpoint that accepts a `{ messages: Message[] }` object and returns
     * a stream of tokens of the AI chat response. Defaults to `/api/chat`.
     */
    api?: string;
    /**
     * A unique identifier for the chat. If not provided, a random one will be
     * generated. When provided, the `useChat` hook with the same `id` will
     * have shared states across components.
     */
    id?: string;
    /**
     * Initial messages of the chat. Useful to load an existing chat history.
     */
    initialMessages?: Message$1[];
    /**
     * Initial input of the chat.
     */
    initialInput?: string;
    /**
     * Callback function to be called when a function call is received.
     * If the function returns a `ChatRequest` object, the request will be sent
     * automatically to the API and will be used to update the chat.
     */
    experimental_onFunctionCall?: FunctionCallHandler;
    /**
     * Callback function to be called when a tool call is received.
     * If the function returns a `ChatRequest` object, the request will be sent
     * automatically to the API and will be used to update the chat.
     */
    experimental_onToolCall?: ToolCallHandler;
    /**
     * Callback function to be called when the API response is received.
     */
    onResponse?: (response: Response) => void | Promise<void>;
    /**
     * Callback function to be called when the chat is finished streaming.
     */
    onFinish?: (message: Message$1) => void;
    /**
     * Callback function to be called when an error is encountered.
     */
    onError?: (error: Error) => void;
    /**
     * A way to provide a function that is going to be used for ids for messages.
     * If not provided nanoid is used by default.
     */
    generateId?: IdGenerator;
    /**
     * The credentials mode to be used for the fetch request.
     * Possible values are: 'omit', 'same-origin', 'include'.
     * Defaults to 'same-origin'.
     */
    credentials?: RequestCredentials;
    /**
     * HTTP headers to be sent with the API request.
     */
    headers?: Record<string, string> | Headers;
    /**
     * Extra body object to be sent with the API request.
     * @example
     * Send a `sessionId` to the API along with the messages.
     * ```js
     * useChat({
     *   body: {
     *     sessionId: '123',
     *   }
     * })
     * ```
     */
    body?: object;
    /**
     * Whether to send extra message fields such as `message.id` and `message.createdAt` to the API.
     * Defaults to `false`. When set to `true`, the API endpoint might need to
     * handle the extra fields before forwarding the request to the AI service.
     */
    sendExtraMessageFields?: boolean;
};
type UseCompletionOptions = {
    /**
     * The API endpoint that accepts a `{ prompt: string }` object and returns
     * a stream of tokens of the AI completion response. Defaults to `/api/completion`.
     */
    api?: string;
    /**
     * An unique identifier for the chat. If not provided, a random one will be
     * generated. When provided, the `useChat` hook with the same `id` will
     * have shared states across components.
     */
    id?: string;
    /**
     * Initial prompt input of the completion.
     */
    initialInput?: string;
    /**
     * Initial completion result. Useful to load an existing history.
     */
    initialCompletion?: string;
    /**
     * Callback function to be called when the API response is received.
     */
    onResponse?: (response: Response) => void | Promise<void>;
    /**
     * Callback function to be called when the completion is finished streaming.
     */
    onFinish?: (prompt: string, completion: string) => void;
    /**
     * Callback function to be called when an error is encountered.
     */
    onError?: (error: Error) => void;
    /**
     * The credentials mode to be used for the fetch request.
     * Possible values are: 'omit', 'same-origin', 'include'.
     * Defaults to 'same-origin'.
     */
    credentials?: RequestCredentials;
    /**
     * HTTP headers to be sent with the API request.
     */
    headers?: Record<string, string> | Headers;
    /**
     * Extra body object to be sent with the API request.
     * @example
     * Send a `sessionId` to the API along with the prompt.
     * ```js
     * useChat({
     *   body: {
     *     sessionId: '123',
     *   }
     * })
     * ```
     */
    body?: object;
};
type JSONValue = null | string | number | boolean | {
    [x: string]: JSONValue;
} | Array<JSONValue>;
type AssistantMessage = {
    id: string;
    role: 'assistant';
    content: Array<{
        type: 'text';
        text: {
            value: string;
        };
    }>;
};
type DataMessage = {
    id?: string;
    role: 'data';
    data: JSONValue;
};

interface StreamPart<CODE extends string, NAME extends string, TYPE> {
    code: CODE;
    name: NAME;
    parse: (value: JSONValue) => {
        type: NAME;
        value: TYPE;
    };
}
declare const textStreamPart: StreamPart<'0', 'text', string>;
declare const functionCallStreamPart: StreamPart<'1', 'function_call', {
    function_call: FunctionCall;
}>;
declare const dataStreamPart: StreamPart<'2', 'data', Array<JSONValue>>;
declare const errorStreamPart: StreamPart<'3', 'error', string>;
declare const assistantMessageStreamPart: StreamPart<'4', 'assistant_message', AssistantMessage>;
declare const assistantControlDataStreamPart: StreamPart<'5', 'assistant_control_data', {
    threadId: string;
    messageId: string;
}>;
declare const dataMessageStreamPart: StreamPart<'6', 'data_message', DataMessage>;
declare const toolCallStreamPart: StreamPart<'7', 'tool_calls', {
    tool_calls: ToolCall[];
}>;
type StreamPartType = ReturnType<typeof textStreamPart.parse> | ReturnType<typeof functionCallStreamPart.parse> | ReturnType<typeof dataStreamPart.parse> | ReturnType<typeof errorStreamPart.parse> | ReturnType<typeof assistantMessageStreamPart.parse> | ReturnType<typeof assistantControlDataStreamPart.parse> | ReturnType<typeof dataMessageStreamPart.parse> | ReturnType<typeof toolCallStreamPart.parse>;
/**
 * The map of prefixes for data in the stream
 *
 * - 0: Text from the LLM response
 * - 1: (OpenAI) function_call responses
 * - 2: custom JSON added by the user using `Data`
 * - 6: (OpenAI) tool_call responses
 *
 * Example:
 * ```
 * 0:Vercel
 * 0:'s
 * 0: AI
 * 0: AI
 * 0: SDK
 * 0: is great
 * 0:!
 * 2: { "someJson": "value" }
 * 1: {"function_call": {"name": "get_current_weather", "arguments": "{\\n\\"location\\": \\"Charlottesville, Virginia\\",\\n\\"format\\": \\"celsius\\"\\n}"}}
 * 6: {"tool_call": {"id": "tool_0", "type": "function", "function": {"name": "get_current_weather", "arguments": "{\\n\\"location\\": \\"Charlottesville, Virginia\\",\\n\\"format\\": \\"celsius\\"\\n}"}}}
 *```
 */
declare const StreamStringPrefixes: {
    readonly text: "0";
    readonly function_call: "1";
    readonly data: "2";
    readonly error: "3";
    readonly assistant_message: "4";
    readonly assistant_control_data: "5";
    readonly data_message: "6";
    readonly tool_calls: "7";
};

declare const nanoid: (size?: number | undefined) => string;
declare function createChunkDecoder(): (chunk: Uint8Array | undefined) => string;
declare function createChunkDecoder(complex: false): (chunk: Uint8Array | undefined) => string;
declare function createChunkDecoder(complex: true): (chunk: Uint8Array | undefined) => StreamPartType[];
declare function createChunkDecoder(complex?: boolean): (chunk: Uint8Array | undefined) => StreamPartType[] | string;

declare const isStreamStringEqualToType: (type: keyof typeof StreamStringPrefixes, value: string) => value is `0:${string}\n` | `1:${string}\n` | `2:${string}\n` | `3:${string}\n` | `4:${string}\n` | `5:${string}\n` | `6:${string}\n` | `7:${string}\n`;
type StreamString = `${(typeof StreamStringPrefixes)[keyof typeof StreamStringPrefixes]}:${string}\n`;
/**
 * A header sent to the client so it knows how to handle parsing the stream (as a deprecated text response or using the new prefixed protocol)
 */
declare const COMPLEX_HEADER = "X-Experimental-Stream-Data";

type OpenAIStreamCallbacks = AIStreamCallbacksAndOptions & {
    /**
     * @example
     * ```js
     * const response = await openai.chat.completions.create({
     *   model: 'gpt-3.5-turbo-0613',
     *   stream: true,
     *   messages,
     *   functions,
     * })
     *
     * const stream = OpenAIStream(response, {
     *   experimental_onFunctionCall: async (functionCallPayload, createFunctionCallMessages) => {
     *     // ... run your custom logic here
     *     const result = await myFunction(functionCallPayload)
     *
     *     // Ask for another completion, or return a string to send to the client as an assistant message.
     *     return await openai.chat.completions.create({
     *       model: 'gpt-3.5-turbo-0613',
     *       stream: true,
     *       // Append the relevant "assistant" and "function" call messages
     *       messages: [...messages, ...createFunctionCallMessages(result)],
     *       functions,
     *     })
     *   }
     * })
     * ```
     */
    experimental_onFunctionCall?: (functionCallPayload: FunctionCallPayload, createFunctionCallMessages: (functionCallResult: JSONValue) => CreateMessage[]) => Promise<Response | undefined | void | string | AsyncIterableOpenAIStreamReturnTypes>;
    /**
     * @example
     * ```js
     * const response = await openai.chat.completions.create({
     *   model: 'gpt-3.5-turbo-1106', // or gpt-4-1106-preview
     *   stream: true,
     *   messages,
     *   tools,
     *   tool_choice: "auto", // auto is default, but we'll be explicit
     * })
     *
     * const stream = OpenAIStream(response, {
     *   experimental_onToolCall: async (toolCallPayload, appendToolCallMessages) => {
     *    let messages: CreateMessage[] = []
     *    //   There might be multiple tool calls, so we need to iterate through them
     *    for (const tool of toolCallPayload.tools) {
     *     // ... run your custom logic here
     *     const result = await myFunction(tool.function)
     *    // Append the relevant "assistant" and "tool" call messages
     *     appendToolCallMessage({tool_call_id:tool.id, function_name:tool.function.name, tool_call_result:result})
     *    }
     *     // Ask for another completion, or return a string to send to the client as an assistant message.
     *     return await openai.chat.completions.create({
     *       model: 'gpt-3.5-turbo-1106', // or gpt-4-1106-preview
     *       stream: true,
     *       // Append the results messages, calling appendToolCallMessage without
     *       // any arguments will jsut return the accumulated messages
     *       messages: [...messages, ...appendToolCallMessage()],
     *       tools,
     *        tool_choice: "auto", // auto is default, but we'll be explicit
     *     })
     *   }
     * })
     * ```
     */
    experimental_onToolCall?: (toolCallPayload: ToolCallPayload, appendToolCallMessage: (result?: {
        tool_call_id: string;
        function_name: string;
        tool_call_result: JSONValue;
    }) => CreateMessage[]) => Promise<Response | undefined | void | string | AsyncIterableOpenAIStreamReturnTypes>;
};
interface ChatCompletionChunk {
    id: string;
    choices: Array<ChatCompletionChunkChoice>;
    created: number;
    model: string;
    object: string;
}
interface ChatCompletionChunkChoice {
    delta: ChoiceDelta;
    finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | 'function_call' | null;
    index: number;
}
interface ChoiceDelta {
    /**
     * The contents of the chunk message.
     */
    content?: string | null;
    /**
     * The name and arguments of a function that should be called, as generated by the
     * model.
     */
    function_call?: FunctionCall;
    /**
     * The role of the author of this message.
     */
    role?: 'system' | 'user' | 'assistant' | 'tool';
    tool_calls?: Array<DeltaToolCall>;
}
interface DeltaToolCall {
    index: number;
    /**
     * The ID of the tool call.
     */
    id?: string;
    /**
     * The function that the model called.
     */
    function?: ToolCallFunction;
    /**
     * The type of the tool. Currently, only `function` is supported.
     */
    type?: 'function';
}
interface ToolCallFunction {
    /**
     * The arguments to call the function with, as generated by the model in JSON
     * format. Note that the model does not always generate valid JSON, and may
     * hallucinate parameters not defined by your function schema. Validate the
     * arguments in your code before calling your function.
     */
    arguments?: string;
    /**
     * The name of the function to call.
     */
    name?: string;
}
/**
 * https://github.com/openai/openai-node/blob/3ec43ee790a2eb6a0ccdd5f25faa23251b0f9b8e/src/resources/completions.ts#L28C1-L64C1
 * Completions API. Streamed and non-streamed responses are the same.
 */
interface Completion {
    /**
     * A unique identifier for the completion.
     */
    id: string;
    /**
     * The list of completion choices the model generated for the input prompt.
     */
    choices: Array<CompletionChoice>;
    /**
     * The Unix timestamp of when the completion was created.
     */
    created: number;
    /**
     * The model used for completion.
     */
    model: string;
    /**
     * The object type, which is always "text_completion"
     */
    object: string;
    /**
     * Usage statistics for the completion request.
     */
    usage?: CompletionUsage;
}
interface CompletionChoice {
    /**
     * The reason the model stopped generating tokens. This will be `stop` if the model
     * hit a natural stop point or a provided stop sequence, or `length` if the maximum
     * number of tokens specified in the request was reached.
     */
    finish_reason: 'stop' | 'length' | 'content_filter';
    index: number;
    logprobs: any | null;
    text: string;
}
interface CompletionUsage {
    /**
     * Usage statistics for the completion request.
     */
    /**
     * Number of tokens in the generated completion.
     */
    completion_tokens: number;
    /**
     * Number of tokens in the prompt.
     */
    prompt_tokens: number;
    /**
     * Total number of tokens used in the request (prompt + completion).
     */
    total_tokens: number;
}
type AsyncIterableOpenAIStreamReturnTypes = AsyncIterable<ChatCompletionChunk> | AsyncIterable<Completion>;
declare function OpenAIStream(res: Response | AsyncIterableOpenAIStreamReturnTypes, callbacks?: OpenAIStreamCallbacks): ReadableStream;

interface FunctionCallPayload {
    name: string;
    arguments: Record<string, unknown>;
}
interface ToolCallPayload {
    tools: {
        id: string;
        type: 'function';
        func: {
            name: string;
            arguments: Record<string, unknown>;
        };
    }[];
}
/**
 * Configuration options and helper callback methods for AIStream stream lifecycle events.
 * @interface
 */
interface AIStreamCallbacksAndOptions {
    /** `onStart`: Called once when the stream is initialized. */
    onStart?: () => Promise<void> | void;
    /** `onCompletion`: Called for each tokenized message. */
    onCompletion?: (completion: string) => Promise<void> | void;
    /** `onFinal`: Called once when the stream is closed with the final completion message. */
    onFinal?: (completion: string) => Promise<void> | void;
    /** `onToken`: Called for each tokenized message. */
    onToken?: (token: string) => Promise<void> | void;
    /**
     * A flag for enabling the experimental_StreamData class and the new protocol.
     * @see https://github.com/vercel-labs/ai/pull/425
     *
     * When StreamData is rolled out, this will be removed and the new protocol will be used by default.
     */
    experimental_streamData?: boolean;
}
/**
 * Custom parser for AIStream data.
 * @interface
 */
interface AIStreamParser {
    (data: string): string | void;
}
/**
 * Creates a TransformStream that parses events from an EventSource stream using a custom parser.
 * @param {AIStreamParser} customParser - Function to handle event data.
 * @returns {TransformStream<Uint8Array, string>} TransformStream parsing events.
 */
declare function createEventStreamTransformer(customParser?: AIStreamParser): TransformStream<Uint8Array, string>;
/**
 * Creates a transform stream that encodes input messages and invokes optional callback functions.
 * The transform stream uses the provided callbacks to execute custom logic at different stages of the stream's lifecycle.
 * - `onStart`: Called once when the stream is initialized.
 * - `onToken`: Called for each tokenized message.
 * - `onCompletion`: Called every time an AIStream completion message is received. This can occur multiple times when using e.g. OpenAI functions
 * - `onFinal`: Called once when the stream is closed with the final completion message.
 *
 * This function is useful when you want to process a stream of messages and perform specific actions during the stream's lifecycle.
 *
 * @param {AIStreamCallbacksAndOptions} [callbacks] - An object containing the callback functions.
 * @return {TransformStream<string, Uint8Array>} A transform stream that encodes input messages as Uint8Array and allows the execution of custom logic through callbacks.
 *
 * @example
 * const callbacks = {
 *   onStart: async () => console.log('Stream started'),
 *   onToken: async (token) => console.log(`Token: ${token}`),
 *   onCompletion: async (completion) => console.log(`Completion: ${completion}`)
 *   onFinal: async () => data.close()
 * };
 * const transformer = createCallbacksTransformer(callbacks);
 */
declare function createCallbacksTransformer(cb: AIStreamCallbacksAndOptions | OpenAIStreamCallbacks | undefined): TransformStream<string, Uint8Array>;
/**
 * Returns a stateful function that, when invoked, trims leading whitespace
 * from the input text. The trimming only occurs on the first invocation, ensuring that
 * subsequent calls do not alter the input text. This is particularly useful in scenarios
 * where a text stream is being processed and only the initial whitespace should be removed.
 *
 * @return {function(string): string} A function that takes a string as input and returns a string
 * with leading whitespace removed if it is the first invocation; otherwise, it returns the input unchanged.
 *
 * @example
 * const trimStart = trimStartOfStreamHelper();
 * const output1 = trimStart("   text"); // "text"
 * const output2 = trimStart("   text"); // "   text"
 *
 */
declare function trimStartOfStreamHelper(): (text: string) => string;
/**
 * Returns a ReadableStream created from the response, parsed and handled with custom logic.
 * The stream goes through two transformation stages, first parsing the events and then
 * invoking the provided callbacks.
 *
 * For 2xx HTTP responses:
 * - The function continues with standard stream processing.
 *
 * For non-2xx HTTP responses:
 * - If the response body is defined, it asynchronously extracts and decodes the response body.
 * - It then creates a custom ReadableStream to propagate a detailed error message.
 *
 * @param {Response} response - The response.
 * @param {AIStreamParser} customParser - The custom parser function.
 * @param {AIStreamCallbacksAndOptions} callbacks - The callbacks.
 * @return {ReadableStream} The AIStream.
 * @throws Will throw an error if the response is not OK.
 */
declare function AIStream(response: Response, customParser?: AIStreamParser, callbacks?: AIStreamCallbacksAndOptions): ReadableStream<Uint8Array>;
/**
 * Implements ReadableStream.from(asyncIterable), which isn't documented in MDN and isn't implemented in node.
 * https://github.com/whatwg/streams/commit/8d7a0bf26eb2cc23e884ddbaac7c1da4b91cf2bc
 */
declare function readableFromAsyncIterable<T>(iterable: AsyncIterable<T>): ReadableStream<T>;

interface CompletionChunk {
    /**
     * The resulting completion up to and excluding the stop sequences.
     */
    completion: string;
    /**
     * The model that performed the completion.
     */
    model: string;
    /**
     * The reason that we stopped sampling.
     *
     * This may be one the following values:
     *
     * - `"stop_sequence"`: we reached a stop sequence — either provided by you via the
     *   `stop_sequences` parameter, or a stop sequence built into the model
     * - `"max_tokens"`: we exceeded `max_tokens_to_sample` or the model's maximum
     */
    stop_reason: string;
}
interface Message {
    id: string;
    content: Array<ContentBlock>;
    model: string;
    role: 'assistant';
    stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence' | null;
    stop_sequence: string | null;
    type: 'message';
}
interface ContentBlock {
    text: string;
    type: 'text';
}
interface TextDelta {
    text: string;
    type: 'text_delta';
}
interface ContentBlockDeltaEvent {
    delta: TextDelta;
    index: number;
    type: 'content_block_delta';
}
interface ContentBlockStartEvent {
    content_block: ContentBlock;
    index: number;
    type: 'content_block_start';
}
interface ContentBlockStopEvent {
    index: number;
    type: 'content_block_stop';
}
interface MessageDeltaEventDelta {
    stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence' | null;
    stop_sequence: string | null;
}
interface MessageDeltaEvent {
    delta: MessageDeltaEventDelta;
    type: 'message_delta';
}
type MessageStreamEvent = MessageStartEvent | MessageDeltaEvent | MessageStopEvent | ContentBlockStartEvent | ContentBlockDeltaEvent | ContentBlockStopEvent;
interface MessageStartEvent {
    message: Message;
    type: 'message_start';
}
interface MessageStopEvent {
    type: 'message_stop';
}
/**
 * Accepts either a fetch Response from the Anthropic `POST /v1/complete` endpoint,
 * or the return value of `await client.completions.create({ stream: true })`
 * from the `@anthropic-ai/sdk` package.
 */
declare function AnthropicStream(res: Response | AsyncIterable<CompletionChunk> | AsyncIterable<MessageStreamEvent>, cb?: AIStreamCallbacksAndOptions): ReadableStream;

type AssistantResponseSettings = {
    threadId: string;
    messageId: string;
};
type AssistantResponseCallback = (stream: {
    threadId: string;
    messageId: string;
    sendMessage: (message: AssistantMessage) => void;
    sendDataMessage: (message: DataMessage) => void;
}) => Promise<void>;
declare function experimental_AssistantResponse({ threadId, messageId }: AssistantResponseSettings, process: AssistantResponseCallback): Response;

interface AWSBedrockResponse {
    body?: AsyncIterable<{
        chunk?: {
            bytes?: Uint8Array;
        };
    }>;
}
declare function AWSBedrockAnthropicStream(response: AWSBedrockResponse, callbacks?: AIStreamCallbacksAndOptions): ReadableStream;
declare function AWSBedrockCohereStream(response: AWSBedrockResponse, callbacks?: AIStreamCallbacksAndOptions): ReadableStream;
declare function AWSBedrockLlama2Stream(response: AWSBedrockResponse, callbacks?: AIStreamCallbacksAndOptions): ReadableStream;
declare function AWSBedrockStream(response: AWSBedrockResponse, callbacks: AIStreamCallbacksAndOptions | undefined, extractTextDeltaFromChunk: (chunk: any) => string): ReadableStream<any>;

declare function CohereStream(reader: Response, callbacks?: AIStreamCallbacksAndOptions): ReadableStream;

interface GenerateContentResponse {
    candidates?: GenerateContentCandidate[];
}
interface GenerateContentCandidate {
    index: number;
    content: Content;
}
interface Content {
    role: string;
    parts: Part[];
}
type Part = TextPart | InlineDataPart;
interface InlineDataPart {
    text?: never;
}
interface TextPart {
    text: string;
    inlineData?: never;
}
declare function GoogleGenerativeAIStream(response: {
    stream: AsyncIterable<GenerateContentResponse>;
}, cb?: AIStreamCallbacksAndOptions): ReadableStream;

declare function HuggingFaceStream(res: AsyncGenerator<any>, callbacks?: AIStreamCallbacksAndOptions): ReadableStream;

declare function LangChainStream(callbacks?: AIStreamCallbacksAndOptions): {
    stream: ReadableStream<any>;
    writer: WritableStreamDefaultWriter<any>;
    handlers: {
        handleLLMNewToken: (token: string) => Promise<void>;
        handleLLMStart: (_llm: any, _prompts: string[], runId: string) => Promise<void>;
        handleLLMEnd: (_output: any, runId: string) => Promise<void>;
        handleLLMError: (e: Error, runId: string) => Promise<void>;
        handleChainStart: (_chain: any, _inputs: any, runId: string) => Promise<void>;
        handleChainEnd: (_outputs: any, runId: string) => Promise<void>;
        handleChainError: (e: Error, runId: string) => Promise<void>;
        handleToolStart: (_tool: any, _input: string, runId: string) => Promise<void>;
        handleToolEnd: (_output: string, runId: string) => Promise<void>;
        handleToolError: (e: Error, runId: string) => Promise<void>;
    };
};

interface Prediction {
    id: string;
    status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
    version: string;
    input: object;
    output?: any;
    source: 'api' | 'web';
    error?: any;
    logs?: string;
    metrics?: {
        predict_time?: number;
    };
    webhook?: string;
    webhook_events_filter?: ('start' | 'output' | 'logs' | 'completed')[];
    created_at: string;
    updated_at?: string;
    completed_at?: string;
    urls: {
        get: string;
        cancel: string;
        stream?: string;
    };
}
/**
 * Stream predictions from Replicate.
 * Only certain models are supported and you must pass `stream: true` to
 * replicate.predictions.create().
 * @see https://github.com/replicate/replicate-javascript#streaming
 *
 * @example
 * const response = await replicate.predictions.create({
 *  stream: true,
 *  input: {
 *    prompt: messages.join('\n')
 *  },
 *  version: '2c1608e18606fad2812020dc541930f2d0495ce32eee50074220b87300bc16e1'
 * })
 *
 * const stream = await ReplicateStream(response)
 * return new StreamingTextResponse(stream)
 *
 */
declare function ReplicateStream(res: Prediction, cb?: AIStreamCallbacksAndOptions, options?: {
    headers?: Record<string, string>;
}): Promise<ReadableStream>;

/**
 * A stream wrapper to send custom JSON-encoded data back to the client.
 */
declare class experimental_StreamData {
    private encoder;
    private controller;
    stream: TransformStream<Uint8Array, Uint8Array>;
    private isClosedPromise;
    private isClosedPromiseResolver;
    private isClosed;
    private data;
    constructor();
    close(): Promise<void>;
    append(value: JSONValue): void;
}
/**
 * A TransformStream for LLMs that do not have their own transform stream handlers managing encoding (e.g. OpenAIStream has one for function call handling).
 * This assumes every chunk is a 'text' chunk.
 */
declare function createStreamDataTransformer(experimental_streamData: boolean | undefined): TransformStream<any, any>;

/**
 * This is a naive implementation of the streaming React response API.
 * Currently, it can carry the original raw content, data payload and a special
 * UI payload and stream them via "rows" (nested promises).
 * It must be used inside Server Actions so Flight can encode the React elements.
 *
 * It is naive as unlike the StreamingTextResponse, it does not send the diff
 * between the rows, but flushing the full payload on each row.
 */

type UINode = string | JSX.Element | JSX.Element[] | null | undefined;
type Payload = {
    ui: UINode | Promise<UINode>;
    content: string;
};
type ReactResponseRow = Payload & {
    next: null | Promise<ReactResponseRow>;
};
/**
 * A utility class for streaming React responses.
 */
declare class experimental_StreamingReactResponse {
    constructor(res: ReadableStream, options?: {
        ui?: (message: {
            content: string;
            data?: JSONValue[] | undefined;
        }) => UINode | Promise<UINode>;
        data?: experimental_StreamData;
        generateId?: IdGenerator;
    });
}

/**
 * A utility class for streaming text responses.
 */
declare class StreamingTextResponse extends Response {
    constructor(res: ReadableStream, init?: ResponseInit, data?: experimental_StreamData);
}
/**
 * A utility function to stream a ReadableStream to a Node.js response-like object.
 */
declare function streamToResponse(res: ReadableStream, response: ServerResponse, init?: {
    headers?: Record<string, string>;
    status?: number;
}): void;

export { AIStream, AIStreamCallbacksAndOptions, AIStreamParser, AWSBedrockAnthropicStream, AWSBedrockCohereStream, AWSBedrockLlama2Stream, AWSBedrockStream, AnthropicStream, AssistantMessage, COMPLEX_HEADER, ChatRequest, ChatRequestOptions, CohereStream, CompletionUsage, CreateMessage, DataMessage, Function, FunctionCall, FunctionCallHandler, FunctionCallPayload, GoogleGenerativeAIStream, HuggingFaceStream, IdGenerator, JSONValue, LangChainStream, Message$1 as Message, OpenAIStream, OpenAIStreamCallbacks, ReactResponseRow, ReplicateStream, RequestOptions, StreamString, StreamingTextResponse, Tool, ToolCall, ToolCallHandler, ToolCallPayload, ToolChoice, UseChatOptions, UseCompletionOptions, createCallbacksTransformer, createChunkDecoder, createEventStreamTransformer, createStreamDataTransformer, experimental_AssistantResponse, experimental_StreamData, experimental_StreamingReactResponse, isStreamStringEqualToType, nanoid, readableFromAsyncIterable, streamToResponse, trimStartOfStreamHelper };
