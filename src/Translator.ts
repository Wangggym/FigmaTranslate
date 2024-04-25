export class Translator {
  private url = "https://api.openai.com/v1/chat/completions";
  private APIkey: undefined | string;

  public setAPIkey(APIkey: string) {
    this.APIkey = APIkey;
  }

  public async translate(text: string) {
    if (this.APIkey === undefined) {
      figma.notify("Please input Open AI key to translate the content");
      return null;
    }
    return fetch(this.url, {
      headers: {
        Authorization: `Bearer ${this.APIkey}`,
        Accept: "application/json, text/event-stream",
        "content-type": "application/json",
      },
      method: "post",
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a professional Chinese translator, please translate the content.",
          },
          {
            role: "user",
            content: text,
          },
        ],
      }),
    }).then((result) => {
      return result.json();
    });
  }
}
