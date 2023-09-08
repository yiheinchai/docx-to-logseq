import { Note, TextNote, TextNoteForm } from "../types/types";

export const mockHtml_h1 = /*html*/ `<h1><a name="_Toc103523490">Physiology: Renal</a></h1>`;
export const mockHtml_h2 = /*html*/ `<h2><a name="_Toc103523491">[037] Overview of Kidney Function</a></h2>`;
export const mockHtml_h3 = /*html*/ `<h3><span lang="EN-US">Learning Outcomes</span></h3>`;
export const mockHtml_p1 = /*html*/ `
    <p class="MsoListParagraph" style="text-indent: -18pt">
        <span style="font-family: Symbol">·<span style="font: 7pt 'Times New Roman'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span>Macrostructure of Kidneys
    </p>`;

export const mockHtml_p2 = /*html */ `
    <p class="MsoListParagraph" style="margin-left: 72pt; text-indent: -18pt">
        <span style="font-family: 'Courier New'">o<span style="font: 7pt 'Times New Roman'">&nbsp;&nbsp; </span></span>Structure and Function
    </p>`;

export const mockHtml_p3 = /*html*/ `
    <p class="MsoListParagraph" style="margin-left: 108pt; text-indent: -18pt">
        <span style="font-family: Wingdings">§<span style="font: 7pt 'Times New Roman'">&nbsp; </span></span>Renal capsule – tough fibrinous membrane which protects and holds renal tissue together
    </p>`;

export const mockHtml_img = /*html*/ `<img width="139" height="114" class="yoloswag7" id="Picture 20598" src="MBBSY1%20Yi%20Hein%20Builds.fld/image1161.png" alt="Diagram">`;

export const symbol_Symbol = /*html*/ `<span style="font-family: Symbol">Symbol text</span>`;
export const symbol_Wingdings = /*html*/ `<span style="font-family: Wingdings">Symbol text</span>`;
export const symbol_CourierNew = /*html*/ `<span style="font-family: 'Courier New'">Symbol text</span>`;

export const mockTreeNotes: TextNote = {
    path: "",
    text: "Renal Physiology",
    children: [
        {
            path: "0;0",
            text: "Learning Outcomes",
            children: [],
        },
        {
            path: "0;1",
            text: "Renal Function",
            children: [
                {
                    path: "0;1;0",
                    text: "Homeostasis",
                    children: [],
                },
                {
                    path: "0;1;1",
                    text: "Hypertension",
                    children: [],
                },
            ],
        },
    ],
};

export const mockNote: TextNoteForm = {
    text: "Excretion",
    children: [],
};
