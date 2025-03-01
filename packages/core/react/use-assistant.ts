/* eslint-disable react-hooks/rules-of-hooks */

import { useState } from 'react';
import { readDataStream } from '../shared/read-data-stream';
import { Message } from '../shared/types';

export type AssistantStatus = 'in_progress' | 'awaiting_message';

export type UseAssistantHelpers = {
  /**
   * The current array of chat messages.
   */
  messages: Message[];

  /**
   * The current thread ID.
   */
  threadId: string | undefined;

  /**
   * The current value of the input field.
   */
  input: string;

  /**
   * setState-powered method to update the input value.
   */
  setInput: React.Dispatch<React.SetStateAction<string>>;

  /**
   * setState-powered method to update the messages.
   */
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;

  /**
   * Load a thread's messages by its ID.
   * @param threadId
   */
  loadThread: (threadId?: string) => Promise<void>;

  /**
   * Handler for the `onChange` event of the input field to control the input's value.
   */
  handleInputChange: (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => void;

  /**
   * Form submission handler that automatically resets the input field and appends a user message.
   */
  submitMessage: (
    event?: React.FormEvent<HTMLFormElement>,
    requestOptions?: {
      data?: Record<string, string>;
    },
  ) => Promise<void>;

  /**
   * The current status of the assistant. This can be used to show a loading indicator.
   */
  status: AssistantStatus;

  /**
   * The error thrown during the assistant message processing, if any.
   */
  error: undefined | unknown;
};

export type UseAssistantOptions = {
  /**
   * The API endpoint that accepts a `{ threadId: string | null; message: string; }` object and returns an `AssistantResponse` stream.
   * The threadId refers to an existing thread with messages (or is `null` to create a new thread).
   * The message is the next message that should be appended to the thread and sent to the assistant.
   */
  api: string;

  /**
   * An optional string that represents the ID of an existing thread.
   * If not provided, a new thread will be created.
   */
  threadId?: string | undefined;

  /**
   * An optional literal that sets the mode of credentials to be used on the request.
   * Defaults to "same-origin".
   */
  credentials?: RequestCredentials;

  /**
   * An optional object of headers to be passed to the API endpoint.
   */
  headers?: Record<string, string> | Headers;

  /**
   * An optional, additional body object to be passed to the API endpoint.
   */
  body?: object;
};

export function experimental_useAssistant({
                                            api,
                                            threadId: threadIdParam,
                                            credentials,
                                            headers,
                                            body,
                                          }: UseAssistantOptions): UseAssistantHelpers {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [threadId, setThreadId] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<AssistantStatus>('awaiting_message');
  const [error, setError] = useState<unknown | undefined>(undefined);

  const handleInputChange = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setInput(event.target.value);
  };

  const submitMessage = async (
    event?: React.FormEvent<HTMLFormElement>,
    requestOptions?: {
      data?: Record<string, string>;
    },
  ) => {
    event?.preventDefault?.();

    if (input === '') {
      return;
    }

    setStatus('in_progress');

    setMessages(messages => [
      ...messages,
      { id: '', role: 'user', content: input },
    ]);

    setInput('');
    return callApi(undefined, undefined, requestOptions?.data);
  };

  const callApi = async (_threadId?: string, action?: string, data?: Record<string, string>) => {

    const result = await fetch(api, {
      method: 'POST',
      credentials,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({
        ...body,
        // always use user-provided threadId when available:
        threadId: _threadId ?? threadIdParam ?? threadId ?? null,
        message: input,

        // optional request data:
        data,
        action: action,
      }),
    });

    if (result.body == null) {
      throw new Error('The response body is empty.');
    }

    try {
      for await (const { type, value } of readDataStream(
        result.body.getReader(),
      )) {
        switch (type) {
          case 'assistant_message': {
            setMessages(messages => [
              ...messages,
              {
                id: value.id,
                role: value.role,
                content: value.content[0].text.value,
              },
            ]);
            break;
          }

          case 'data_message': {
            setMessages(messages => [
              ...messages,
              {
                id: value.id ?? '',
                role: 'data',
                content: '',
                data: value.data,
              },
            ]);
            break;
          }

          case 'assistant_control_data': {
            setThreadId(value.threadId);

            // set id of last message:
            setMessages(messages => {
              const lastMessage = messages[messages.length - 1];
              if (lastMessage) {
                lastMessage.id = value.messageId;
                return [...messages.slice(0, messages.length - 1), lastMessage];
              }else {
                return messages;
              }
            });

            break;
          }

          case 'error': {
            setError(value);
            break;
          }
        }
      }
    } catch (error) {
      setError(error);
    }

    setStatus('awaiting_message');
  };
  const loadThread = async (threadId = threadIdParam) => {
    setThreadId(threadId);
    setMessages([]);
    setInput('');

    return callApi(threadId, 'loadPreviousMessages');
  };


  return {
    messages,
    threadId,
    input,
    setInput,
    setMessages,
    loadThread,
    handleInputChange,
    submitMessage,
    status,
    error,
  };
}
