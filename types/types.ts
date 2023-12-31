export enum NoteType {
    TEXT = 1,
    IMAGE = 2,
    TABLE = 3,
}

export interface Note {
    path: string;
    children: (TextNote | ImageNote | TableNote)[];
}

export interface TextNote extends Note {
    text: string;
    html: string;
}

export interface ImageDetail {
    src: string;
    width: number;
    height: number;
}

export type TableCell = (ImageDetail[] | string | TableData)[];

export type TableRow = TableCell[];

export type TableData = TableRow[];

export type twoDimTable = string[][];

export interface ImageNote extends Note {
    images: ImageDetail[];
    html: string;
}

export interface TableNote extends Note {
    table: TableData;
    html: string;
}

export type TextNoteForm = Omit<TextNote, "path">;
export type ImageNoteForm = Omit<ImageNote, "path">;
export type TableNoteForm = Omit<TableNote, "path">;

export type NoteForm = TextNoteForm | ImageNoteForm | TableNoteForm;

export type LogseqPage = {
    pageTitle: string;
    pageContent: string;
};

export function assertNever(): never {
    throw new Error(
        "Conditional case is not handled, this is not a valid code path. Add more conditions via if statements to handle this case."
    );
}
