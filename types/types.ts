export enum NoteType {
    TEXT = 1,
    IMAGE = 2,
    TABLE = 3,
}

export interface Note {
    index: string;
    children: (TextNote | ImageNote | TableNote)[];
}

export interface TextNote extends Note {
    text: string;
}

export interface ImageNote extends Note {
    url: string;
}

export interface TableNote extends Note {
    data: object;
}

export type TextNoteForm = Pick<TextNote, "text" | "children">;
