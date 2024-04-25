import { FigmaStorage, StorageKey } from "./FigmaStorage";
import { Translator } from "./Translator";
import { MessageData, MessageType } from "./typing";

(async function () {
  const figmaStorage = new FigmaStorage();
  const translator = new Translator();
  const translateCacheMap = new Map<string, string>();

  async function translate() {
    const selectedNodes = figma.currentPage.selection;
    const currentNode = selectedNodes[0] as
      | {
          text: TextSublayerNode;
        }
      | undefined;

    if (currentNode === undefined) {
      return;
    }
    
    let characters: string | undefined;
    if (
      (
        currentNode as {
          text: TextSublayerNode;
        }
      ).text
    ) {
      characters = currentNode.text.characters;
    }

    if ((currentNode as unknown as TextSublayerNode).characters) {
      characters = (currentNode as unknown as TextSublayerNode).characters;
    }

    if (characters) {
      if (translateCacheMap.has(characters)) {
        return figma.ui.postMessage(
          new MessageData(MessageType.translate, {
            value: translateCacheMap.get(characters)!,
            data: { characters },
          })
        );
      }

      figma.ui.postMessage(
        new MessageData(MessageType.translate, {
          value: "Loading...",
          data: { characters },
        })
      );

      try {
        const result = await translator.translate(characters);

        const value = result.choices[0].message.content;
        figma.ui.postMessage(
          new MessageData(MessageType.translate, {
            value: value,
            data: { characters },
          })
        );
        translateCacheMap.set(characters, value);
      } catch (error) {
        console.error(error);
        figma.notify("fetch api error");
      }
    }
  }

  if (figma.editorType === "figma") {
    // TODO add logic
    figma.showUI(__html__);
  }

  if (figma.editorType === "figjam") {
    const APIkey = await figmaStorage.get(StorageKey.APIkey);

    figma.showUI(__html__);

    if (APIkey) {
      // console.log(`Get the open-api key: ${APIkey}`);
      translator.setAPIkey(APIkey);
      figma.ui.postMessage(
        new MessageData(MessageType.APIkey, {
          value: APIkey,
        })
      );
      translate();
    }

    figma.on("selectionchange", async () => {
      await translate();
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
