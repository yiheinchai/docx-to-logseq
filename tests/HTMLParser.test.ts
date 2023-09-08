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
} from "../src/HTMLParser";
import {
    mockHtml_h1,
    mockHtml_h2,
    mockHtml_h3,
    mockHtml_img,
    mockHtml_p1,
    mockHtml_p2,
    mockHtml_p3,
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

        expect(level).toBe(1);
    });

    it("is able to get depth of p tags", () => {
        document.body.innerHTML = mockHtml_p3;
        const p3_element = document.querySelector("p");

        if (p3_element == null)
            throw new Error("p3 element mock is configured wrongly!");

        const level = getElementDepth(p3_element);

        expect(level).toBe(6);
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
            src: "http://localhost/MBBSY1%20Yi%20Hein%20Builds.fld/image1161.png",
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

        console.log(table_detail);

        expect(table_detail).toStrictEqual(expectedTableDetail);
    });
});
