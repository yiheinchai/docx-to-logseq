"use strict";

import {
    checkIfSymbol,
    cleanText,
    getTextFromElement,
    insertChildInLatestAndDeepestDepths,
    insertSibilingInLatestAndDeepestDepths,
    insertChildInLatestAndAtSpecifiedDepth,
    insertSibilingAtSpecifiedDepth,
    insertChildren,
    getElementDepth,
    getImageFromElement,
    getTableFromElement,
    elementDataToNote,
    htmlToJS,
    formatSrcLink,
    getElementHtml,
} from "../src/HTMLParser";
import {
    mockHtml,
    mockHtml2,
    mockHtml_h1,
    mockHtml_h2,
    mockHtml_h3,
    mockHtml_img,
    mockHtml_p1,
    mockHtml_p2,
    mockHtml_p2_2,
    mockHtml_p3,
    mockHtml_table_image,
    mockHtml_table_real,
    mockHtml_table_text,
    mockNote,
    mockTreeNotes,
    symbol_CourierNew,
    symbol_Symbol,
    symbol_Wingdings,
} from "./mocks";

function wrapElementWithDiv(str: string) {
    return `<div>${str}</div>`;
}

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

describe("getTextFromElement", () => {
    // Clear the DOM after each test
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    describe("is able to get string from a content hidden in nested HTML elements in a,", () => {
        test("h1 element", () => {
            document.body.innerHTML = mockHtml_h1;
            const h1_element = document.querySelector("h1");

            if (h1_element == null)
                throw new Error("h1 element mock is configured wrongly!");

            const text = getTextFromElement(h1_element);
            expect(text).toBe("Physiology: Renal");
        });

        test("h2 element", () => {
            document.body.innerHTML = mockHtml_h2;
            const h2_element = document.querySelector("h2");

            if (h2_element == null)
                throw new Error("h2 element mock is configured wrongly!");

            const text = getTextFromElement(h2_element);
            expect(text).toBe("[037] Overview of Kidney Function");
        });

        test("h3 element", () => {
            document.body.innerHTML = mockHtml_h3;
            const h3_element = document.querySelector("h3");

            if (h3_element == null)
                throw new Error("h3 element mock is configured wrongly!");

            const text = getTextFromElement(h3_element);
            expect(text).toBe("Learning Outcomes");
        });
        test("p1 element", () => {
            document.body.innerHTML = mockHtml_p1;
            const p1_element = document.querySelector("p");

            if (p1_element == null)
                throw new Error("p1 element mock is configured wrongly!");

            const text = getTextFromElement(p1_element);
            expect(text).toBe("Macrostructure of Kidneys");
        });
        test("p2 element", () => {
            document.body.innerHTML = mockHtml_p2;
            const p2_element = document.querySelector("p");

            if (p2_element == null)
                throw new Error("p2 element mock is configured wrongly!");

            const text = getTextFromElement(p2_element);
            expect(text).toBe("Structure and Function");
        });
        test("p2 bullet element", () => {
            document.body.innerHTML = mockHtml_p2_2;
            const p2_element = document.querySelector("p");

            if (p2_element == null)
                throw new Error("p2 element mock is configured wrongly!");

            const text = getTextFromElement(p2_element);
            expect(text).toBe(
                "The central dogma of molecular biology describes the flow of genetic information from DNA to RNA to Proteins"
            );
        });
        test("p3 element", () => {
            document.body.innerHTML = mockHtml_p3;
            const p3_element = document.querySelector("p");

            if (p3_element == null)
                throw new Error("p3 element mock is configured wrongly!");

            const text = getTextFromElement(p3_element);
            expect(text).toBe(
                "Renal capsule – tough fibrinous membrane which protects and holds renal tissue together"
            );
        });
    });

    describe("is able to ignore symbols", () => {
        // Clear the DOM after each test
        beforeEach(() => {
            document.body.innerHTML = "";
        });

        it("ignores Symbol font family", () => {
            document.body.innerHTML = wrapElementWithDiv(symbol_Symbol);
            const span_element = document.querySelector("div");

            if (span_element == null)
                throw new Error("span element mock is configured wrongly!");
            const text = getTextFromElement(span_element);
            expect(text).toBeFalsy();
        });
        it("ignores Wingdings font family", () => {
            document.body.innerHTML = wrapElementWithDiv(symbol_Wingdings);
            const span_element = document.querySelector("div");

            if (span_element == null)
                throw new Error("span element mock is configured wrongly!");
            const text = getTextFromElement(span_element);
            expect(text).toBeFalsy();
        });

        it("ignores Courier New font family", () => {
            document.body.innerHTML = wrapElementWithDiv(symbol_CourierNew);
            const span_element = document.querySelector("div");

            if (span_element == null)
                throw new Error("span element mock is configured wrongly!");
            const text = getTextFromElement(span_element);
            expect(text).toBeFalsy();
        });
    });
});

