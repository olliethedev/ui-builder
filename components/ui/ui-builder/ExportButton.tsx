import React from "react";
import { exportAsReactProject } from "./internal/export-utils";
import { ComponentLayer, PropValue } from "./types";
export type Layer = ComponentLayer | PageLayer;

export type PageLayer = {
    id: string;
    name?: string;
    type: "_page_";
    path: string | undefined;
    props: Record<string, any>;
    children: Layer[];
};
const ExportButton = ({ pageData, projectName = "casino-ui-pa" }: {
    pageData: ComponentLayer<Record<string, PropValue>>[],
    projectName: string
}) => {
    const handleExport = () => {

        exportAsReactProject({
            projectName: "casino-ui",
            pages: pageData
        });
    };

    return (
        <button
            onClick={handleExport}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 text-sm rounded"
        >
            Export Project
        </button>
    );
};

export default ExportButton;
