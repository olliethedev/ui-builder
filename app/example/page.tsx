import ComponentEditor from "@/components/ui/ui-builder/component-editor";
import { PageLayer } from "@/lib/ui-builder/store/layer-store";

export const metadata = {
  title: "UI Builder",
};

const initialLayers: PageLayer[] = [{
  "id": "1",
  "type": "_page_",
  "name": "Page 1",
  "props": {
    "className": "p-4 flex flex-col gap-2"
  },
  "children": [
    {
      "id": "xjNasvW",
      "type": "Flexbox",
      "name": "Flexbox",
      "props": {
        "direction": "row",
        "justify": "center",
        "align": "center",
        "wrap": "nowrap",
        "gap": "4",
      },
      "children": [
        {
          "id": "v54yhcf",
          "type": "Flexbox",
          "name": "Flexbox",
          "props": {
            "direction": "column",
            "justify": "start",
            "align": "start",
            "wrap": "wrap",
            "gap": "4",
            "className": "h-full w-1/2"
          },
          "children": [
            {
              "id": "1MnLSMe",
              "type": "_text_",
              "name": "Text",
              "text": "No-Code UI Builder for React Developers",
              "textType": "text",
              "props": {
                "className": "text-2xl"
              }
            },
            {
              "id": "zi9gejj",
              "type": "_text_",
              "name": "Text",
              "text": "Transform your React app into a  no-code platform, leveraging your existing components.",
              "textType": "text",
              "props": {}
            },
            {
              "id": "DFdtflv",
              "type": "Flexbox",
              "name": "Flexbox",
              "props": {
                "direction": "row",
                "justify": "start",
                "align": "start",
                "wrap": "wrap",
                "gap": "1"
              },
              "children": [
                {
                  "id": "POvIiah",
                  "type": "Badge",
                  "name": "Badge",
                  "props": {
                    "variant": "outline"
                  },
                  "children": [
                    {
                      "id": "gVc72e9",
                      "type": "_text_",
                      "name": "Text",
                      "text": "ReactJS",
                      "textType": "text",
                      "props": {}
                    }
                  ]
                },
                {
                  "id": "mDhTO5R",
                  "type": "Badge",
                  "name": "Badge (Copy)",
                  "props": {
                    "variant": "outline"
                  },
                  "children": [
                    {
                      "id": "J5t39kD",
                      "type": "_text_",
                      "name": "Text (Copy)",
                      "text": "ShadCN",
                      "textType": "text",
                      "props": {}
                    }
                  ]
                },
                {
                  "id": "EaQcZGy",
                  "type": "Badge",
                  "name": "Badge (Copy)",
                  "props": {
                    "variant": "outline"
                  },
                  "children": [
                    {
                      "id": "zX3TdJH",
                      "type": "_text_",
                      "name": "Text (Copy)",
                      "text": "No-Code",
                      "textType": "text",
                      "props": {}
                    }
                  ]
                }
              ]
            },
            {
              "id": "qCTIIed",
              "type": "Button",
              "name": "Button",
              "props": {
                "variant": "default",
                "size": "default",
                "className": "w-full items-center gap-2 max-w-sm"
              },
              "children": [
                {
                  "id": "u6apTjw",
                  "type": "_text_",
                  "name": "Text",
                  "text": " [![GitHub Logo](https://cdn4.iconfinder.com/data/icons/iconsimple-logotypes/512/github-512.png \"GitHub Logo\")](https://github.com/)",
                  "textType": "markdown",
                  "props": {
                    "className": "w-6"
                  }
                },
                {
                  "id": "UzZY6Dp",
                  "type": "_text_",
                  "name": "Text",
                  "text": "Repo",
                  "textType": "text",
                  "props": {}
                }
              ]
            }
          ]
        },
        {
          "id": "yZWTaDR",
          "type": "_text_",
          "name": "Text",
          "text": "![Cool Computer Kid](https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExamVtbm1wdGhpazFoY2VkMDc0d2VkMWNjajJmNjkxMmxnYnpvZGd0YyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/11ISwbgCxEzMyY/giphy.gif)\n",
          "textType": "markdown",
          "props": {}
        }
      ]
    },
    {
      "id": "dh4SymS",
      "type": "Flexbox",
      "name": "Flexbox",
      "props": {
        "direction": "row",
        "justify": "start",
        "align": "start",
        "wrap": "wrap",
        "gap": 8
      },
      "children": []
    },
    {
      "id": "rvEtSBH",
      "type": "CodePanel",
      "name": "CodePanel",
      "props": {
        "className": ""
      },
      "children": []
    }
  ]
}]

export default function Page() {
  return (
    <main data-testid="main-page" className="flex flex-col h-screen">
      <ComponentEditor initialLayers={initialLayers} />
    </main>
  );
}
