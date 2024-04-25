/**
 * - 发布插件，解决编译报错，watch
 * - 在input中回显 apikey
 * - 存储翻译结果
 * - UI 优化
 * - 接口请求错误提示
 */
import { FigmaStorage, StorageKey } from "./FigmaStorage";
import { Translator } from "./Translator";
import { MessageData, MessageType } from "./typing";

(async function () {
  const figmaStorage = new FigmaStorage();
  const translator = new Translator();

  if (figma.editorType === "figma") {
    // TODO add logic
    figma.showUI(__html__);
  }

  if (figma.editorType === "figjam") {
    const APIkey = await figmaStorage.get(StorageKey.APIkey);
   
    figma.showUI(__html__);

    if (APIkey) {
      console.log(`Get the open-api key: ${APIkey}`);
      translator.setAPIkey(APIkey);

    }


    figma.on("selectionchange", async () => {
      const selectedNodes = figma.currentPage.selection;

      console.log(selectedNodes, "selectedNodes");

      const currentNode = selectedNodes[0] as {
        text: TextSublayerNode;
      };

      if (currentNode.text) {
        const characters = currentNode.text.characters;

        figma.ui.postMessage(
          new MessageData(MessageType.translate, {
            value: "Loading...",
            data: { characters },
          })
        );

        const result = await translator.translate(characters);

        figma.ui.postMessage(
          new MessageData(MessageType.translate, {
            value: result.choices[0].message.content,
            data: { characters },
          })
        );
      }
    });

    figma.ui.onmessage = async (msg: MessageData) => {
      if (msg.type === MessageType.APIkey) {
        const APIkey = msg.payload.value;
        await figmaStorage.set(StorageKey.APIkey, APIkey);
        translator.setAPIkey(APIkey);
      }
    };
  }
})();
