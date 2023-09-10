import { ImageNote, Note, TableNote, TextNote } from "../types/types";

const LOGSEQ_TAB = "\t";
const LOGSEQ_BULLET = "- ";

export function addLogseqBullet(depth: number, text: string) {
    return LOGSEQ_TAB.repeat(depth) + LOGSEQ_BULLET + text;
}

export function TextNoteToLogseq(textNote: TextNote) {
    const depth = textNote.path.split(";").length;
    return addLogseqBullet(depth, textNote.text);
}

export function ImageNoteToLogseq(imageNote: ImageNote) {
    const depth = imageNote.path.split(";").length;
    const imagesText = imageNote.images
        .map(({ src, height, width }) => {
            return `![image.png](../assets/${src}){:height ${height}, :width ${width}}`;
        })
        .join(" ");

    return addLogseqBullet(depth, imagesText);
}

export function TableNoteToLogseq(tableNote: TableNote) {}

export function JSONtoLogseq(json: Note) {
    return json;
}
