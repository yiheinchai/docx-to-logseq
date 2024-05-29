import {
    ImageNoteToLogseq,
    TableNoteToLogseq,
    TextNoteToLogseq,
    formatImageInTableNote,
    getMaxRowsMaxCols,
    markdownTable,
    getTableMetadata,
    splitMergedCells,
    getPropByString,
    parseDirectoryPage,
    noteToLogseqByPage,
    findClosestPTag,
    styleTextInTable,
} from "../src/LogseqParser";
import { TableNote } from "../types/types";
import {
    mockHtml2,
    mockHtml_table_image,
    mockHtml_table_merge_cols,
    mockHtml_table_merge_rows,
    mockHtml_table_real,
    mockHtml_table_text,
    mockHtml_table_text_bold_underline,
    mockImageNote,
    mockTextNote,
    mockTextNote_bold,
    mockTextNote_underline,
} from "./mocks";

describe("findPTag", () => {
    it("is able to find p tag html based on search string", () => {
        const html = findClosestPTag(mockHtml2, "FHMP");
        console.log(html);
        expect(html).toBe(
            '<p class="MsoTitle"> <a name="_Toc95808416"></a><a name="_Toc102616402"><span lang="EN-US">FHMP</span></a> </p>'
        );
    });
});

describe("styleTextInTable", () => {
    it("is able to style text correctly", () => {
        const styledTable = styleTextInTable(
            [[["Structure"], ["Function"]]],
            mockHtml_table_text_bold_underline
        );
        expect(styledTable).toStrictEqual([
            [["**Structure**"], ["<u>Function</u>"]],
        ]);
    });
});

describe("TextNoteToLogseq", () => {
    it("should return the correct string", () => {
        const logseqNote = TextNoteToLogseq(mockTextNote, 0);

        expect(logseqNote).toBe("\t\t\t\t- logseq is cool");
    });

    it("should handle bolds", () => {
        const logseqNote = TextNoteToLogseq(mockTextNote_bold, 0);

        expect(logseqNote).toBe("\t\t\t\t- **Adhesion:**");
    });

    it("should handle underlines", () => {
        const logseqNote = TextNoteToLogseq(mockTextNote_underline, 0);

        expect(logseqNote).toBe("\t\t\t\t- <u>Mechanism of Action: </u>");
    });
});

describe("ImageNoteToLogseq", () => {
    it("should return the correct string", () => {
        const logseqNote = ImageNoteToLogseq(mockImageNote, 0);

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

        expect(markdown).toBe(
            `|header1|header2|\n|value1|value2|\nlogseq.table.version:: 2`
        );
    });

    it("is able to handle table with double lines", () => {
        const markdown = markdownTable([
            ["header1", "header2"],
            ["value1\nvalue1 information", "value2"],
        ]);

        expect(markdown).toBe(
            `|header1|header2|\n|value1[:br]value1 information|value2|\nlogseq.table.version:: 2`
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
    it("works for a real table", () => {
        const parsedTable = getTableMetadata(mockHtml_table_real);
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

describe("getPropByString", () => {
    it("is able to extract nested values", () => {
        const val = getPropByString(
            {
                text: "level1",
                children: [{ text: "level2", children: [{ text: "level3" }] }],
            },
            "children.0.children.0.text"
        );

        expect(val).toBe("level3");
    });
});

describe("parseDirectoryPage", () => {
    it("should output the right format", () => {
        const page = parseDirectoryPage({
            text: "FHMP",
            html: "",
            path: "",
            children: [
                { text: "Anatomy", children: [], html: "", path: "" },
                { text: "Biochemistry", children: [], html: "", path: "" },
            ],
        });

        expect(page).toBe("- [[Anatomy]]\n- [[Biochemistry]]");
    });

    it("should be able to handle deeper depths", () => {
        const page = parseDirectoryPage(
            {
                text: "FHMP",
                html: "",
                path: "",
                children: [
                    {
                        text: "Anatomy",
                        children: [
                            {
                                text: "[001]: Introduction to Anatomy",
                                path: "",
                                children: [],
                                html: "",
                            },
                        ],
                        html: "",
                        path: "",
                    },
                    {
                        text: "Biochemistry",
                        children: [
                            {
                                text: "[012]: Introduction to Biochemistry",
                                path: "",
                                children: [],
                                html: "",
                            },
                        ],
                        html: "",
                        path: "",
                    },
                ],
            },
            2
        );

        expect(page).toBe(
            "- [[Anatomy]]\n\t- [[[001]: Introduction to Anatomy]]\n- [[Biochemistry]]\n\t- [[[012]: Introduction to Biochemistry]]"
        );
    });
});

describe("noteToLogseqByPage", () => {
    it("should generate the pages correctly", () => {
        const pages = noteToLogseqByPage({
            path: "",
            children: [
                {
                    text: "FHMP",
                    html: "",
                    path: "",
                    children: [
                        {
                            text: "Anatomy",
                            children: [
                                {
                                    text: "[001]: Introduction to Anatomy",
                                    path: "",
                                    children: [],
                                    html: "",
                                },
                            ],
                            html: "",
                            path: "",
                        },
                        {
                            text: "Biochemistry",
                            children: [
                                {
                                    text: "[012]: Introduction to Biochemistry",
                                    path: "",
                                    children: [],
                                    html: "",
                                },
                            ],
                            html: "",
                            path: "",
                        },
                    ],
                },
                {
                    text: "I&D",
                    html: "",
                    path: "",
                    children: [
                        {
                            text: "Immunology",
                            children: [
                                {
                                    text: "[001]: Introduction to Immunology",
                                    path: "",
                                    children: [],
                                    html: "",
                                },
                            ],
                            html: "",
                            path: "",
                        },
                    ],
                },
            ],
        });

        expect(pages).toStrictEqual([
            {
                pageTitle: "Year 1 MBBS Notes",
                pageContent: "- [[FHMP]]\n- [[I&D]]",
            },
            {
                pageTitle: "FHMP",
                pageContent:
                    "- [[Anatomy]]\n\t- [[[001]: Introduction to Anatomy]]\n- [[Biochemistry]]\n\t- [[[012]: Introduction to Biochemistry]]",
            },
            {
                pageTitle: "I&D",
                pageContent:
                    "- [[Immunology]]\n\t- [[[001]: Introduction to Immunology]]",
            },
            { pageTitle: "[001]: Introduction to Anatomy", pageContent: "" },
            {
                pageTitle: "[012]: Introduction to Biochemistry",
                pageContent: "",
            },
            { pageTitle: "[001]: Introduction to Immunology", pageContent: "" },
        ]);
    });
});
