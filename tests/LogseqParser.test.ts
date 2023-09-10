import {
    ImageNoteToLogseq,
    TableNoteToLogseq,
    TextNoteToLogseq,
    formatImageInTableNote,
} from "../src/LogseqParser";
import { TableNote } from "../types/types";
import { mockHtml_table_image, mockImageNote, mockTextNote } from "./mocks";

describe("TextNoteToLogseq", () => {
    it("should return the correct string", () => {
        const logseqNote = TextNoteToLogseq(mockTextNote);

        expect(logseqNote).toBe("\t\t\t\t- logseq is cool");
    });
});

describe("ImageNoteToLogseq", () => {
    it("should return the correct string", () => {
        const logseqNote = ImageNoteToLogseq(mockImageNote);

        expect(logseqNote).toBe(
            "\t\t\t\t- ![image.png](../assets/muskies/elon.png){:height 420, :width 69} ![image.png](../assets/baldie/bezos.png){:height 666, :width 666}"
        );
    });
});

describe("formatImageInTableNote", () => {
    it("should format images in a table", () => {
        const formatedTable = formatImageInTableNote([
            // prettier-ignore
            [['Foramen transversarium /', 'Transverse foramen', [{src: "MBBSY1%20Yi%20Hein%20Builds.fld/image199.png", width: 147, height: 111}]], ['Stacked together to form a canal where arteries and veins pass through [thorax to brain]','']],
        ]);

        expect(formatedTable).toStrictEqual([
            [
                // prettier-ignore
                'Foramen transversarium /\nTransverse foramen\n![image.png](../assets/MBBSY1%20Yi%20Hein%20Builds.fld/image199.png){:height 111, :width 147}',
                // prettier-ignore
                'Stacked together to form a canal where arteries and veins pass through [thorax to brain]\n',
            ],
        ]);
    });
});

describe("TableNoteToLogseq", () => {
    it("should convert table note to logseq format", () => {
        const tableNote: TableNote = {
            path: "1;2",
            children: [],
            table: [
                // prettier-ignore
                [['Foramen transversarium /', 'Transverse foramen', [{src: "MBBSY1%20Yi%20Hein%20Builds.fld/image199.png", width: 147, height: 111}]], ['Stacked together to form a canal where arteries and veins pass through [thorax to brain]','']],
            ],
        };
        console.log(tableNote);
        expect(TableNoteToLogseq(tableNote)).toEqual(
            "|Foramen transversarium /\nTransverse foramen\n![image.png](../assets/MBBSY1%20Yi%20Hein%20Builds.fld/image199.png){:height 111, :width 147}|Stacked together to form a canal where arteries and veins pass through [thorax to brain]\n|"
        );
    });
});
