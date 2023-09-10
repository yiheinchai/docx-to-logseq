import { ImageNoteToString, TextNoteToString } from "../src/LogseqParser";
import { mockImageNote, mockTextNote } from "./mocks";

describe("TextNoteToString", () => {
    it("should return the correct string", () => {
        const logseqNote = TextNoteToString(mockTextNote);

        expect(logseqNote).toBe("\t\t\t\t- logseq is cool");
    });
});

describe("ImageNoteToString", () => {
    it("should return the correct string", () => {
        const logseqNote = ImageNoteToString(mockImageNote);

        expect(logseqNote).toBe(
            "\t\t\t\t- ![image.png](../assets/muskies/elon.png){:height 420, :width 69} ![image.png](../assets/baldie/bezos.png){:height 666, :width 666}"
        );
    });
});
