import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Configuration, OpenAIApi } from "openai";
import { Readable } from "stream";

@Injectable()
export class OpenaiService {
  logger = new Logger(OpenaiService.name);
  constructor(private readonly conf: ConfigService) {}

  private _getOpenaiApi(apiKey?: string, organization?: string): OpenAIApi {
    if (!apiKey) {
      const apiKeys = JSON.parse(this.conf.get("openai.apiKeys") ?? "[]");
      apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
    }
    this.logger.debug(
      `apiKey:${apiKey},'<==========>',organization:${organization}`
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
  async completionsMessage(prompt: string, response, isStream, args) {
    const openaiApi: OpenAIApi = this._getOpenaiApi(
      args?.apiKey,
      args?.organization
    );
    const model = args.model ?? this.conf.get("openai.completions.model") ?? "";
    const temperature = parseInt(args.temperature) || 0;
    const max_tokens = parseInt(args.max_tokens) || 2048;
    if (isStream) {
      let resStream;
      try {
        resStream = await openaiApi.createCompletion(
          {
            model: model,
            prompt: prompt,
            temperature: temperature,
            max_tokens: max_tokens,
            stream: isStream,
          },
          { responseType: "stream" }
        );
      } catch (e) {
        this.logger.error(
          `apikey:${openaiApi["configuration"].apiKey},error code is :${e.code}`
        );
        throw e;
      }
      const stream = resStream.data as any as Readable;
      let streamHead = true;
      stream.on("data", (chunk) => {
        try {
          // Parse the chunk as a JSON object
          const chunkStrs = chunk
            .toString()
            .split("\n")
            .filter((item) => item.trim() != "")
            .map((item) => {
              return item
                .trim()
                .replace(/^data: /, "")
                .trim();
            });
          for (const chunkStr of chunkStrs) {
            if (chunkStr.match("\\[DONE\\]")) {
              response.end();
            } else {
              try {
                const data = JSON.parse(chunkStr);
                // Write the text from the response to the output stream
                response.write(data.choices[0].text);
                streamHead = false;
                // Send immediately to allow chunks to be sent as they arrive
                //response.flush();
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
      stream.on("end", () => {
        response.end();
      });
      stream.on("error", (error) => {
        console.error(error);
        response.end(
          JSON.stringify({ error: true, message: "Error generating response." })
        );
      });
    } else {
      try {
        const res = await openaiApi.createCompletion({
          model: model,
          prompt: prompt,
          temperature: temperature,
          max_tokens: max_tokens,
        });
        return res.data["choices"][0]["text"];
      } catch (e) {
        this.logger.error(
          `apikey:${openaiApi["configuration"].apiKey},error code is :${e.code}`
        );
      }
    }
  }
  async chatMessage(
    prompt: string,
    response,
    isStream: boolean,
    preMessages,
    args
  ) {
    const openaiApi: OpenAIApi = this._getOpenaiApi(
      args?.apiKey,
      args?.organization
    );
    const messages = preMessages ?? [];

    messages.push({
      role: "system",
      content: "以下回答都用日语,不可以使用其他语言回答问题",
    });
    messages.push({
      role: "user",
      content: "playwright and puppetter ,which better?",
    });
    messages.push({ role: "assistant", content: "都行" });
    messages.push({
      role: "user",
      content: "怎么有效学习?",
    });
    messages.push({ role: "assistant", content: "看着办" });
    messages.push({ role: "assistant", content: "都行" });
    messages.push({
      role: "user",
      content: "你会什么?",
    });
    messages.push({ role: "assistant", content: "都会" });
    messages.push({ role: "user", content: prompt });
    const model = args.model ?? this.conf.get("openai.chat.model") ?? "";
    const temperature = parseInt(args.temperature) || 0.5;
    const max_tokens = parseInt(args.max_tokens) || 2048;
    if (isStream) {
      let resStream;
      try {
        resStream = await openaiApi.createChatCompletion(
          {
            model: model,
            messages: messages,
            temperature: temperature,
            max_tokens: max_tokens,
            stream: isStream,
          },
          { responseType: "stream" }
        );
      } catch (e) {
        this.logger.error(
          `apikey:${openaiApi["configuration"].apiKey},error code is :${e.code}`
        );
        throw e;
      }
      const stream = resStream.data as any as Readable;
      let streamHead = true;
      stream.on("data", (chunk) => {
        try {
          // Parse the chunk as a JSON object
          const chunkStrs = chunk
            .toString()
            .split("\n")
            .filter((item) => item.trim() != "")
            .map((item) => {
              return item
                .trim()
                .replace(/^data: /, "")
                .trim();
            });

          for (const chunkStr of chunkStrs) {
            if (chunkStr.match("\\[DONE\\]")) {
              response.end();
            } else {
              try {
                const data = JSON.parse(chunkStr);
                // Write the text from the response to the output stream
                response.write(data.choices?.[0]?.delta?.content ?? "");
              } catch (e) {
                console.log(`***${chunkStr}***`, e);
              }
              streamHead = false;
              // Send immediately to allow chunks to be sent as they arrive
              //response.flush();
            }
          }
        } catch (error) {
          // End the stream but do not send the error, as this is likely the DONE message from createCompletion
          console.error(error);
          response.end();
        }
      });
      stream.on("end", () => {
        response.end();
      });
      stream.on("error", (error) => {
        console.error(error);
        response.end(
          JSON.stringify({ error: true, message: "Error generating response." })
        );
      });
    } else {
      try {
        const res = await openaiApi.createChatCompletion({
          model: model,
          messages: messages,
          temperature: temperature,
          max_tokens: max_tokens,
        });
        return res.data["choices"][0]["message"]["content"];
      } catch (e) {
        this.logger.error(
          `apikey:${openaiApi["configuration"].apiKey},error code is :${e.code}`
        );
      }
    }
  }

  async editMessage(message: string, args) {
    const openaiApi: OpenAIApi = this._getOpenaiApi(
      args?.apiKey,
      args?.organization
    );
    const response = await openaiApi.createEdit({
      model: args.model ?? "text-davinci-edit-001",
      instruction: message,
      input: args.input ?? "",
      temperature: parseInt(args.temperature) || 0,
    });
    return response.data;
  }
  async getImage(prompt: string, args) {
    const openaiApi: OpenAIApi = this._getOpenaiApi(
      args?.apiKey,
      args?.organization
    );
    let sizeStr;
    const sizeMode = args?.sizeMode ?? "m";
    const n = args?.n ?? 1;
    if (sizeMode == "s") {
      sizeStr = "256x256";
    } else if (sizeMode == "m") {
      sizeStr = "512x512";
    } else if (sizeMode == "l") {
      sizeStr = "1024x1024";
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
      args?.organization
    );
    const response = await openaiApi.listFiles();
    return response.data;
  }
  async delFile(file: string, args) {
    const openaiApi: OpenAIApi = this._getOpenaiApi(
      args?.apiKey,
      args?.organization
    );
    const response = await openaiApi.deleteFile(file);
    return response.data;
  }
  async listModels(args) {
    const openaiApi: OpenAIApi = this._getOpenaiApi(
      args?.apiKey,
      args?.organization
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
      args?.organization
    );
    const response = await openaiApi.deleteModel(model);
    return response.data;
  }
  async createFineTunes(args) {
    const openaiApi: OpenAIApi = this._getOpenaiApi(
      args?.apiKey,
      args?.organization
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
      args?.organization
    );
    const response = await openaiApi.listFineTunes();
    return response.data;
  }
}
