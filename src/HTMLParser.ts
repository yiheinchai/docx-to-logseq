/**
 * HTMLParser takes in a HTML document and returns a JSON object representing a hierarchical tree of the content of HTML document
 * @param HTML
 * @returns JSON
 */

import {
    ImageDetail,
    ImageNoteForm,
    Note,
    NoteForm,
    TableData,
    TableNoteForm,
    TextNote,
    TextNoteForm,
    assertNever,
} from "../types/types";

/**
 * The following are helper functions which is meant to facilitate the building of the hierarchial JSON object
 */

/**
 * Searches through the JS object via entering the last child of current node recursively
 * Inserts data beside the deepest node as a sibiling
 *
 * DETAILS:
 * When the child of current node is the deepest node, we insert data beside that deepest node (as a sibiling)
 *
 * @param object
 * @param dataToBeInserted
 * @param previousIndex
 * @returns
 */
export function insertSibilingInLatestAndDeepestDepths(
    object: Note = { path: "", children: [] },
    dataToBeInserted: NoteForm,
    path: number[] = []
) {
    const lastChildIndex = object.children.length - 1;
    const numGrandChildren = object.children[lastChildIndex].children.length;

    // Insert data if the chlld of current node is the deepest node
    if (numGrandChildren === 0) {
        const indexForInsertion = lastChildIndex + 1; // get index of the position in which data will be inserted
        const newPath = pathToString(addIndexToPath(path, indexForInsertion));
        return insertChildren(object, { ...dataToBeInserted, path: newPath });
    } else {
        // Dive into the latest node if its not the deepest node yet
        const indexForInsertion = lastChildIndex;
        return insertSibilingInLatestAndDeepestDepths(
            object.children[lastChildIndex],
            dataToBeInserted,
            addIndexToPath(path, indexForInsertion)
        );
    }
}

/**
 * Searches through the JS object via entering the last child of current node recursively
 * Inserts data as a child of the deepest node
 * @param object
 * @param dataToBeInserted
 * @param path
 * @returns
 */
export function insertChildInLatestAndDeepestDepths(
    object: Note = { path: "", children: [] },
    dataToBeInserted: NoteForm,
    path: number[] = []
) {
    // Insert data if the current node is the deepest node
    if (object.children.length === 0) {
        return insertChildren(object, {
            ...dataToBeInserted,
            path: pathToString(addIndexToPath(path, 0)),
        });
    } else {
        // Dive into the latest node if its not the deepest node yet
        const lastChildIndex = object.children.length - 1;
        return insertChildInLatestAndDeepestDepths(
            object.children[lastChildIndex],
            dataToBeInserted,
            addIndexToPath(path, lastChildIndex)
        );
    }
}

/**
 * Searches through the JS object via entering the last child of current node recursively
 * Inserts data as a child of the last node of the specified depth
 * @param object
 * @param dataToBeInserted
 * @param numDepthsLeft
 * @returns
 */
export function insertChildInLatestAndAtSpecifiedDepth(
    object: Note = { path: "", children: [] },
    dataToBeInserted: NoteForm,
    numDepthsLeft: number,
    path: number[] = []
) {
    const lastChildIndex = object.children.length - 1;
    if (numDepthsLeft === 0) {
        return insertChildren(object, {
            ...dataToBeInserted,
            path: pathToString(addIndexToPath(path, lastChildIndex + 1)),
        });
    } else {
        return insertChildInLatestAndAtSpecifiedDepth(
            object.children[lastChildIndex],
            dataToBeInserted,
            numDepthsLeft - 1,
            addIndexToPath(path, lastChildIndex)
        );
    }
}

/**
 * Searches through the JS object via entering the last child of current node recursively
 * Inserts data as a sibiling at the specified depth
 * @param object
 * @param dataToBeInserted
 * @param depth
 * @param previousIndex
 * @returns
 */