describe("cleanText", () => {
    // Clear the DOM after each test
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("removes non-breaking spaces", () => {
        const cleanedTexted = cleanText("   this   contains   nbsp   ");
        expect(cleanedTexted).toBe("thiscontainsnbsp");
    });

    it("removes new lines", () => {
        const noNewLines = cleanText(`\nthere is new lines\n\n`);
        expect(noNewLines).toBe("there is new lines");
    });
});

describe("checkIfSymbol", () => {
    // Clear the DOM after each test
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("identifies Symbol", () => {
        document.body.innerHTML = symbol_Symbol;
        const span_element = document.querySelector("span");
        if (span_element == null)
            throw new Error("span element mock is configured wrongly!");

        expect(checkIfSymbol(span_element)).toBe(true);
    });

    it("identifies Wingdings", () => {
        document.body.innerHTML = symbol_Wingdings;
        const span_element = document.querySelector("span");
        if (span_element == null)
            throw new Error("span element mock is configured wrongly!");

        expect(checkIfSymbol(span_element)).toBe(true);
    });
});

describe("insertSibilingInLatestAndDeepestDepths", () => {
    it("correctly inserts data in the last node as the last children", () => {
        const mockNotes = deepCopy(mockTreeNotes);
        const mockNoteToBeInserted = deepCopy(mockNote);
        mockNoteToBeInserted["path"] = "1;2";

        insertSibilingInLatestAndDeepestDepths(mockNotes, mockNoteToBeInserted);

        expect(mockNotes.children[1].children[2]).toStrictEqual(
            mockNoteToBeInserted
        );
    });
});

describe("insertChildInLatestAndDeepestDepths", () => {
    it("correctly inserts data as its only children", () => {
        const mockNotes = deepCopy(mockTreeNotes);
        const mockNoteToBeInserted = deepCopy(mockNote);
        mockNoteToBeInserted["path"] = "1;1;0";

        insertChildInLatestAndDeepestDepths(mockNotes, mockNoteToBeInserted);

        expect(mockNotes.children[1].children[1].children[0]).toStrictEqual(
            mockNoteToBeInserted
        );
    });
});

describe("insertChildInLatestAndAtSpecifiedDepth", () => {
    it("correctly inserts data at the right depth", () => {
        const mockNotes = deepCopy(mockTreeNotes);
        const mockNoteToBeInserted = deepCopy(mockNote);
        mockNoteToBeInserted["path"] = "1;2";

        insertChildInLatestAndAtSpecifiedDepth(
            mockNotes,
            mockNoteToBeInserted,
            1
        );

        expect(mockNotes.children[1].children[2]).toStrictEqual(
            mockNoteToBeInserted
        );
    });
});

