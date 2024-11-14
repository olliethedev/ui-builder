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
    "className": "flex flex-col gap-6 bg-background px-4",
    "style": {
      "--background": "0 0% 100%",
      "--foreground": "240 10% 3.9%",
      "--card": "0 0% 100%",
      "--card-foreground": "240 10% 3.9%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "240 10% 3.9%",
      "--primary": "142.1 76.2% 36.3%",
      "--primary-foreground": "355.7 100% 97.3%",
      "--secondary": "240 4.8% 95.9%",
      "--secondary-foreground": "240 5.9% 10%",
      "--muted": "240 4.8% 95.9%",
      "--muted-foreground": "240 3.8% 46.1%",
      "--accent": "240 4.8% 95.9%",
      "--accent-foreground": "240 5.9% 10%",
      "--destructive": "0 84.2% 60.2%",
      "--destructive-foreground": "0 0% 98%",
      "--border": "240 5.9% 90%",
      "--input": "240 5.9% 90%",
      "--ring": "142.1 76.2% 36.3%",
      "--chart-1": "12 76% 61%",
      "--chart-2": "173 58% 39%",
      "--chart-3": "197 37% 24%",
      "--chart-4": "43 74% 66%",
      "--chart-5": "27 87% 67%",
      "--radius": "1rem"
    },
    "mode": "light",
    "colorTheme": "green",
    "borderRadius": 1
  },
  "children": [
    {
      "id": "s33J1LG",
      "type": "Flexbox",
      "name": "Flexbox",
      "props": {
        "direction": "row",
        "justify": "between",
        "align": "center",
        "wrap": "nowrap",
        "gap": "1",
        "className": "p-2 bg-secondary mx-[-4]"
      },
      "children": [
        {
          "id": "t0GYQCv",
          "type": "Flexbox",
          "name": "Flexbox",
          "props": {
            "direction": "row",
            "justify": "start",
            "align": "center",
            "wrap": "nowrap",
            "gap": "1"
          },
          "children": [
            {
              "id": "jECYqpe",
              "type": "Icon",
              "name": "Icon",
              "props": {
                "iconName": "Apple",
                "size": "medium",
                "rotate": "none"
              },
              "children": []
            },
            {
              "type": "span",
              "children": "My App",
              "id": "GQhTbms",
              "name": "Text",
              "props": {
                "className": "text-lg font-bold"
              }
            }
          ]
        },
        {
          "id": "Bxk8iHx",
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
              "id": "C1MWIzn",
              "type": "Button",
              "name": "Button",
              "props": {
                "variant": "ghost",
                "size": "sm"
              },
              "children": [
                {
                  "type": "span",
                  "children": "Blog",
                  "id": "r6P4MVM",
                  "name": "Text",
                  "props": {}
                }
              ]
            },
            {
              "id": "iqEFiRf",
              "type": "Button",
              "name": "Button (Copy)",
              "props": {
                "variant": "ghost",
                "size": "sm"
              },
              "children": [
                {
                  "type": "span",
                  "children": "Docs",
                  "id": "nL2DZYh",
                  "name": "Text (Copy)",
                  "props": {}
                }
              ]
            },
            {
              "id": "DN4Qe7w",
              "type": "Button",
              "name": "Button (Copy)",
              "props": {
                "variant": "ghost",
                "size": "sm"
              },
              "children": [
                {
                  "type": "span",
                  "children": "Pricing",
                  "id": "LVCWnzE",
                  "name": "Text (Copy)",
                  "props": {}
                }
              ]
            },
            {
              "id": "1t8p1rH",
              "type": "Button",
              "name": "Button",
              "props": {
                "variant": "default",
                "size": "sm"
              },
              "children": [
                {
                  "type": "span",
                  "children": "Login",
                  "id": "7SyQ9es",
                  "name": "Text",
                  "props": {}
                }
              ]
            }
          ]
        }
      ]
    },
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
              "type": "span",
              "children": "No-Code UI Builder for React Developers",
              "id": "1MnLSMe",
              "name": "Text",
              "props": {
                "className": "text-4xl"
              }
            },
            {
              "type": "span",
              "children": "Unlock the power of rapid UI development with UI Builder, a versatile React component that transforms the way you create and edit user interfaces. ",
              "id": "pHWrfaU",
              "name": "Text",
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
                      "type": "span",
                      "children": "ReactJS",
                      "id": "gVc72e9",
                      "name": "Text",
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
                      "type": "span",
                      "children": "ShadCN",
                      "id": "J5t39kD",
                      "name": "Text (Copy)",
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
                      "type": "span",
                      "children": "No-Code",
                      "id": "zX3TdJH",
                      "name": "Text (Copy)",
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
                      "type": "span",
                      "children": "TailwindCSS",
                      "id": "OEc3rzX",
                      "name": "Text (Copy) (Copy)",
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
                    "className": "w-full"
                  },
                  "children": [
                    {
                      "type": "span",
                      "children": "Github",
                      "id": "UzZY6Dp",
                      "name": "Text",
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
                  "id": "cbDAzBm",
                  "type": "Button",
                  "name": "Button",
                  "props": {
                    "variant": "secondary",
                    "size": "default",
                    "className": "w-full gap-2"
                  },
                  "children": [
                    {
                      "type": "span",
                      "children": "Button",
                      "id": "LN1AilM",
                      "name": "Text",
                      "props": {}
                    },
                    {
                      "id": "nDjBEgP",
                      "type": "Icon",
                      "name": "Icon",
                      "props": {
                        "iconName": "Image",
                        "size": "medium",
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
                      "type": "span",
                      "children": "Visual No-Code Editing",
                      "id": "rzcq6ef",
                      "name": "Text",
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
                  "type": "span",
                  "children": "Build stunning interfaces through an intuitive, customizable editor that's as powerful as it is easy to use.",
                  "id": "AlVfPFt",
                  "name": "Text",
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
                      "type": "span",
                      "children": "Seamless Integration",
                      "id": "YKTsHPO",
                      "name": "Text",
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
                  "type": "span",
                  "children": "Effortlessly integrate with your existing shadcn/ui or plain React projects for a smooth, uninterrupted workflow.",
                  "id": "w5Ybun2",
                  "name": "Text",
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
                      "type": "span",
                      "children": "Bring Your Own Components",
                      "id": "hhXcyXG",
                      "name": "Text",
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
                  "type": "span",
                  "children": "Start with a rich library of core components and expand it with your own custom elements to suit any project.",
                  "id": "cLxoysn",
                  "name": "Text",
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
                      "type": "span",
                      "children": "Versatile Use Cases",
                      "id": "9hnCP0J",
                      "name": "Text",
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
                  "type": "span",
                  "children": "From landing pages and forms to dashboards and complex applications—the possibilities are endless.",
                  "id": "ezuzF5t",
                  "name": "Text",
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
          "type": "span",
          "children": "Easy Setup",
          "id": "9IRAR5g",
          "name": "Text",
          "props": {
            "className": "text-4xl"
          }
        },
        {
          "type": "Markdown",
          "children": "\nIf you are using the latest shadcn/ui in your project, you can install the component directly from the registry. \n\n```bash\nnpx shadcn@latest add https://raw.githubusercontent.com/olliethedev/ui-builder/main/registry/block-registry.json\n```\n\nOr you can start a new project with the UI Builder:\n\n```bash\nnpx shadcn@latest init https://raw.githubusercontent.com/olliethedev/ui-builder/main/registry/block-registry.json\n```\n\nNote: You need to use [style variables](https://ui.shadcn.com/docs/theming) to have page theming working correctly.\n\nIf you are not using shadcn/ui, you can install the component simply by copying the files in this repo into your project.\n\n### Fixing Dependencies after shadcn `init` or `add`\nAdd dev dependencies, since there currently seems to be an issue with shadcn/ui not installing them from the registry:\n\n```bash\nnpm install -D @types/lodash.template @tailwindcss/typography @types/react-syntax-highlighter react-docgen-typescript tailwindcss-animate ts-morph ts-to-zod\n```\n\nFix zustand dependency to use latest stable version as opposed to default RC release that gets installed:\n\n```bash\nnpm install zustand@4.5.5\n```\n\nAnd that's it! You have a UI Builder that you can use to build your UI.\n\n## Usage\n\n```tsx\nimport UIBuilder from \"@/components/ui/ui-builder\";\n\nexport function MyApp() {\n  return <UIBuilder initialLayers={initialPages} onChange={handleChange} />;\n}\n```\n\n- `initialLayers`: Optional prop to set up initial pages and layers. Useful for setting the initial state of the builder, from a database for example.\n- `onChange`: Optional callback triggered when the editor state changes, providing the updated pages. Can be used to persist the state to a database.\n\n\nYou can also render the page without editor functionality by using the LayerRenderer component:\n\n```tsx\nimport LayerRenderer from \"@/components/ui/ui-builder/layer-renderer\";\n\nexport function MyPage() {\n  return <LayerRenderer page={page} />;\n}\n```\n\nThis is useful when you want to render the finished page in a non-editable fashion.",
          "id": "s81GWGE",
          "name": "Text",
          "props": {
            "className": "overflow-hidden w-full"
          }
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
          "type": "span",
          "children": "FAQ",
          "id": "N1BAGTW",
          "name": "Text",
          "props": {
            "className": "text-4xl"
          }
        },
        {
          "type": "span",
          "children": "You can add shadcn/ui components easily like the Accordion component below",
          "id": "4RlLwTl",
          "name": "Text",
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
                      "type": "span",
                      "children": "How to Rick Roll?",
                      "id": "M8CDLIO",
                      "name": "Text",
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
                      "type": "span",
                      "children": "Like this:",
                      "id": "EsYrxof",
                      "name": "Text",
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
                      "type": "span",
                      "children": "Who is Satoshi Nakamoto?",
                      "id": "I82mrZM",
                      "name": "Text (Copy)",
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
                      "type": "span",
                      "children": "You are 😏",
                      "id": "GozYa7b",
                      "name": "Text (Copy)",
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
                      "type": "span",
                      "children": "When is Christmas?",
                      "id": "ZWlPqif",
                      "name": "Text (Copy) (Copy)",
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
                      "type": "span",
                      "children": "Oct 9th 🎄",
                      "id": "f15Zx6U",
                      "name": "Text",
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
              "type": "span",
              "children": "UI Builder",
              "id": "jsKaL7D",
              "name": "Text",
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
                  "type": "span",
                  "children": "Github",
                  "id": "c5DVqC7",
                  "name": "Text",
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
                  "type": "span",
                  "children": "Twitter",
                  "id": "kb14O10",
                  "name": "Text (Copy)",
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
                  "type": "span",
                  "children": "Blog",
                  "id": "RyujBtx",
                  "name": "Text (Copy)",
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
                  "type": "span",
                  "children": "Terms",
                  "id": "JOuOO03",
                  "name": "Text (Copy)",
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
    <main className="flex flex-col h-dvh">
      <UIBuilder initialLayers={initialLayers} />
    </main>
  );
}
