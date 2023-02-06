import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Configuration, OpenAIApi } from "openai";

@Injectable()
export class OpenaiService {
  constructor(private readonly conf: ConfigService) {}

  private _getOpenaiApi(apiKey?: string, organization?: string): OpenAIApi {
    if (!apiKey) {
      const apiKeys = JSON.parse(this.conf.get("openai.apiKeys") ?? "[]");
      apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
    }
    console.log(`apiKey:${apiKey},organization:${organization}`);
    let configuration;
    if (!organization) {
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
  async sendMessage(message: string, response, isStream, args) {
    const openaiApi: OpenAIApi = this._getOpenaiApi(
      args?.apiKey,
      args?.organization
    );
    if (isStream) {
      const res = await openaiApi.createCompletion({
        model: args.model ?? this.conf.get("openai.model") ?? "",
        prompt: message,
        temperature: parseInt(args.temperature) || 0,
        max_tokens: parseInt(args.max_tokens) || 2048,
        stream: isStream,
      });
      console.log(res.data);
      return res.data;
    } else {
      const res = await openaiApi.createCompletion({
        model: args.model ?? this.conf.get("openai.model") ?? "",
        prompt: message,
        temperature: parseInt(args.temperature) || 0,
        max_tokens: parseInt(args.max_tokens) || 2048,
      });
      return res.data["choices"][0]["text"];
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
    } else if (sizeMode == "b") {
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
