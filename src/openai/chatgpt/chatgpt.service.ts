import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

type Account = {
  email: string;
  password: string;
  chatgptApi: any;
  conversationId: string | null;
  parentMessageId: string | null;
};

@Injectable()
export class ChatgptService {
  accountMap: Map<string, Account> = new Map();
  //private readonly stream = eventStream.
  constructor(private readonly conf: ConfigService) {}
  async init(user?) {
    const { ChatGPTAPI } = await import("chatgpt");
    const { ChatGPTUnofficialProxyAPI } = await import("chatgpt");
    const users = JSON.parse(this.conf.get("chatgpt.users") ?? "[]");
    if (!user?.email) {
      const index = Math.floor(Math.random() * users.length);
      user = users[index];
    }
    console.log(user);

    if (!user) {
      return "please config env/dev.env";
    }
    const apiKey = user!["apiKey"][0];
    const accessToken = user!["accessToken"];
    if (!this.accountMap[user!.email]) {
      let chatgptApi;
      if (accessToken) {
        console.log("ChatGPTUnofficialProxyAPI");
        chatgptApi = new ChatGPTUnofficialProxyAPI({
          accessToken: accessToken,
        });
      } else {
        chatgptApi = new ChatGPTAPI({ apiKey: apiKey });
      }
      this.accountMap[user.email] = {
        email: user.email,
        chatgptApi: chatgptApi,
      };
    }
    return {
      map: this.accountMap,
      message: `chatgpt service for ${user.email} had been inited!`,
    };
  }
  private _getRandomAccount(): Account {
    const keys = Object.keys(this.accountMap);
    const email = keys[Math.floor(Math.random() * keys.length)];
    return this.accountMap[email];
  }
  async sendMessage(response, message, accountEmail, conversationId, isStream) {
    let account: Account;
    if (!accountEmail) {
      account = this._getRandomAccount();
    } else {
      account = this.accountMap[accountEmail];
    }
    console.log(
      `message:${message},conversationId:${account.conversationId}/${conversationId},parentMessageId:${account.parentMessageId}`
    );
    if (conversationId == null) {
      conversationId = account.conversationId;
    }
    let res = {};
    if (isStream) {
      res = await account.chatgptApi.sendMessage(message, {
        conversationId: conversationId,
        parentMessageId: account.parentMessageId,
        onProgress: (partialResponse) => {
          response.write(partialResponse.text);
        },
      });
      account.conversationId = res["conversationId"];
      account.parentMessageId = res["messageId"];
      console.log(
        `emali:${account.email},conversationId:${account.conversationId},parentMessageId:${account.parentMessageId}`
      );
      return res["text"];
    } else {
      res = await account.chatgptApi.sendMessage(message, {
        conversationId: conversationId,
        parentMessageId: account.parentMessageId,
      });
      account.conversationId = res["conversationId"];
      account.parentMessageId = res["id"];
      console.log(
        `emali:${account.email},conversationId:${account.conversationId},parentMessageId:${account.parentMessageId}`
      );
      console.log(res);
      return res["text"];
    }
  }
}