export function insertSibilingAtSpecifiedDepth(
    object: Note = { path: "", children: [] },
    dataToBeInserted: NoteForm,
    depth,
    path: number[] = []
) {
    if (depth === 1) {
        const currentLevelIndex = object.children.length - 1 + 1;
        const newPath = pathToString(addIndexToPath(path, currentLevelIndex));
        return insertChildren(object, { ...dataToBeInserted, path: newPath });
    } else {
        const currentLevelIndex = object.children.length - 1;
        return insertSibilingAtSpecifiedDepth(
            object.children[object.children.length - 1],
            dataToBeInserted,
            depth - 1,
            addIndexToPath(path, currentLevelIndex)
        );
    }
}

/**
 * Adds a child to the current node
 * @param object
 * @param dataToBeInserted
 * @returns
 */
export function insertChildren(object, dataToBeInserted: Note) {
    object.children.push(dataToBeInserted);
    return object;
}

/**
 * Append new path onto the existing path to note
 * @param path
 * @param index
 * @returns
 */
export function addIndexToPath(path: number[], index) {
    return [...path, index];
}

export function pathToString(path: number[]) {
    return path.join(";");
}

// HTML PARSER

const TEXT_TAGS = ["p", "h1", "h2", "h3"];

const elementDepthMapping = {
    MsoTitle: 1,
    h1: 2,
    h2: 3,
    h3: 4,
    p: {
        "": 5,
        "72pt": 6,
        "108pt": 7,
        "144pt": 8,
        "180pt": 9,
        "216pt": 10,
        "254pt": 11,
        "290pt": 12,
    },
};

/**
 * Get level of element
 * Used to tell at which depth the element should be inserted
 *
 * @param element
 * @returns
 */
export function getElementDepth(element: HTMLElement) {
    const tagName = element.localName;

    if (element.className in elementDepthMapping) {
        return elementDepthMapping[element.className];
    }

    if (tagName === "p") {
        // p tag margin is used to determine the level in the hierarchy
        const elementMargins = element.style.marginLeft;
        return elementDepthMapping["p"][elementMargins];
    }

    return elementDepthMapping[tagName];
}

// DATA EXTRACTORS

const SYMBOL_FONT_FAMILIES = [
    "Symbol",
    "Wingdings",
    '"Courier New"',
    "'Courier New'",
];

/**
 * Removes non-breaking space in some of the extracted text of the text nodes and removes newlines
 *
 * @param text
 */
export function cleanText(text: string) {
    const noBreakingSpaces = text.replace(/\u00A0/g, "");
    const noSideSpaces = noBreakingSpaces.trim();
    const noNewLines = noSideSpaces.replace(/[\n\r]+|[\s]{2,}/g, " ");
    const noDoubleSpaces = noNewLines.replace(/  +/g, " ");

    return noDoubleSpaces;
}

/**
 * Check if the HTML element is meant to contain a bullet point in word
 *
 * @param element
 * @returns boolean
 */
export function checkIfSymbol(element: Node | HTMLElement) {
    const htmlElement = element as HTMLElement;
    return SYMBOL_FONT_FAMILIES.includes(htmlElement.style?.fontFamily);
}

/**
 * Extracts the text from text nodes.
 *
 * Text nodes are either p, H1, H2, H3 elements.
 * Text content is often embbeded in span, sub, a elements within the p, H1, H2, H3 elements.
 * This function extracts the core text, while ignoring bullet point styling elements
 */

const TEXT_CHILD_ELEMENTS = ["span", "sub", "a", "#text"];

export function getTextFromElement(currentElement: HTMLElement) {
    const childNodes = Array.from(currentElement.childNodes);

    const textNodes = childNodes.reduce(
        (texts: string[], node: HTMLElement) => {
            // Guard clause to prevent parsing bullet points (bullet points have font family set)
            if (checkIfSymbol(node)) return texts;

            if (node.textContent) {
                texts.push(node.textContent);
                return texts;
            }

            return texts;
        },
        []
    );
    const text = cleanText(textNodes.join(" "));

    return text;
}

