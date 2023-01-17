import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
//import { ChatGPTAPI, ChatGPTAPIBrowser } from 'chatgpt';
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
    const executablePath = this.conf.get("puppeteer.executablePath") ?? "";
    const { ChatGPTAPI, ChatGPTAPIBrowser, getBrowser, getOpenAIAuth } =
      await import("chatgpt");
    const users = JSON.parse(this.conf.get("chatgpt.users") ?? "[]");
    if (!user?.email || !user?.password) {
      const index = Math.floor(Math.random() * users.length);
      user = users[index];
    }
    console.log(user);

    // this.chatgptApi = new ChatGPTAPI({
    //   sessionToken: this.conf.get('chatgpt.sessionToken') ?? '',
    //   clearanceToken: this.conf.get('chatgpt.clearanceToken') ?? '',
    // });
    if (!user) {
      return "please config env/dev.env";
    }
    if (!this.accountMap[user!.email]) {
      const chatgptApi = new ChatGPTAPIBrowser({
        email: user.email,
        password: user.password,
        executablePath: executablePath,
        isMicrosoftLogin: user.isMicrosoftLogin ? true : false,
        isGoogleLogin: user.isGoogleLogin ? true : false,
        debug: false,
        minimize: true,
      });
      await chatgptApi.initSession();
      this.accountMap[user.email] = {
        email: user.email,
        password: user.password,
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
  async sendMessage(response, message, accountEmail, conversationId) {
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
    const res = await account.chatgptApi.sendMessage(message, {
      conversationId: conversationId,
      parentMessageId: account.parentMessageId,
      onProgress: (partialResponse) => {
        console.log(partialResponse);
      },
    });
    account.conversationId = res.conversationId;
    account.parentMessageId = res.messageId;
    console.log(
      `emali:${account.email},conversationId:${account.conversationId},parentMessageId:${account.parentMessageId}`
    );
    return res;
  }
}