describe("insertSibilingAtSpecifiedDepth", () => {
    it("correctly inserts data at the right depth", () => {
        const mockNotes = deepCopy(mockTreeNotes);
        const mockNoteToBeInserted = deepCopy(mockNote);
        mockNoteToBeInserted["path"] = "2";

        insertSibilingAtSpecifiedDepth(mockNotes, mockNoteToBeInserted, 1);

        expect(mockNotes.children[2]).toStrictEqual(mockNoteToBeInserted);
    });
});

describe("insertChildren", () => {
    it("adds a child to the current node", () => {
        const mockNotes = deepCopy(mockTreeNotes);
        const mockNoteToBeInserted = deepCopy(mockNote);
        mockNoteToBeInserted["path"] = "2";

        insertChildren(mockNotes, mockNoteToBeInserted);

        expect(mockNotes.children[2]).toStrictEqual(mockNoteToBeInserted);
    });
});

describe("getElementDepth", () => {
    // Clear the DOM after each test
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("is able to get depth of header tags", () => {
        document.body.innerHTML = mockHtml_h1;
        const h1_element = document.querySelector("h1");

        if (h1_element == null)
            throw new Error("h1 element mock is configured wrongly!");

        const level = getElementDepth(h1_element);

        expect(level).toBe(2);
    });

    it("is able to get depth of p tags", () => {
        document.body.innerHTML = mockHtml_p3;
        const p3_element = document.querySelector("p");

        if (p3_element == null)
            throw new Error("p3 element mock is configured wrongly!");

        const level = getElementDepth(p3_element);

        expect(level).toBe(7);
    });
});

describe("formatSrcLink", () => {
    it("is able to format src link", () => {
        const src =
            "http://localhost/MBBSY1%20Yi%20Hein%20Builds.fld/image1161.png";
        const formattedSrc = formatSrcLink(src);
        expect(formattedSrc).toBe(
            "MBBSY1%20Yi%20Hein%20Builds.fld/image1161.png"
        );
    });
});

describe("getElementHTML", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("is able to retrieve HTML without newlines", () => {
        // TODO: Unable to replicate the situation where outerHTML gives newlines
        document.body.innerHTML = mockHtml_table_real;
        const table = document.querySelector("table");

        if (table == null)
            throw new Error("table element mock is configured wrongly!");

        const html = getElementHtml(table);

        expect(html).toBe(mockHtml_table_real);
    });
});

describe("getImageFromElement", () => {
    // Clear the DOM after each test
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("gets src, height, width from image", () => {
        document.body.innerHTML = mockHtml_img;
        const img_element = document.querySelector("img");

        if (img_element == null)
            throw new Error("img element mock is configured wrongly!");

        const img_detail = getImageFromElement(img_element);

        expect(img_detail).toStrictEqual({
            src: "MBBSY1%20Yi%20Hein%20Builds.fld/image1161.png",
            width: 139,
            height: 114,
        });
    });
});

describe("getTableFromElement", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });
    it("able get text data from table", () => {
        document.body.innerHTML = mockHtml_table_text;
        const table_element = document.querySelector("table");

        if (table_element == null)
            throw new Error("table element mock is configured wrongly!");

        const table_detail = getTableFromElement(table_element);

        // prettier-ignore
        const expectedTableDetail = [
            [['Structure'], ['Function']],
            [['Polymorphonucleus – nucleus with many lobes'],['(not discovered)']],
            [['Cytoplasm filled with granules'],['Granules with cytotoxic material to kill bacteria', 'Granule empty contents into phagosome upon phagocytosis of bacteria']]
        ]

        expect(table_detail).toStrictEqual(expectedTableDetail);
    });

    it("able get image data from table", () => {
        document.body.innerHTML = mockHtml_table_image;
        const table_element = document.querySelector("table");

        if (table_element == null)
            throw new Error("table element mock is configured wrongly!");

        const table_detail = getTableFromElement(table_element);

        // prettier-ignore
        const expectedTableDetail = [
            [['Foramen transversarium /', 'Transverse foramen', [{src: "MBBSY1%20Yi%20Hein%20Builds.fld/image199.png", width: 147, height: 111}]], ['Stacked together to form a canal where arteries and veins pass through [thorax to brain]','']],
        ]

        expect(table_detail).toStrictEqual(expectedTableDetail);
    });
});