export function formatSrcLink(link: string) {
    // Define a regex pattern that matches the http://localhost:1234/ part of the URL
    // Replace the matched part with ./ using the replace method
    return link.replace(/^http:\/\/localhost(:\d+)?\//, "");
}

/**
 * Get the src, height, width data from the image element
 * @param imageElement
 * @returns
 */
export function getImageFromElement(imageElement: HTMLImageElement) {
    const imageData: ImageDetail = {
        src: formatSrcLink(imageElement.src),
        height: imageElement.height,
        width: imageElement.width,
    };
    return imageData;
}

export function getImagesFromElements(imageElements: HTMLImageElement[]) {
    return imageElements.map((img) => getImageFromElement(img));
}

const TABLE_CELL_ELEMENTS = ["p", "img"];

/**
 * Extract table data from HTML table element
 *
 * @param tableElement
 * @returns
 */
export function getTableFromElement(tableElement: HTMLTableElement) {
    const tableData: TableData = Array.from(tableElement.rows).map((row) => {
        return Array.from(row.cells).map((cell) => {
            // Filter out the formating #text elements
            const cellNodes = Array.from(cell.childNodes).filter((node) =>
                TABLE_CELL_ELEMENTS.includes(node.nodeName.toLowerCase())
            );

            return cellNodes.map((ele) => {
                return getElementData(ele as HTMLElement);
            });
        });
    });

    return tableData;
}

export function getElementData(element: HTMLElement) {
    const tagName = element.nodeName.toLowerCase();

    // For in paragraph elements
    if (tagName === "p") {
        // We expect only one table in a bullet point
        const table = element.querySelector("table");

        // there can be more than 1 image in a bullet point
        const images = Array.from(element.querySelectorAll("img"));

        if (table) {
            return getTableFromElement(table);
        } else if (images.length > 0) {
            return getImagesFromElements(images);
        } else {
            return getTextFromElement(element);
        }
    }

    if (tagName === "div") {
        const table = element.querySelector("table");
        if (table) {
            return getTableFromElement(table);
        }
    }

    // For image elements not in paragraph
    if (tagName === "img") {
        return [getImageFromElement(element as HTMLImageElement)];
    }

    // For table elements not in paragraph
    if (tagName === "table") {
        return getTableFromElement(element as HTMLTableElement);
    }

    // For heading elements
    if (TEXT_TAGS.includes(tagName)) {
        return getTextFromElement(element);
    }

    // TODO: Possible way to refactor this
    // A map of element types to corresponding functions
    // const elementFunctions = new Map<string, Function>([
    //     ["table", getTableFromElement],
    //     ["img", getImageFromElement],
    //     ["p", getTextFromParagraph],
    //     ["div", getDataFromDiv],
    // ]);

    console.log(
        "Unrecognized element: ",
        element,
        element.nodeName,
        element.className
    );
    // assertNever();
}

export function removeNewLines(string: string) {
    const regex = /\r?\n|\r/g;
    return string.replace(regex, "");
}

export function getElementHtml(ele: HTMLElement) {
    return removeNewLines(ele.outerHTML);
}

/**
 * Converts data returned from getElementData into data as Note format
 * @param data
 * @returns
 */
export function elementDataToNote(
    data: string | ImageDetail[] | TableData,
    html: string
): TextNoteForm | ImageNoteForm | TableNoteForm {
    if (typeof data === "string") {
        return {
            text: data,
            children: [],
            html,
        };
    } else if (
        Array.isArray(data) &&
        data.every((e): e is ImageDetail => "src" in e)
    ) {
        // TODO: Check why data.every does not result in type narrowing
        return {
            images: data,
            children: [],
            html,
        };
    }

    return {
        table: data,
        children: [],
        html,
    };
}

export function htmlToJS(html: HTMLElement[]) {
    const note: Note = {
        path: "",
        children: [],
    };

    let previousDepth = -1;
    html.forEach((ele, i) => {
        let elementDepth = getElementDepth(ele) ?? previousDepth + 1;
        const newNote = elementDataToNote(
            getElementData(ele),
            getElementHtml(ele)
        );
        if (elementDepth === previousDepth) {
            insertSibilingInLatestAndDeepestDepths(note, newNote);
        } else if (elementDepth < previousDepth) {
            insertSibilingAtSpecifiedDepth(note, newNote, elementDepth);
        } else if (elementDepth > previousDepth) {
            insertChildInLatestAndDeepestDepths(note, newNote);
        }

        previousDepth = elementDepth;
    });

    return note;
}
