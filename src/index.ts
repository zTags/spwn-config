// ignore this
const templates = {
    "config": "{\n   \"entry\": \"src/main.spwn\",\n   \"flags\": [\n        [\"\", \"\"]\n   ]\n}",
    "spwnenv": "// TODO actually make this",
    "helloWorld": "$.print(\"Hello World!\")"
}
// ok you can start reading now

async function setup() {
    try {
        const configFolder = await Deno.mkdir("spwncfg");
    } catch (e) {
        if (e.toString().startsWith("AlreadyExists")) {
            console.log("there was already an initalized .spwncfg here");
        } else {
            console.log("error:");
            console.log(e);
        }
        Deno.exit(1);
    }
    const source = await Deno.mkdir("src");
    const libs = await Deno.mkdir("libs");

    const configFile = await Deno.writeTextFile("spwncfg/config.json", templates.config);
    const scfgenv = await Deno.writeTextFile("spwncfg/spwnenv.json", "# KEY = VALUE\n");
    const mainspwn = Deno.writeTextFile("src/main.spwn", templates.helloWorld);
    const spwnenvFile = await Deno.writeTextFile("libsspwnenv.spwn", templates.spwnenv);
}

async function help() {
    console.log("spwnconfig v0.1.0");
    console.log("init - initialises a .spwncfg folder in your CWD");
    console.log("run - runs a spwn file with your arguments in your .spwncfg");
    console.log("");
}

async function run() {
    let spwnCommand = "spwn build ";
    const config = await Deno.readTextFile("./.spwncfg/config.json");
    const configAsJSON = JSON.parse(config);

    configAsJSON.flags.forEach((element: any) => {
        spwnCommand = spwnCommand + element[0] + " " + element[1];
    });

    spwnCommand = spwnCommand + " " + configAsJSON.entry;

    console.log(spwnCommand);
}

async function main() {
    switch (Deno.args[0]) {
        case "setup":
            setup();
            break;
        case "run":
            run();
            break;
        case "help":
            help();
            break;
        default:
            console.log("unknown command");
            help();
            break;
    }
}

main()