describe("elementDataToNote", () => {
    it("is able to convert data to TextNote", () => {
        const textNote = elementDataToNote(
            "this is a text note",
            "<p>test</p>"
        );
        expect(textNote).toStrictEqual({
            text: "this is a text note",
            html: "<p>test</p>",
            children: [],
        });
    });

    it("is able to convert data to ImageNote", () => {
        const imageNote = elementDataToNote(
            [
                {
                    src: "test.png",
                    width: 420,
                    height: 69,
                },
                {
                    src: "test2.png",
                    width: 69,
                    height: 69,
                },
            ],
            "<p>test</p>"
        );

        expect(imageNote).toStrictEqual({
            html: "<p>test</p>",
            children: [],
            images: [
                {
                    src: "test.png",
                    width: 420,
                    height: 69,
                },
                {
                    src: "test2.png",
                    width: 69,
                    height: 69,
                },
            ],
        });
    });

    it("is able to convert data to TableNote", () => {
        const tableNote = elementDataToNote(
            [
                [["structure"], ["function"]],
                [["myelination"], ["fast conduction"]],
            ],
            "<p>test</p>"
        );
        expect(tableNote).toStrictEqual({
            html: "<p>test</p>",
            children: [],
            table: [
                [["structure"], ["function"]],
                [["myelination"], ["fast conduction"]],
            ],
        });
    });
});

