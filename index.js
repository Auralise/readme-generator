// TODO: Include packages needed for this application
const inquirer = require("inquirer");
// const fs = require("fs");
const mdGen = require("./utils/generateMarkdown.js");
const { writeFile, mkdir } = require("fs/promises");
const { existsSync } = require("fs");


// TODO: Create an array of questions for user input
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
            //Regex matches a pattern of (alphanumeric) then if there is a single . or - or _ then require some text
            //it matches a single domain name followed by .com .net or .org (for simplicity"s sake) 
            //followed by an optional two letter country code such as .au
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
            return input.length === 0 ? "Github link can not be blank" : true;
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
        type: "input",
        message: "Please enter a brief description of your project:",
        name: "description",
        validate: input => {
            return input.length < 2 ? "Please enter a useful description of the project." : true;
        },
    },
    {
        type: "input",
        message: "Please describe the installation process for your project:",
        name: "installation",
        //default: `1. \n2. \n3. `,
        validate: input => {
            return input.split(" ").length < 3 ? "Please give provide a better description of the installation process for your project (more than 3 words). Please try again..." : true;
        },
    },
    {
        type: "input",
        message: "Provide some usage examples for your project:",
        name: "usage",
        // default: `\`\`\`\n\n\`\`\``,
        validate: input => {
            return input.split(" ").length < 3 ? "Please give more comprehensive examples " : true;
        }
    },
    {
        type: "input",
        message: "Provide an overview of how to test the application:",
        name: "tests"
    },
    {
        type: "input",
        message: "Name your project collaborators, separated with commas:",
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
        type: "input",
        message: "Describe the contribution guidelines for the project:",
        name: "contribute",
    },


];

const checkFilePath = path => existsSync(path) ? true : false;

// TODO: Create a function to write README file
const writeToFile = async (filePath, data) => {
    let path = filePath.split("/");
    let fileName = path.pop();
    //If absolute path, starting with /
    !path[0] ? path = `/${path.join("/")}`: path = path.join("/");

    if(checkFilePath(path)){
        try {
            await writeFile(fileName, data);
            console.log(`Successfully wrote file as ${fileName}`);
        }
        catch (err) {
            console.error(`Failed to write file\nError text: ${err}`);
        }
    }
    else {
        try {
            await mkdir(path, {recursive: true});
            console.log(`Successfully created path: ${path}`);
            await writeFile(fileName, data);
            console.log(`Successfully wrote file as ${fileName}`);
        }
        catch (err) {
            console.error(`Failed to write file\nError text: ${err}`);
        }
    }
 }

// TODO: Create a function to initialize app
function init() {
    inquirer.prompt(questions)
        .then(answers => {
            writeToFile(`./output/${answers.title}-README.md`, mdGen(answers))
        })
}

// Function call to initialize app
init();
