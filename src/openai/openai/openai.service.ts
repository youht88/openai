import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Configuration, OpenAIApi } from 'openai';
import { Readable } from 'stream';
import axios from 'axios';
@Injectable()
export class OpenaiService {
  logger = new Logger(OpenaiService.name);
  constructor(private readonly conf: ConfigService) {}

  private _getOpenaiApi(apiKey?: string, organization?: string): OpenAIApi {
    if (!apiKey) {
      const apiKeys = this.conf.get('openai.apiKeys') ?? [];
      apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
    }
    this.logger.debug(
      `apiKey:${apiKey},'<==========>',organization:${organization}`,
    );
    let configuration;
    if (organization) {
      configuration = new Configuration({
        apiKey: apiKey,
        organization: configuration,
      });
    } else {
      configuration = new Configuration({
        apiKey: apiKey,
      });
    }
    return new OpenAIApi(configuration);
  }
  async test(response, client) {
    if (client) {
      console.log('test....');
      client.emit('testAck', 'start...\n');
      console.log('test first Ack');
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          client.emit('testAck', '3 second here!\n');
          setTimeout(() => {
            client.emit('testAck', '2 second here!\n');
            resolve();
          }, 2000);
        }, 3000);
      });
      client.emit('testAck', 'all done\n');
    } else {
      response.write('start...\n');
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          response.write('3 second here!\n');
          setTimeout(() => {
            response.write('2 second here!\n');
            resolve();
          }, 2000);
        }, 3000);
      });
      response.write('all done\n');
      response.end();
    }
  }
  async completionsMessage(args, response, isStream: boolean) {
    let { prompt, apiKey, organization, model, temperature, max_tokens } = args;
    apiKey = apiKey ?? null;
    organization = organization ?? null;
    model = model ?? this.conf.get('openai.completions.model');
    temperature = parseInt(temperature ?? '0');
    max_tokens = parseInt(max_tokens ?? '2048');
    prompt = prompt ?? null;

    const openaiApi: OpenAIApi = this._getOpenaiApi(apiKey, organization);

    if (!prompt) {
      throw new Error('必须指定prompt');
    }

    const options = {
      model: model,
      prompt: prompt,
      temperature: temperature,
      max_tokens: max_tokens,
      stream: isStream,
    };

    if (isStream) {
      let resStream;
      try {
        resStream = await openaiApi.createCompletion(options, {
          responseType: 'stream',
        });
      } catch (e) {
        this.logger.error(
          `apikey:${openaiApi['configuration'].apiKey},error code is :${e.code}`,
        );
        throw e;
      }
      const stream = resStream.data as any as Readable;
      stream.on('data', (chunk) => {
        try {
          // Parse the chunk as a JSON object
          const chunkStrs = chunk
            .toString()
            .split('\n')
            .filter((item) => item.trim() != '')
            .map((item) => {
              return item
                .trim()
                .replace(/^data: /, '')
                .trim();
            });
          for (const chunkStr of chunkStrs) {
            if (chunkStr.match('\\[DONE\\]')) {
              response.end();
            } else {
              try {
                const data = JSON.parse(chunkStr);
                // Write the text from the response to the output stream
                response.write(data.choices[0].text);
              } catch (e) {
                console.log(`***${chunkStr}***`, e);
              }
            }
          }
        } catch (error) {
          // End the stream but do not send the error, as this is likely the DONE message from createCompletion
          //this.logger.debug(`${error.code}`);
          console.error(error);
          response.end();
        }
      });
      stream.on('end', () => {
        response.end();
      });
      stream.on('error', (error) => {
        console.error(error);
        response.end(
          JSON.stringify({
            error: true,
            message: 'Error generating response.',
          }),
        );
      });
    } else {
      try {
        const res = await openaiApi.createCompletion(options);
        return res.data['choices'][0]['text'];
      } catch (e) {
        this.logger.error(
          `apikey:${openaiApi['configuration'].apiKey},error code is :${e.code}`,
        );
      }
    }
  }
  async chatMessage(args, others) {
    let {
      prompt,
      apiKey,
      organization,
      messages,
      model,
      temperature,
      max_tokens,
    } = args;
    let {
      response,
      isStream,
      socket,
      //abortController
      cancelTokenSource,
    } = others;
    apiKey = apiKey ?? null;
    organization = organization ?? null;
    messages = messages ?? [];
    prompt = prompt ?? null;
    model = model ?? this.conf.get('openai.chat.model') ?? '';
    temperature = parseFloat(temperature ?? '0.5');
    max_tokens = parseInt(max_tokens ?? '2048');
    const default_system = this.conf.get('openai.chat.default_system') ?? '';
    const openaiApi: OpenAIApi = this._getOpenaiApi(apiKey, organization);
    if (default_system && messages[0]['role'] != 'system') {
      messages.unshift({
        role: 'system',
        content: default_system,
      });
    }
    console.log('prompt:', prompt);
    if (prompt) {
      messages.push({ role: 'user', content: prompt });
    }

    const options = {
      model,
      messages,
      temperature,
      max_tokens,
      stream: isStream,
    };
    console.log(options);
    if (isStream) {
      let resStream;
      try {
        resStream = await openaiApi.createChatCompletion(options, {
          responseType: 'stream',
          //signal: abortController.signal,
          cancelToken: cancelTokenSource.token,
        });
      } catch (e) {
        if (axios.isCancel(e)) {
          console.log('Request aborted', e.message);
          throw e;
        } else {
          this.logger.error(
            `apikey:${openaiApi['configuration'].apiKey},error code is :${e.code}`,
          );
          throw e;
        }
      }
      const stream = resStream.data as any as Readable;
      stream.on('data', (chunk) => {
        try {
          // Parse the chunk as a JSON object
          const chunkStrs = chunk
            .toString()
            .split('\n')
            .filter((item) => item.trim() != '')
            .map((item) => {
              return item
                .trim()
                .replace(/^data: /, '')
                .trim();
            });

          for (const chunkStr of chunkStrs) {
            if (chunkStr.match('\\[DONE\\]')) {
              if (socket) {
                socket.emit('completionChunk', '[DONE]');
              } else {
                response.end();
              }
            } else {
              try {
                const data = JSON.parse(chunkStr);
                if (socket) {
                  socket.emit(
                    'completionChunk',
                    data.choices?.[0]?.delta?.content ?? '',
                  );
                } else {
                  response.write(data.choices?.[0]?.delta?.content ?? '');
                }
              } catch (e) {
                console.log(`***${chunkStr}***`, e);
              }
            }
          }
        } catch (error) {
          // End the stream but do not send the error, as this is likely the DONE message from createCompletion
          console.error(error);
          if (socket) {
            socket.emit('completionChunk', '[ERROR]');
          } else {
            response.end();
          }
        }
      });
      stream.on('end', () => {
        if (socket) {
          socket.emit('completionChunk', '[DONE]');
        } else {
          response.end();
        }
      });
      stream.on('error', (error) => {
        console.error(error);
        if (socket) {
          socket.emit('completionChunk', '[ERROR]');
        } else {
          response.end(
            JSON.stringify({
              error: true,
              message: 'Error generating response.',
            }),
          );
        }
      });
    } else {
      try {
        const res = await openaiApi.createChatCompletion(options);
        return res.data['choices'][0]['message']['content'];
      } catch (e) {
        this.logger.error(
          `apikey:${openaiApi['configuration'].apiKey},error code is :${e.code}`,
        );
      }
    }
  }

  async editMessage(message: string, args) {
    const openaiApi: OpenAIApi = this._getOpenaiApi(
      args?.apiKey,
      args?.organization,
    );
    const response = await openaiApi.createEdit({
      model: args.model ?? 'text-davinci-edit-001',
      instruction: message,
      input: args.input ?? '',
      temperature: parseInt(args.temperature) || 0,
    });
    return response.data;
  }
  async getImage(prompt: string, args) {
    const openaiApi: OpenAIApi = this._getOpenaiApi(
      args?.apiKey,
      args?.organization,
    );
    let sizeStr;
    const sizeMode = args?.sizeMode ?? 'm';
    const n = args?.n ?? 1;
    if (sizeMode == 's') {
      sizeStr = '256x256';
    } else if (sizeMode == 'm') {
      sizeStr = '512x512';
    } else if (sizeMode == 'l') {
      sizeStr = '1024x1024';
    } else {
      sizeStr = sizeMode;
    }
    const response = await openaiApi.createImage({
      prompt,
      n,
      size: sizeStr,
    });
    return response.data;
  }
  async createFile(args) {
    // const openaiApi: OpenAIApi = this._getOpenaiApi(
    //   args?.apiKey,
    //   args?.organization,
    // );
    // const response = await openaiApi.createFile(,"fine-tune");
    // return response.data;
  }
  async listFiles(args) {
    const openaiApi: OpenAIApi = this._getOpenaiApi(
      args?.apiKey,
      args?.organization,
    );
    const response = await openaiApi.listFiles();
    return response.data;
  }
  async delFile(file: string, args) {
    const openaiApi: OpenAIApi = this._getOpenaiApi(
      args?.apiKey,
      args?.organization,
    );
    const response = await openaiApi.deleteFile(file);
    return response.data;
  }
  async listModels(args) {
    const openaiApi: OpenAIApi = this._getOpenaiApi(
      args?.apiKey,
      args?.organization,
    );
    const response = await openaiApi.listModels();
    if (args.name) {
      return response.data.data.filter((item) => item.id.match(args.name));
    } else {
      return response.data.data;
    }
  }
  async delModel(model: string, args) {
    const openaiApi: OpenAIApi = this._getOpenaiApi(
      args?.apiKey,
      args?.organization,
    );
    const response = await openaiApi.deleteModel(model);
    return response.data;
  }
  async createFineTunes(args) {
    const openaiApi: OpenAIApi = this._getOpenaiApi(
      args?.apiKey,
      args?.organization,
    );
    const response = await openaiApi.createFineTune({
      training_file: args?.training_file,
      validation_file: args?.validation_file,
      model: args?.model,
      n_epochs: args?.n_epochs,
      batch_size: args?.batch_size,
      learning_rate_multiplier: args?.learning_rate_multiplier,
      suffix: args?.suffix,
    });
    return response.data;
  }
  async listFineTunes(args) {
    const openaiApi: OpenAIApi = this._getOpenaiApi(
      args?.apiKey,
      args?.organization,
    );
    const response = await openaiApi.listFineTunes();
    return response.data;
  }
}