describe("htmlToJS", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });
    it("is able to convert htmlToJS with text, images, table", () => {
        document.body.innerHTML = mockHtml;
        const html_dom = document.querySelector(".test_html");

        if (html_dom == null)
            throw new Error("html dom mock is configured wrongly!");

        const js_tree = htmlToJS(
            Array.from(html_dom.children) as HTMLElement[]
        );

        expect(js_tree).toStrictEqual({
            path: "",
            children: [
                {
                    text: "Physiology: Renal",
                    path: "0",
                    html: mockHtml_h1,
                    children: [
                        {
                            text: "[037] Overview of Kidney Function",
                            path: "0;0",
                            html: mockHtml_h2,
                            children: [
                                {
                                    text: "Learning Outcomes",
                                    path: "0;0;0",
                                    html: mockHtml_h3,
                                    children: [
                                        {
                                            text: "Macrostructure of Kidneys",
                                            path: "0;0;0;0",
                                            html: mockHtml_p1,
                                            children: [
                                                {
                                                    text: "Structure and Function",
                                                    path: "0;0;0;0;0",
                                                    html: mockHtml_p2,
                                                    children: [
                                                        {
                                                            text: "Renal capsule – tough fibrinous membrane which protects and holds renal tissue together",
                                                            path: "0;0;0;0;0;0",
                                                            html: mockHtml_p3,
                                                            children: [
                                                                {
                                                                    images: [
                                                                        {
                                                                            src: "MBBSY1%20Yi%20Hein%20Builds.fld/image1161.png",
                                                                            width: 139,
                                                                            height: 114,
                                                                        },
                                                                    ],
                                                                    path: "0;0;0;0;0;0;0",
                                                                    html: mockHtml_img,
                                                                    children: [
                                                                        {
                                                                            table: [
                                                                                [
                                                                                    [
                                                                                        "Foramen transversarium /",
                                                                                        "Transverse foramen",
                                                                                        [
                                                                                            {
                                                                                                src: "MBBSY1%20Yi%20Hein%20Builds.fld/image199.png",
                                                                                                width: 147,
                                                                                                height: 111,
                                                                                            },
                                                                                        ],
                                                                                    ],
                                                                                    [
                                                                                        "Stacked together to form a canal where arteries and veins pass through [thorax to brain]",
                                                                                        "",
                                                                                    ],
                                                                                ],
                                                                            ],
                                                                            path: "0;0;0;0;0;0;0;0",
                                                                            html: mockHtml_table_image,
                                                                            children:
                                                                                [],
                                                                        },
                                                                    ],
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });
    it("is able to convert a real worldhtmlToJS", () => {
        document.body.innerHTML = mockHtml2;
        const html_dom = document.querySelector(".test_html");

        if (html_dom == null)
            throw new Error("html dom mock is configured wrongly!");

        const js_tree = htmlToJS(
            Array.from(html_dom.children) as HTMLElement[]
        );

        expect(js_tree).toStrictEqual({
            path: "",
            children: [
                {
                    text: "FHMP",
                    path: "0",
                    html: '<p class="MsoTitle"> <a name="_Toc95808416"></a><a name="_Toc102616402"><span lang="EN-US">FHMP</span></a> </p>',
                    children: [
                        {
                            text: "Molecular Biology",
                            path: "0;0",
                            html: '<h1><span lang="EN-US">Molecular Biology</span></h1>',
                            children: [
                                {
                                    text: "[002] DNA Structure and Replication",
                                    path: "0;0;0",
                                    html: '<h2> <a name="_Toc86689177"></a><a name="_Toc95808417"></a><a name="_Toc102616403"><span lang="EN-US">[002] DNA Structure and Replication</span></a> </h2>',
                                    children: [
                                        {
                                            text: "Central Dogma of Molecular Biology",
                                            path: "0;0;0;0",
                                            html: '<h3> <a name="_Toc86689178"><span lang="EN-US">Central Dogma of Molecular Biology</span></a> </h3>',
                                            children: [
                                                {
                                                    text: "Definition",
                                                    path: "0;0;0;0;0",
                                                    html: '<p class="MsoListParagraph" style="text-indent: -18pt"> <span lang="EN-US" style="font-family: Symbol">·<span style="font: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span><span lang="EN-US">Definition</span> </p>',
                                                    children: [
                                                        {
                                                            text: "The central dogma of molecular biology describes the flow of genetic information from DNA to RNA to Proteins",
                                                            path: "0;0;0;0;0;0",
                                                            html: '<p class="MsoListParagraph" style="margin-left: 72pt; text-indent: -18pt"> <span lang="EN-US" style="font-family: &quot;Courier New&quot;">o<span style="font: 7pt \'Times New Roman\'">&nbsp;&nbsp; </span></span><span lang="EN-US">The central dogma of molecular biology describes the flow of genetic information from DNA to RNA to Proteins</span> </p>',
                                                            children: [],
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                        {
                                            text: "Three Domains of Life",
                                            path: "0;0;0;1",
                                            html: '<h3> <a name="_Toc86689179"><span lang="EN-US">Three Domains of Life</span></a> </h3>',
                                            children: [
                                                {
                                                    text: "Three Domains of Life",
                                                    path: "0;0;0;1;0",
                                                    html: '<p class="MsoListParagraph" style="text-indent: -18pt"> <span lang="EN-US" style="font-family: Symbol">·<span style="font: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span><span lang="EN-US">Three Domains of Life</span> </p>',
                                                    children: [
                                                        {
                                                            path: "0;0;0;1;0;0",
                                                            html: '<table class="MsoTableGrid" border="1" cellspacing="0" cellpadding="0" style=" margin-left: 72pt; border-collapse: collapse; border: none; "> <tbody><tr> <td width="173" valign="top" style=" width: 129.6pt; border: solid windowtext 1pt; padding: 0cm 5.4pt 0cm 5.4pt; "> <p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal"> <span lang="EN-US">Bacteria</span> </p></td><td width="174" valign="top" style=" width: 130.25pt; border: solid windowtext 1pt; border-left: none; padding: 0cm 5.4pt 0cm 5.4pt; "> <p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal"> <span lang="EN-US">Archaea</span> </p></td><td width="174" valign="top" style=" width: 130.25pt; border: solid windowtext 1pt; border-left: none; padding: 0cm 5.4pt 0cm 5.4pt; "> <p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal"> <span lang="EN-US">Eukarya</span> </p></td></tr><tr> <td width="346" colspan="2" valign="top" style=" width: 259.85pt; border: solid windowtext 1pt; border-top: none; padding: 0cm 5.4pt 0cm 5.4pt; "> <p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal"> <span lang="EN-US">Same Prokaryotic cellular architecture</span> </p></td><td width="174" valign="top" style=" width: 130.25pt; border-top: none; border-left: none; border-bottom: solid windowtext 1pt; border-right: solid windowtext 1pt; padding: 0cm 5.4pt 0cm 5.4pt; "> <p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal"> <span lang="EN-US">&nbsp;</span> </p></td></tr><tr> <td width="173" valign="top" style=" width: 129.6pt; border: solid windowtext 1pt; border-top: none; padding: 0cm 5.4pt 0cm 5.4pt; "> <p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal"> <span lang="EN-US">&nbsp;</span> </p></td><td width="347" colspan="2" valign="top" style=" width: 260.5pt; border-top: none; border-left: none; border-bottom: solid windowtext 1pt; border-right: solid windowtext 1pt; padding: 0cm 5.4pt 0cm 5.4pt; "> <p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal"> <span lang="EN-US">Same molecular architecture</span> </p><p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal"> <span lang="EN-US">Similar enzymes – RNA polymerase</span> </p></td></tr></tbody></table>',
                                                            children: [],
                                                            table: [
                                                                // prettier-ignore
                                                                [["Bacteria"], ['Archaea'], ['Eukarya']],
                                                                // prettier-ignore
                                                                [['Same Prokaryotic cellular architecture'], [""]],
                                                                // prettier-ignore
                                                                [[''], ['Same molecular architecture', 'Similar enzymes – RNA polymerase']],
                                                            ],
                                                        },
                                                    ],
                                                },
                                                {
                                                    text: "Archaea",
                                                    path: "0;0;0;1;1",
                                                    html: '<p class="MsoListParagraph" style="text-indent: -18pt"> <span lang="EN-US" style="font-family: Symbol">·<span style="font: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span><span lang="EN-US">Archaea</span> </p>',
                                                    children: [
                                                        {
                                                            text: "Property: Living in extreme environments",
                                                            path: "0;0;0;1;1;0",
                                                            html: '<p class="MsoListParagraph" style="margin-left: 72pt; text-indent: -18pt"> <span lang="EN-US" style="font-family: &quot;Courier New&quot;">o<span style="font: 7pt \'Times New Roman\'">&nbsp;&nbsp; </span></span><span lang="EN-US">Property: Living in extreme environments</span> </p>',
                                                            children: [
                                                                {
                                                                    path: "0;0;0;1;1;0;0",
                                                                    html: '<p class="MsoListParagraph" style="margin-left: 108pt; text-indent: -18pt"> <span lang="EN-US" style="font-family: Wingdings">§<span style="font: 7pt \'Times New Roman\'">&nbsp; </span></span><span lang="EN-US">Cryophilic – able to live in cold environments</span> </p>',
                                                                    children:
                                                                        [],
                                                                    text: "Cryophilic – able to live in cold environments",
                                                                },
                                                                {
                                                                    path: "0;0;0;1;1;0;1",
                                                                    html: '<p class="MsoListParagraph" style="margin-left: 108pt; text-indent: -18pt"> <span lang="EN-US" style="font-family: Wingdings">§<span style="font: 7pt \'Times New Roman\'">&nbsp; </span></span><span lang="EN-US">Acidophilic – able to live highly acidic environments</span> </p>',
                                                                    children:
                                                                        [],
                                                                    text: "Acidophilic – able to live highly acidic environments",
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });
});
