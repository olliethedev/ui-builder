import UIBuilder from "@/components/ui/ui-builder";
import { PageLayer } from "@/lib/ui-builder/store/layer-store";

export const metadata = {
  title: "UI Builder",
};

const initialLayers: PageLayer[] = [{
  "id": "1",
  "type": "_page_",
  "name": "Page 1",
  "props": {
    "className": "p-4 flex flex-col gap-6 bg-background",
    "style": {
      "--background": "20 14.3% 4.1%",
      "--foreground": "0 0% 95%",
      "--popover": "0 0% 9%",
      "--popover-foreground": "0 0% 95%",
      "--card": "24 9.8% 10%",
      "--card-foreground": "0 0% 95%",
      "--primary": "142.1 70.6% 45.3%",
      "--primary-foreground": "144.9 80.4% 10%",
      "--secondary": "240 3.7% 15.9%",
      "--secondary-foreground": "0 0% 98%",
      "--muted": "0 0% 15%",
      "--muted-foreground": "240 5% 64.9%",
      "--accent": "12 6.5% 15.1%",
      "--accent-foreground": "0 0% 98%",
      "--destructive": "0 62.8% 30.6%",
      "--destructive-foreground": "0 85.7% 97.3%",
      "--border": "240 3.7% 15.9%",
      "--input": "240 3.7% 15.9%",
      "--ring": "142.4 71.8% 29.2%",
      "--chart-1": "220 70% 50%",
      "--chart-2": "160 60% 45%",
      "--chart-3": "30 80% 55%",
      "--chart-4": "280 65% 60%",
      "--chart-5": "340 75% 55%",
      "--radius": "0.5rem"
    },
    "mode": "dark",
    "colorTheme": "green",
    "borderRadius": 0.5
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
        "className": "mx-auto md:flex-row flex-col items-center max-w-6xl"
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
            "gap": "8",
            "className": "md:w-1/2"
          },
          "children": [
            {
              "id": "1MnLSMe",
              "type": "_text_",
              "name": "Text",
              "text": "No-Code UI Builder for React Developers",
              "textType": "text",
              "props": {
                "className": "text-4xl"
              }
            },
            {
              "id": "pHWrfaU",
              "type": "_text_",
              "name": "Text",
              "text": "Unlock the power of rapid UI development with UI Builder, a versatile React component that transforms the way you create and edit user interfaces. ",
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
                },
                {
                  "id": "4RnjhLv",
                  "type": "Badge",
                  "name": "Badge (Copy) (Copy)",
                  "props": {
                    "variant": "outline"
                  },
                  "children": [
                    {
                      "id": "OEc3rzX",
                      "type": "_text_",
                      "name": "Text (Copy) (Copy)",
                      "text": "TailwindCSS",
                      "textType": "text",
                      "props": {}
                    }
                  ]
                }
              ]
            },
            {
              "id": "JeyOsBy",
              "type": "Flexbox",
              "name": "Flexbox",
              "props": {
                "direction": "row",
                "justify": "center",
                "align": "center",
                "wrap": "nowrap",
                "gap": "2",
                "className": "w-full"
              },
              "children": [
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
                      "id": "UzZY6Dp",
                      "type": "_text_",
                      "name": "Text",
                      "text": "Github",
                      "textType": "text",
                      "props": {}
                    },
                    {
                      "id": "hn3PF6A",
                      "type": "Icon",
                      "name": "Icon",
                      "props": {
                        "size": "medium",
                        "color": "secondary",
                        "rotate": "none",
                        "iconName": "Github",
                        "className": ""
                      },
                      "children": []
                    }
                  ]
                },
                {
                  "id": "p0CFgTZ",
                  "type": "Button",
                  "name": "Button",
                  "props": {
                    "variant": "secondary",
                    "size": "default",
                    "className": "w-full items-center gap-2 max-w-sm"
                  },
                  "children": [
                    {
                      "id": "JtlnNhR",
                      "type": "_text_",
                      "name": "Text",
                      "text": "Twitter",
                      "textType": "text",
                      "props": {}
                    },
                    {
                      "id": "XH7tEQA",
                      "type": "Icon",
                      "name": "Icon",
                      "props": {
                        "iconName": "Twitter",
                        "size": "medium",
                        "color": "primary",
                        "rotate": "none"
                      },
                      "children": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "ODBvtGg",
          "type": "a",
          "name": "a",
          "props": {
            "target": "_blank",
            "href": "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExamVtbm1wdGhpazFoY2VkMDc0d2VkMWNjajJmNjkxMmxnYnpvZGd0YyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/11ISwbgCxEzMyY/giphy.gif",
            "className": "max-w-xl flex w-full md:w-1/2",
            "download": false
          },
          "children": [
            {
              "id": "5tqGKDA",
              "type": "img",
              "name": "img",
              "props": {
                "src": "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExamVtbm1wdGhpazFoY2VkMDc0d2VkMWNjajJmNjkxMmxnYnpvZGd0YyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/11ISwbgCxEzMyY/giphy.gif",
                "className": "w-full"
              },
              "children": []
            }
          ]
        }
      ]
    },
    {
      "id": "BZIs0VZ",
      "type": "Grid",
      "name": "Grid",
      "props": {
        "columns": "2",
        "autoRows": "none",
        "justify": "start",
        "align": "center",
        "templateRows": "1",
        "gap": "4",
        "className": "md:grid-cols-2 grid-cols-1 max-w-4xl mx-auto"
      },
      "children": [
        {
          "id": "mCRUaoS",
          "type": "Card",
          "name": "Card",
          "props": {},
          "children": [
            {
              "id": "paxCk3G",
              "type": "CardHeader",
              "name": "CardHeader",
              "props": {},
              "children": [
                {
                  "id": "WJxgg33",
                  "type": "CardTitle",
                  "name": "CardTitle",
                  "props": {},
                  "children": [
                    {
                      "id": "rzcq6ef",
                      "type": "_text_",
                      "name": "Text",
                      "text": "Visual No-Code Editing",
                      "textType": "text",
                      "props": {}
                    }
                  ]
                }
              ]
            },
            {
              "id": "oQ7cGl7",
              "type": "CardContent",
              "name": "CardContent",
              "props": {},
              "children": [
                {
                  "id": "AlVfPFt",
                  "type": "_text_",
                  "name": "Text",
                  "text": "Build stunning interfaces through an intuitive, customizable editor that's as powerful as it is easy to use.",
                  "textType": "text",
                  "props": {}
                }
              ]
            }
          ]
        },
        {
          "id": "U9tCCUH",
          "type": "Card",
          "name": "Card",
          "props": {},
          "children": [
            {
              "id": "TdQK5LR",
              "type": "CardHeader",
              "name": "CardHeader",
              "props": {},
              "children": [
                {
                  "id": "kB1kHsw",
                  "type": "CardTitle",
                  "name": "CardTitle",
                  "props": {},
                  "children": [
                    {
                      "id": "YKTsHPO",
                      "type": "_text_",
                      "name": "Text",
                      "text": "Seamless Integration",
                      "textType": "text",
                      "props": {}
                    }
                  ]
                }
              ]
            },
            {
              "id": "hSVQXQo",
              "type": "CardContent",
              "name": "CardContent",
              "props": {},
              "children": [
                {
                  "id": "w5Ybun2",
                  "type": "_text_",
                  "name": "Text",
                  "text": "Effortlessly integrate with your existing shadcn/ui or plain React projects for a smooth, uninterrupted workflow.",
                  "textType": "text",
                  "props": {}
                }
              ]
            }
          ]
        },
        {
          "id": "0vmzGVJ",
          "type": "Card",
          "name": "Card",
          "props": {},
          "children": [
            {
              "id": "byHc2iX",
              "type": "CardHeader",
              "name": "CardHeader",
              "props": {},
              "children": [
                {
                  "id": "XFnHOIX",
                  "type": "CardTitle",
                  "name": "CardTitle",
                  "props": {},
                  "children": [
                    {
                      "id": "hhXcyXG",
                      "type": "_text_",
                      "name": "Text",
                      "text": "Bring Your Own Components",
                      "textType": "text",
                      "props": {}
                    }
                  ]
                }
              ]
            },
            {
              "id": "Z1yGhPV",
              "type": "CardContent",
              "name": "CardContent",
              "props": {},
              "children": [
                {
                  "id": "cLxoysn",
                  "type": "_text_",
                  "name": "Text",
                  "text": "Start with a rich library of core components and expand it with your own custom elements to suit any project.",
                  "textType": "text",
                  "props": {}
                }
              ]
            }
          ]
        },
        {
          "id": "BfWUo7q",
          "type": "Card",
          "name": "Card",
          "props": {
            "className": "h-full"
          },
          "children": [
            {
              "id": "rMKLSjd",
              "type": "CardHeader",
              "name": "CardHeader",
              "props": {},
              "children": [
                {
                  "id": "seiQQC3",
                  "type": "CardTitle",
                  "name": "CardTitle",
                  "props": {},
                  "children": [
                    {
                      "id": "9hnCP0J",
                      "type": "_text_",
                      "name": "Text",
                      "text": "Versatile Use Cases",
                      "textType": "text",
                      "props": {}
                    }
                  ]
                }
              ]
            },
            {
              "id": "fOeAoRl",
              "type": "CardContent",
              "name": "CardContent",
              "props": {},
              "children": [
                {
                  "id": "ezuzF5t",
                  "type": "_text_",
                  "name": "Text",
                  "text": "From landing pages and forms to dashboards and complex applications—the possibilities are endless.",
                  "textType": "text",
                  "props": {}
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "OJZsKnP",
      "type": "Flexbox",
      "name": "Flexbox",
      "props": {
        "direction": "column",
        "justify": "start",
        "align": "start",
        "wrap": "nowrap",
        "gap": "4",
        "className": "mx-auto w-full max-w-4xl overflow-hidden"
      },
      "children": [
        {
          "id": "9IRAR5g",
          "type": "_text_",
          "name": "Text",
          "text": "Easy Setup",
          "textType": "text",
          "props": {
            "className": "text-4xl"
          }
        },
        {
          "id": "s81GWGE",
          "type": "_text_",
          "name": "Text",
          "text": "If you are using the latest shadcn/ui in your project, you can install the component directly from the registry. \n\n```bash\nnpx shadcn@latest add https://raw.githubusercontent.com/olliethedev/ui-builder/main/registry/block-registry.json\n```\n\nOr you can start a new project with the UI Builder:\n\n```bash\nnpx shadcn@latest init https://raw.githubusercontent.com/olliethedev/ui-builder/main/registry/block-registry.json\n```\n\nNote: You need to use [style variables](https://ui.shadcn.com/docs/theming) to have page theming working correctly.\n\nIf you are not using shadcn/ui, you can install the component simply by copying the files in this repo into your project.\n\n### Fixing Dependencies after shadcn `init` or `add`\nAdd dev dependencies, since there currently seems to be an issue with shadcn/ui not installing them from the registry:\n\n```bash\nnpm install -D @types/lodash.template @tailwindcss/typography @types/react-syntax-highlighter react-docgen-typescript tailwindcss-animate ts-morph ts-to-zod\n```\n\nFix zustand dependency to use latest stable version as opposed to default RC release that gets installed:\n\n```bash\nnpm install zustand@4.5.5\n```\n\nAnd that's it! You have a UI Builder that you can use to build your UI.\n\n## Usage\n\n```tsx\nimport UIBuilder from \"@/components/ui/ui-builder\";\n\nexport function MyApp() {\n  return <UIBuilder initialLayers={initialPages} onChange={handleChange} />;\n}\n```\n\n- `initialLayers`: Optional prop to set up initial pages and layers. Useful for setting the initial state of the builder, from a database for example.\n- `onChange`: Optional callback triggered when the editor state changes, providing the updated pages. Can be used to persist the state to a database.\n\n\nYou can also render the page without editor functionality by using the LayerRenderer component:\n\n```tsx\nimport LayerRenderer from \"@/components/ui/ui-builder/layer-renderer\";\n\nexport function MyPage() {\n  return <LayerRenderer page={page} />;\n}\n```\n\nThis is useful when you want to render the finished page in a non-editable fashion.",
          "textType": "markdown",
          "props": {
            "className": "overflow-hidden w-full"
          }
        }
      ]
    },
    {
      "id": "9khI7RN",
      "type": "Flexbox",
      "name": "Flexbox",
      "props": {
        "direction": "column",
        "justify": "start",
        "align": "start",
        "wrap": "nowrap",
        "gap": "4",
        "className": "max-w-4xl w-full mx-auto"
      },
      "children": [
        {
          "id": "tvjHJKv",
          "type": "_text_",
          "name": "Text",
          "text": "Dynamic Components",
          "textType": "text",
          "props": {
            "className": "text-4xl"
          }
        },
        {
          "id": "RmwFD7i",
          "type": "_text_",
          "name": "Text",
          "text": "As you edit this page you can see your changes in an advanced component below. You can even add your own components that show information based on the the logged in user's details.",
          "textType": "text",
          "props": {}
        },
        {
          "id": "rvEtSBH",
          "type": "CodePanel",
          "name": "PageSourceCode",
          "props": {
            "className": ""
          },
          "children": []
        }
      ]
    },
    {
      "id": "V1vySrN",
      "type": "Flexbox",
      "name": "Flexbox",
      "props": {
        "direction": "column",
        "justify": "start",
        "align": "start",
        "wrap": "nowrap",
        "gap": "4",
        "className": "max-w-4xl mx-auto w-full"
      },
      "children": [
        {
          "id": "N1BAGTW",
          "type": "_text_",
          "name": "Text",
          "text": "FAQ",
          "textType": "text",
          "props": {
            "className": "text-4xl"
          }
        },
        {
          "id": "4RlLwTl",
          "type": "_text_",
          "name": "Text",
          "text": "You can add shadcn/ui components easily like the Accordion component below",
          "textType": "text",
          "props": {}
        },
        {
          "id": "IojmDno",
          "type": "Accordion",
          "name": "Accordion",
          "props": {
            "type": "single",
            "className": "w-full"
          },
          "children": [
            {
              "id": "E3fXITA",
              "type": "AccordionItem",
              "name": "AccordionItem",
              "props": {
                "value": "item-1"
              },
              "children": [
                {
                  "id": "iQaMsab",
                  "type": "AccordionTrigger",
                  "name": "AccordionTrigger",
                  "props": {},
                  "children": [
                    {
                      "id": "M8CDLIO",
                      "type": "_text_",
                      "name": "Text",
                      "text": "How to Rick Roll?",
                      "textType": "text",
                      "props": {}
                    }
                  ]
                },
                {
                  "id": "SB4UI99",
                  "type": "AccordionContent",
                  "name": "AccordionContent",
                  "props": {},
                  "children": [
                    {
                      "id": "EsYrxof",
                      "type": "_text_",
                      "name": "Text",
                      "text": "Like this:",
                      "textType": "text",
                      "props": {}
                    },
                    {
                      "id": "c7Tpilf",
                      "type": "iframe",
                      "name": "iframe",
                      "props": {
                        "src": "https://www.youtube.com/embed/dQw4w9WgXcQ?si=oc74qTYUBuCsOJwL",
                        "referrerPolicy": "strict-origin-when-cross-origin",
                        "frameBorder": "0",
                        "width": "560",
                        "height": "315",
                        "allow": "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
                        "title": "Rick Roll",
                        "className": "mx-auto"
                      },
                      "children": []
                    }
                  ]
                }
              ]
            },
            {
              "id": "IjbKBQI",
              "type": "AccordionItem",
              "name": "AccordionItem",
              "props": {
                "value": "item-2"
              },
              "children": [
                {
                  "id": "MmL4GFD",
                  "type": "AccordionTrigger",
                  "name": "AccordionTrigger",
                  "props": {},
                  "children": [
                    {
                      "id": "I82mrZM",
                      "type": "_text_",
                      "name": "Text (Copy)",
                      "text": "Who is Satoshi Nakamoto?",
                      "textType": "text",
                      "props": {}
                    }
                  ]
                },
                {
                  "id": "m1UmV2R",
                  "type": "AccordionContent",
                  "name": "AccordionContent (Copy)",
                  "props": {},
                  "children": [
                    {
                      "id": "GozYa7b",
                      "type": "_text_",
                      "name": "Text (Copy)",
                      "text": "You are 😏",
                      "textType": "text",
                      "props": {}
                    }
                  ]
                }
              ]
            },
            {
              "id": "R8RKKJl",
              "type": "AccordionItem",
              "name": "AccordionItem",
              "props": {
                "value": "item-3"
              },
              "children": [
                {
                  "id": "hwUidEh",
                  "type": "AccordionTrigger",
                  "name": "AccordionTrigger",
                  "props": {},
                  "children": [
                    {
                      "id": "ZWlPqif",
                      "type": "_text_",
                      "name": "Text (Copy) (Copy)",
                      "text": "When is Christmas?",
                      "textType": "text",
                      "props": {}
                    }
                  ]
                },
                {
                  "id": "H6gxvyt",
                  "type": "AccordionContent",
                  "name": "AccordionContent",
                  "props": {},
                  "children": [
                    {
                      "id": "f15Zx6U",
                      "type": "_text_",
                      "name": "Text",
                      "text": "Oct 9th 🎄",
                      "textType": "text",
                      "props": {}
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "8GgRAKT",
      "type": "Flexbox",
      "name": "Flexbox",
      "props": {
        "direction": "row",
        "justify": "between",
        "align": "start",
        "wrap": "nowrap",
        "gap": "1",
        "className": "bg-secondary py-10 px-6"
      },
      "children": [
        {
          "id": "DARPh10",
          "type": "Flexbox",
          "name": "Flexbox",
          "props": {
            "direction": "row",
            "justify": "start",
            "align": "start",
            "wrap": "nowrap",
            "gap": "1"
          },
          "children": [
            {
              "id": "bVan1RY",
              "type": "Icon",
              "name": "Icon",
              "props": {
                "iconName": "Settings",
                "size": "medium",
                "rotate": "none"
              },
              "children": []
            },
            {
              "id": "jsKaL7D",
              "type": "_text_",
              "name": "Text",
              "text": "UI Builder",
              "textType": "text",
              "props": {
                "className": "text-secondary-foreground font-semibold"
              }
            }
          ]
        },
        {
          "id": "JBnbBj7",
          "type": "Flexbox",
          "name": "Flexbox",
          "props": {
            "direction": "column",
            "justify": "start",
            "align": "start",
            "wrap": "nowrap",
            "gap": "1"
          },
          "children": [
            {
              "id": "wstwOYg",
              "type": "a",
              "name": "a",
              "props": {
                "target": "_blank",
                "download": false,
                "href": "https://github.com/olliethedev/ui-builder"
              },
              "children": [
                {
                  "id": "c5DVqC7",
                  "type": "_text_",
                  "name": "Text",
                  "text": "Github",
                  "textType": "text",
                  "props": {
                    "className": "text-secondary-foreground"
                  }
                }
              ]
            },
            {
              "id": "0mlGT0T",
              "type": "a",
              "name": "a (Copy)",
              "props": {
                "target": "_blank",
                "download": false,
                "href": "https://twitter.com/olliethedev"
              },
              "children": [
                {
                  "id": "kb14O10",
                  "type": "_text_",
                  "name": "Text (Copy)",
                  "text": "Twitter",
                  "textType": "text",
                  "props": {
                    "className": "text-secondary-foreground"
                  }
                }
              ]
            },
            {
              "id": "XtHizwd",
              "type": "a",
              "name": "a (Copy)",
              "props": {
                "target": "_self",
                "download": false,
                "href": "#"
              },
              "children": [
                {
                  "id": "RyujBtx",
                  "type": "_text_",
                  "name": "Text (Copy)",
                  "text": "Blog",
                  "textType": "text",
                  "props": {
                    "className": "text-secondary-foreground"
                  }
                }
              ]
            },
            {
              "id": "YHbiQGs",
              "type": "a",
              "name": "a (Copy)",
              "props": {
                "target": "_self",
                "download": false,
                "href": "#"
              },
              "children": [
                {
                  "id": "JOuOO03",
                  "type": "_text_",
                  "name": "Text (Copy)",
                  "text": "Terms",
                  "textType": "text",
                  "props": {
                    "className": "text-secondary-foreground"
                  }
                }
              ]
            }
          ]
        },
        {
          "id": "LkqAWZY",
          "type": "div",
          "name": "div",
          "props": {
            "className": "md:block hidden"
          },
          "children": []
        }
      ]
    }
  ]
}]

export default function Page() {
  return (
    <main className="flex flex-col h-screen">
      <UIBuilder initialLayers={initialLayers} />
    </main>
  );
}
