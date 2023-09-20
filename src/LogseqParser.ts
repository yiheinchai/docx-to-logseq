import {
    ImageDetail,
    ImageNote,
    Note,
    TableData,
    TableNote,
    TextNote,
    assertNever,
    twoDimTable,
} from "../types/types";

const LOGSEQ_TAB = "\t";
const LOGSEQ_BULLET = "- ";

export function addLogseqBullet(depth: number, text: string) {
    return LOGSEQ_TAB.repeat(depth) + LOGSEQ_BULLET + text;
}

export function TextNoteToLogseq(textNote: TextNote) {
    const depth = textNote.path.split(";").length;
    return addLogseqBullet(depth, textNote.text);
}

export function getLogseqImageMarkdown(
    src: string,
    height: number,
    width: number
) {
    return `![image.png](../assets/${src}){:height ${height}, :width ${width}}`;
}

/**
 * Converts image detail from object form to markdown form
 * @param imageDetail
 * @returns
 */
export function imageDetailToLogseqImageMarkdown(imageDetail: ImageDetail) {
    return getLogseqImageMarkdown(
        imageDetail.src,
        imageDetail.height,
        imageDetail.width
    );
}

export function ImageNoteToLogseq(imageNote: ImageNote) {
    const depth = imageNote.path.split(";").length;
    const imagesText = imageNote.images
        .map(imageDetailToLogseqImageMarkdown)
        .join(" ");

    return addLogseqBullet(depth, imagesText);
}

/**
 * Converts image details in a table from object form to markdown form
 * @param table
 * @returns
 */
export function formatImageInTableNote(table: TableData): twoDimTable {
    return table.map((row) => {
        return row.map((cell) => {
            const cellItems: string[] | TableData = cell
                .map((cellItem) => {
                    if (typeof cellItem === "string") {
                        // Don't do anything for text
                        return cellItem;
                    } else if (
                        // * This is the way to do type narrow with arrays
                        cellItem.every(
                            (item): item is ImageDetail => "src" in item
                        )
                    ) {
                        // Format images to logseq markdown syntax
                        return cellItem
                            .map(imageDetailToLogseqImageMarkdown)
                            .join(" ");
                    } else {
                        // TODO: We currently do not support nested tables
                        return undefined;
                        // // Recursive call if there is a table in a table
                        // // return formatImageInTableNote(cellItem);
                    }
                })
                // TODO: We currently do not support nested tables
                .filter((item) => typeof item == "string");

            if (cellItems.every((item) => typeof item === "string")) {
                return cellItems.join("\n");
            }

            assertNever();
        });
    });
}
// This function takes an HTML table string as input and returns an array of array
// Each subarray contains an array of [width, rowspan] for each cell in the corresponding row
export function getTableMetadata(table) {
    // This regex matches the opening and closing tags of table rows
    let rowRegex = /<tr[^>]*>(.*?)<\/tr>/g;
    // This regex matches the opening and closing tags of table cells
    let cellRegex = /<(td|th)[^>]*>(.*?)<\/\1>/g;
    // This regex matches the width attribute of a tag
    let widthRegex = /width="(\d+)"/;
    // This regex matches the rowspan attribute of a tag
    let rowspanRegex = /rowspan="(\d+)"/;
    // This array will store the result
    let result = [];
    // This variable will store the current match of rowRegex
    let rowMatch;
    // Loop through all the rows in the table
    while ((rowMatch = rowRegex.exec(table))) {
        // Get the content of the current row
        let rowContent = rowMatch[1];
        // This array will store the [width, rowspan] arrays for the cells in the current row
        let rowCells = [];
        // This variable will store the current match of cellRegex
        let cellMatch;
        // Loop through all the cells in the current row
        while ((cellMatch = cellRegex.exec(rowContent))) {
            // Get the opening tag of the current cell
            let cellTag = cellMatch[0];
            // Get the width attribute of the current cell, or 0 if not found
            let cellWidth = widthRegex.test(cellTag)
                ? parseInt(widthRegex.exec(cellTag)[1])
                : 0;
            // Get the rowspan attribute of the current cell, or 1 if not found
            let cellRowspan = rowspanRegex.test(cellTag)
                ? parseInt(rowspanRegex.exec(cellTag)[1])
                : 1;
            // Push the [width, rowspan] array to the rowCells array
            rowCells.push([cellWidth, cellRowspan]);
        }
        // Push the rowCells array to the result array
        result.push(rowCells);
    }
    // Return the result array
    return result;
}

export function getMaxRowsMaxCols(table) {
    const maxRow = table.length;
    const maxCol = Math.max(...table.map((row) => row.length));
    return [maxRow, maxCol];
}

