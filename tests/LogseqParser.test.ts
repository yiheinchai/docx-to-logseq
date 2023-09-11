import {
    ImageNoteToLogseq,
    TableNoteToLogseq,
    TextNoteToLogseq,
    formatImageInTableNote,
    getMaxRowsMaxCols,
    markdownTable,
    getTableMetadata,
    splitMergedCells,
} from "../src/LogseqParser";
import { TableNote } from "../types/types";
import {
    mockHtml_table_image,
    mockHtml_table_merge_cols,
    mockHtml_table_merge_rows,
    mockImageNote,
    mockTextNote,
} from "./mocks";

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

// describe("formatImageInTableNote", () => {
//     it("should format images in a table", () => {
//         const formatedTable = formatImageInTableNote([
//             // prettier-ignore
//             [['Foramen transversarium /', 'Transverse foramen', [{src: "MBBSY1%20Yi%20Hein%20Builds.fld/image199.png", width: 147, height: 111}]], ['Stacked together to form a canal where arteries and veins pass through [thorax to brain]','']],
//         ]);

//         expect(formatedTable).toStrictEqual([
//             [
//                 // prettier-ignore
//                 'Foramen transversarium /\nTransverse foramen\n![image.png](../assets/MBBSY1%20Yi%20Hein%20Builds.fld/image199.png){:height 111, :width 147}',
//                 // prettier-ignore
//                 'Stacked together to form a canal where arteries and veins pass through [thorax to brain]\n',
//             ],
//         ]);
//     });
// });

// describe("TableNoteToLogseq", () => {
//     it("should convert table note to logseq format", () => {
//         const tableNote: TableNote = {
//             path: "1;2",
//             children: [],
//             table: [
//                 // prettier-ignore
//                 [['Foramen transversarium /', 'Transverse foramen', [{src: "MBBSY1%20Yi%20Hein%20Builds.fld/image199.png", width: 147, height: 111}]], ['Stacked together to form a canal where arteries and veins pass through [thorax to brain]','']],
//             ],
//         };
//         expect(TableNoteToLogseq(tableNote)).toEqual(
//             "|Foramen transversarium /\nTransverse foramen\n![image.png](../assets/MBBSY1%20Yi%20Hein%20Builds.fld/image199.png){:height 111, :width 147}|Stacked together to form a canal where arteries and veins pass through [thorax to brain]\n|"
//         );
//     });
// });

describe("markdownTable", () => {
    it("is able to handle standard table", () => {
        const markdown = markdownTable([
            ["header1", "header2"],
            ["value1", "value2"],
        ]);

        expect(markdown).toBe(`|header1|header2|\n|value1|value2|`);
    });

    it("is able to handle table with double lines", () => {
        const markdown = markdownTable([
            ["header1", "header2"],
            ["value1\nvalue1 information", "value2"],
        ]);

        expect(markdown).toBe(
            `|header1|header2|\n|value1<br>value1 information|value2|`
        );
    });
});

describe("getTableMetadata", () => {
    it("works for merged cols to get the widths of the cells and rowspans correctly", () => {
        const parsedTable = getTableMetadata(mockHtml_table_merge_cols);
        expect(parsedTable).toStrictEqual([
            [
                [173, 1],
                [174, 1],
                [174, 1],
            ],
            [
                [346, 1],
                [174, 1],
            ],
            [
                [173, 1],
                [347, 1],
            ],
        ]);
    });

    // 111 130 129 135.  111 130 129 135.   130 129 135

    it("works for merged rows to get the widths of the cells and rowspans correctly", () => {
        const parsedTable = getTableMetadata(mockHtml_table_merge_rows);
        expect(parsedTable).toStrictEqual([
            [
                [111, 1],
                [130, 1],
                [129, 1],
                [135, 1],
            ],
            [
                [111, 1],
                [130, 1],
                [129, 1],
                [135, 1],
            ],
            [
                [111, 2],
                [130, 1],
                [129, 1],
                [135, 1],
            ],
            [
                [130, 1],
                [129, 1],
                [135, 1],
            ],
        ]);
    });
});

