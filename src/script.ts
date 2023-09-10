import { htmlToJS } from "./HTMLParser";
import { noteToLogseq } from "./LogseqParser";

function handleFileSelect(event: Event) {
    // Get the selected file from the input element
    const file = (event.target as HTMLInputElement).files[0];
    // Check if the file is a HTML file
    if (file.type === "text/html") {
        // Display the file name on the page
        document.getElementById("file-name").textContent = file.name;
        // Enable the convert button
        (
            document.getElementById("convert-button") as HTMLButtonElement
        ).disabled = false;
    } else {
        // Display an error message on the page
        document.getElementById("file-name").textContent =
            "Please select a valid HTML file.";
        // Disable the convert button
        (
            document.getElementById("convert-button") as HTMLButtonElement
        ).disabled = true;
    }
}

// This function converts the HTML file to JSON and creates a download link
function convertFile() {
    // Get the selected file from the input element
    const file = (document.getElementById("file-input") as HTMLInputElement)
        .files[0];
    // Create a file reader object
    const reader = new FileReader();
    // Define a callback function for when the file is loaded
    reader.onload = function (event) {
        // Get the file content as a string
        const html = event.target.result as string;
        // Parse the HTML string into a DOM tree
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        // Convert the DOM tree to a JSON object
        const json = domToJson(doc);
        // // Convert the JSON object to a string
        // const jsonString = JSON.stringify(json, null, 2);
        // // Create a blob object from the JSON string
        // // const blob = new Blob([jsonString], { type: "application/json" });
        // const jsonBlob = new Blob([jsonString], { type: "application/json" });
        // // Create a URL for the blob object
        // const url = URL.createObjectURL(jsonBlob);
        // // Get the download link element from the page
        // const link = document.getElementById(
        //     "download-link"
        // ) as HTMLAnchorElement;
        // // Set the href attribute of the link to the blob URL
        // link.href = url;
        // // Set the download attribute of the link to the file name with .json extension
        // link.download = file.name.replace(".html", ".json");
        // // Show the download link on the page
        // link.classList.remove("hidden");

        const logseqNote = noteToLogseq(json);
        const logseqBlob = new Blob([logseqNote], { type: "text/plain" });
        // Create a URL for the blob object
        const url = URL.createObjectURL(logseqBlob);
        // Get the download link element from the page
        const link = document.getElementById(
            "download-link"
        ) as HTMLAnchorElement;
        // Set the href attribute of the link to the blob URL
        link.href = url;
        // Set the download attribute of the link to the file name with .json extension
        link.download = file.name.replace(".html", ".md");
        // Show the download link on the page
        link.classList.remove("hidden");
    };
    // Read the file as a text string
    reader.readAsText(file);
}

function domToJson(html) {
    const output = html.querySelector(".WordSection1");
    const result = htmlToJS(Array.from(output.children) as HTMLElement[]);
    return result;
}

function hydrateButtons() {
    const convertButton = document.querySelector(
        "#convert-button"
    ) as HTMLElement;
    convertButton.onclick = convertFile;

    const fileInput = document.querySelector("#file-input") as HTMLElement;
    fileInput.onchange = handleFileSelect;

    const downloadLink = document.querySelector(
        "#download-link"
    ) as HTMLElement;
    downloadLink.onclick = () => downloadLink.classList.add("hidden");
}

hydrateButtons();