// A function that splits the cells of a table according to the metadata
export function splitMergedCells(table_data, table_metadata) {
    // A new array to store the processed table
    let processedTable = [];
    // Loop through each row of the table data
    for (let i = 0; i < table_data.length; i++) {
        // A new array to store the processed row
        let processedRow = [];
        // A variable to store the number of cells added to the current row
        let numAddedCells = 0;
        // Loop through each cell of the row
        for (let j = 0; j < table_data[i].length; j++) {
            // Get the cell value and the metadata
            let cellValue = table_data[i][j];
            // Adjust the column index by adding the number of cells added to the current row
            let colIndex = j + numAddedCells;
            let cellWidth = table_metadata[i][colIndex][0];
            let cellRowspan = table_metadata[i][colIndex][1];
            // Get the minimum cell width in the row
            let minCellWidth = Math.min(...table_metadata[i].map((x) => x[0]));
            // Check if the cell width is approximately a multiple of the minimum cell width, indicating a merged column
            // Use a tolerance of 10 pixels for approximation
            let tolerance = 10;
            if (
                cellWidth > minCellWidth + tolerance &&
                Math.abs(cellWidth % minCellWidth) - minCellWidth <= tolerance
            ) {
                // Get the number of cells to be split
                let numSplitCells = Math.round(cellWidth / minCellWidth);
                // Split the cell into numSplitCells cells with the same value and metadata
                table_metadata[i].splice(colIndex, 1);

                for (let k = 0; k < numSplitCells; k++) {
                    processedRow.push(cellValue);

                    // Make sure to delete the current metadata cell

                    // Update the table_metadata array with the same cell width and rowspan as the original cell
                    table_metadata[i].splice(colIndex + k, 0, [
                        minCellWidth,
                        cellRowspan,
                    ]);
                }
                // Update the number of cells added to the current row
                numAddedCells += numSplitCells - 1;
            } else {
                // Keep the cell as it is
                processedRow.push(cellValue);
            }
            // Check if the cell rowspan is more than one, indicating a merged row
            if (cellRowspan > 1) {
                // Loop through the number of rows to be merged
                for (let k = 1; k < cellRowspan; k++) {
                    // Get the index of the row below
                    let nextRowIndex = i + k;
                    // Check if the row below exists in the table data
                    if (table_data[nextRowIndex]) {
                        // Insert a new cell with the same value and metadata at the same column index
                        table_data[nextRowIndex].splice(colIndex, 0, cellValue);
                        table_metadata[nextRowIndex].splice(colIndex, 0, [
                            cellWidth,
                            1,
                        ]);
                    } else {
                        // Create a new row with an empty cell at the same column index
                        let newRow = new Array(table_data[i].length).fill("");
                        newRow[colIndex] = cellValue;
                        table_data.push(newRow);
                        // Create a new row in the table_metadata array with an empty cell at the same column index
                        let newMetaRow = new Array(
                            table_metadata[i].length
                        ).fill([0, 0]);
                        newMetaRow[colIndex] = [cellWidth, 1];
                        table_metadata.push(newMetaRow);
                    }
                }
            }
        }
        // Push the processed row to the processed table
        processedTable.push(processedRow);
    }
    // Return the processed table
    return processedTable;
}

/*
 * Utilies the width of td elements in HTML to identify merged cells in TableData and duplicates the info in the cell to handle merged cells in markdown
 * @param table
 * @param html
 */
export function formatMergedCellsInTable(table: TableData, html: string) {
    return splitMergedCells(table, getTableMetadata(html));
}

export function addWallsToTable(str: string) {
    return "|" + str + "|";
}

export function markdownTable(table: twoDimTable) {
    return table
        .map((row) =>
            addWallsToTable(
                row.map((cell) => cell.replace(/\n/g, "<br>")).join("|")
            )
        )
        .join("\n");
}

export function TableNoteToLogseq(tableNote: TableNote) {
    const formatMerged = formatMergedCellsInTable(
        tableNote.table,
        tableNote.html
    );
    const formatImage = formatImageInTableNote(formatMerged);
    return markdownTable(formatImage);
}

export function noteToLogseq(json: Note): string {
    return json.children
        .map((note) => {
            if ("text" in note) {
                return TextNoteToLogseq(note) + "\n" + noteToLogseq(note);
            } else if ("images" in note && note.images) {
                return ImageNoteToLogseq(note) + "\n" + noteToLogseq(note);
            } else if ("table" in note && note.table) {
                return TableNoteToLogseq(note) + "\n" + noteToLogseq(note);
            }
        })
        .join("\n");
}

export function getNoteDepth(note: Note) {
    if (note.path === "") return 0;
    return note.path.split(";").length;
}

export function noteToLogseqByPage(json: Note) {
    if (getNoteDepth(json) !== 0) {
        return {
            pageTitle: "MBBS Notes",
            pageContent: noteToLogseq(json),
        };
    }
    json.children.forEach((note) => {});
}