describe("getMaxRowsMaxCols", () => {
    it("is able to get the max cols number and row number of a matrix", () => {
        const [rows, cols] = getMaxRowsMaxCols([
            [
                [173, 1],
                [174, 1],
                [174, 1],
            ],
            [
                [346, 1],
                [174, 1],
            ],
            [
                [173, 1],
                [347, 1],
            ],
        ]);

        expect(rows).toBe(3);
        expect(cols).toBe(3);
    });
});

describe("splitMergedCells", () => {
    it("is able to handle both merged cols and merged rows", () => {
        const processedTable = splitMergedCells(
            [
                ["Merge Col AB", "C"],
                ["Merge Row Aval12", "Bval", "Cval"],
                ["Bval2", "Cval2"],
            ],
            [
                [
                    [346, 1],
                    [174, 1],
                ],
                [
                    [173, 2],
                    [174, 1],
                    [174, 1],
                ],
                [
                    [173, 1],
                    [174, 1],
                ],
            ]
        );

        expect(processedTable).toStrictEqual([
            ["Merge Col AB", "Merge Col AB", "C"],
            ["Merge Row Aval12", "Bval", "Cval"],
            ["Merge Row Aval12", "Bval2", "Cval2"],
        ]);
    });

    it("is able to handle both merged cols and merged rows in middle parts and end parts", () => {
        const processedTable = splitMergedCells(
            [
                // prettier-ignore
                ["Merge Col AB", "C", "Merge Col DE", "F", "G", "H"],
                // prettier-ignore
                ["Merge Row Aval12","Bval","Cval","Merge Row Dval12","Eval1","Merge Row Fval12", "Gval1", "Hval1"],
                // prettier-ignore
                ["Bval2", "Cval2", "Eval2", "Merge Col GH"],
            ],
            // prettier-ignore
            [[[346, 1],[174, 1],[348, 1],[175, 1], [173,1], [174,1]],
                // prettier-ignore 
                [[173, 2],[174, 1],[174, 1],[174, 2],[174, 1],[173, 2],[172,1], [175,1]],
                // prettier-ignore 
                [[173, 1],[174, 1],[174, 1],[346,1]],
            ]
        );

        expect(processedTable).toStrictEqual([
            // prettier-ignore
            ["Merge Col AB","Merge Col AB","C","Merge Col DE","Merge Col DE","F", "G", "H"],
            // prettier-ignore
            ["Merge Row Aval12", "Bval", "Cval","Merge Row Dval12","Eval1","Merge Row Fval12", "Gval1", "Hval1"],
            // prettier-ignore
            ["Merge Row Aval12", "Bval2", "Cval2", "Merge Row Dval12","Eval2","Merge Row Fval12", "Merge Col GH","Merge Col GH"],
        ]);
    });

    it("is able to handle both merged cols and merged rows across more than 2 rows/cols", () => {
        const processedTable = splitMergedCells(
            [
                ["Merge Col ABC", "D"],
                ["Merge Row Aval123", "Bval", "Cval", "Dval"],
                ["Bval2", "Cval2", "Dval2"],
                ["Bval3", "Cval3", "Dval3"],
            ],
            [
                [
                    [525, 1],
                    [174, 1],
                ],
                [
                    [173, 3],
                    [174, 1],
                    [174, 1],
                    [174, 1],
                ],
                [
                    [173, 1],
                    [174, 1],
                    [174, 1],
                ],
                [
                    [173, 1],
                    [174, 1],
                    [174, 1],
                ],
            ]
        );

        expect(processedTable).toStrictEqual([
            ["Merge Col ABC", "Merge Col ABC", "Merge Col ABC", "D"],
            ["Merge Row Aval123", "Bval", "Cval", "Dval"],
            ["Merge Row Aval123", "Bval2", "Cval2", "Dval2"],
            ["Merge Row Aval123", "Bval3", "Cval3", "Dval3"],
        ]);
    });
});
