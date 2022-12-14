// Required pacakages and functionality
const inquirer = require("inquirer");
const mdGen = require("./utils/generateMarkdown.js");
const { writeFile, mkdir } = require("fs/promises");
const { existsSync } = require("fs");

const questions = [
    {
        type: "input",
        message: "Please enter your full name (for copyright marks):",
        name: "name",
        validate: input => {
            return input.length < 1 ? "Please enter a valid name" : true;
        }
    },
    {
        type: "input",
        message: "Please enter your email address:",
        name: "email",
        validate: input => {
            if (input.length === 0) {
                return "Please enter an email";
            }
            //Regex matches a pattern of (alphanumeric) then if there is a single . or - or _ then requires additonal alphanumeric text before the @ symbol
            //it matches a single domain name followed by .com .net or .org (for simplicity's sake - I could theoretically extend this to meet all possible other addresses) 
            //This is followed by an optional two letter country code such as .au
            //matching is case insensitive
            else if (!input.match(/^[a-z0-9]+(?:[._-][a-z0-9]+|[a-z0-9]*)*@[a-z0-9]+\.(?:(com)|(org)|(net))(?:.[a-z]{2,2})?$/i)) {
                return "Please enter a valid email address.";
            }
            else {
                return true;
            }
        }
    },
    {
        type: "input",
        message: "Provide your Github username:",
        name: "github",
        validate: input => {
            return input.length < 1 ? "Github link can not be blank" : true;
        }

    },
    {
        type: "input",
        message: "Title of project:",
        name: "title",
        validate: input => {
            return input.length < 3 ? "Title can not be less than 3 characters." : true;

        },
    },
    {
        type: "editor",
        message: "Please enter a brief description of your project:",
        name: "description",
        validate: input => {
            return input.length < 2 ? "Please enter a useful description of the project." : true;
        },
    },
    {
        type: "editor",
        message: "Please describe the installation process for your project:",
        name: "installation",
        default: `1. \n2. \n3. `,
        validate: input => {
            return input.split(" ").length < 3 ? "Please give provide a better description of the installation process for your project (more than 3 words)" : true;
        },
    },
    {
        type: "editor",
        message: "Provide some usage examples for your project:",
        name: "usage",
        default: `\`\`\`\n\n\`\`\``,
        validate: input => {
            return input.split(" ").length < 3 ? "Please give more comprehensive examples " : true;
        }
    },
    {
        type: "editor",
        message: "Provide an overview of how to test the application:",
        name: "tests",
    },
    {
        type: "input",
        message: "Name your project contributors, separated with commas:",
        name: "collaborators",
    },
    {
        type: "input",
        message: "List the technologies that you used in the project, separated with commas:",
        name: "tech",
        validate: input => {
            return input.trim().split(",") < 1 ? "Please enter at least one technology" : true;
        }
    },
    {
        type: "list",
        message: "Select a licence to apply to the project:",
        name: "licence",
        choices: [
            "Apache Licence 2.0",
            "GNU GPL 3.0",
            "MIT Licence",
            "BSD 2-Clause 'simplified' Licence",
            "BSD 3-Clause 'new' Licence",
            "Mozilla Public Licence 2.0",
            "No Licence",
        ],
    },
    {
        type: "editor",
        message: "Describe the contribution guidelines for the project:",
        name: "contribute",
    },
    {
        type: "input",
        message: "What directory do you want to write the output to? Leave blank to use default (./output/title/README.md): ",
        name: "targetDir",
        validate: input => {
            if (input.substring(0, 2) !== "./" && input.charAt(0) !== "/" || input.length === 0) {
                //I have deliberately chosen to not support immediate path traversal by allowing ../
                // This can be done with ./../.. for example
                return "Please enter a valid unix-style file path starting with ./ (relative to index.js) or / (absolute)";
            }
            else {
                return true;
            }
        }

    }


];

const fileCheck = [{
    type: "input",
    message: "File already exists, do you want to overwrite? (y for yes, n for no) ",
    name: "overwrite",
    validate: input => {
        if (input.toLowerCase() !== "y" && input.toLowerCase() !== "n") {
            return "Please answer y or n"
        } else {
            return true;
        }
    }
}]

const checkPath = path => existsSync(path) ? true : false;

// TODO: Create a function to write README file
const writeToFile = async (path, data) => {
    let directory = path.split("/").slice(0, -1);

    //If absolute path, starting with / leaving index 0 after splitting to be blank
    !directory[0] ? directory = `/${directory.join("/")}` : directory = directory.join("/");

    if (checkPath(directory)) {
        try {
            //Check if file already exists
            if (checkPath(path)) {
                // Ask the user how they want to handle the filename conflict
                // Using Async await here for practice
                const fileAction = await inquirer.prompt(fileCheck);

                switch (fileAction.overwrite.toLowerCase()) {
                    case 'y':
                        await writeFile(path, data);
                        console.log(`Successfully overwrote file ${path}`);
                        break;
                    case 'n':
                        throw new Error(`User aborted file write`);
                }
            }
            else {
                await writeFile(path, data);
                console.log(`Successfully wrote file as ${path}`);
            }
        }
        catch (err) {
            console.error(`Failed to write file\nError text: ${err}`);
        }
    }
    else {
        try {
            //Recursively create directory path
            await mkdir(directory, { recursive: true });
            console.log(`Successfully created path: ${directory}`);
            await writeFile(path, data);
            console.log(`Successfully wrote file as ${path}`);


        }
        catch (err) {
            console.error(`Failed to write file\nError text: ${err}`);
        }
    }
}

// TODO: Create a function to initialize app
const init = () => {
    inquirer.prompt(questions)
        .then(answers => {

            let { targetDir } = answers;

            if (targetDir.length !== 1 && targetDir.charAt(targetDir.length - 1) === "/") {
                //If not targeting root (/), normalise file path by removing trailing slashes
                targetDir = targetDir.slice(0, targetDir.length - 1)
            }
            //User can only ever write README.md files to avoid security issues
            writeToFile(`${targetDir}/README.md`, mdGen(answers))
        })
}

// Function call to initialize app
init();
