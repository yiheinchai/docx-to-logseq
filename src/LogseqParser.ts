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
                return cellItems.join("\t");
            }

            assertNever();
        });
    });
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
    return markdownTable(formatImageInTableNote(tableNote.table));
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
