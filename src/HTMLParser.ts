/**
 * HTMLParser takes in a HTML document and returns a JSON object representing a hierarchical tree of the content of HTML document
 * @param HTML
 * @returns JSON
 */

import { Note } from "../types/types";

const SYMBOL_FONT_FAMILIES = ["Symbol", "Wingdings", "'Courier New'"];

/**
 * Extracts the text from text nodes.
 *
 * Text nodes are either p, H1, H2, H3 elements.
 * Text content is often embbeded in span, sub, a elements within the p, H1, H2, H3 elements.
 * This function extracts the core text, while ignoring bullet point styling elements
 */
export function extractTextNodes(currentElement: HTMLElement) {
    const childNodes = Array.from(currentElement.childNodes);

    const textNodes = childNodes.reduce((texts: string[], node: Node) => {
        // Guard clause to prevent parsing bullet points (bullet points have font family set)
        if (checkIfSymbol(node)) return texts;

        if (node.textContent != null) {
            texts.push(node.textContent);
            return texts;
        }

        return texts;
    }, []);
    const text = cleanText(textNodes.join(" "));

    return text;
}

/**
 * Removes non-breaking space in some of the extracted text of the text nodes and removes newlines
 *
 * @param text
 */
export function cleanText(text: string) {
    const noBreakingSpaces = text.replace(/\u00A0/g, "");
    const noNewLines = noBreakingSpaces.trim();

    return noNewLines;
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
export function insertSibilingInLatestAndDeepestDepths(object, dataToBeInserted, path: number[] = []) {
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
        return insertSibilingInLatestAndDeepestDepths(object.children[lastChildIndex], dataToBeInserted, addIndexToPath(path, indexForInsertion));
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
export function insertChildInLatestAndDeepestDepths(object, dataToBeInserted, path: number[] = []) {
    // Insert data if the current node is the deepest node
    if (object.children.length === 0) {
        return insertChildren(object, { ...dataToBeInserted, path: pathToString(addIndexToPath(path, 0)) });
    } else {
        // Dive into the latest node if its not the deepest node yet
        const lastChildIndex = object.children.length - 1;
        return insertChildInLatestAndDeepestDepths(object.children[lastChildIndex], dataToBeInserted, addIndexToPath(path, lastChildIndex));
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
export function insertChildInLatestAndAtSpecifiedDepth(object, dataToBeInserted, numDepthsLeft: number, path: number[] = []) {
    const lastChildIndex = object.children.length - 1;
    if (numDepthsLeft === 0) {
        return insertChildren(object, { ...dataToBeInserted, path: pathToString(addIndexToPath(path, lastChildIndex + 1)) });
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
export function insertSibilingAtSpecifiedDepth(object, dataToBeInserted, depth, path: number[] = []) {
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
