// ignore this
const templates = {
    "config": "{\n   \"entry\": \"src/main.spwn\",\n   \"flags\": [\n        [\"--allow\", \"readfile\"]\n   ]\n}",
    "spwnenv_lib": 'let getKey = (key: @string) {let spwnenv = $.readfile("../spwncfg/spwnenv");let typeOfKey = "";let keyValue = "";for keyLine in spwnenv.split("\\n") {if !keyLine.starts_with("#") {if keyLine.starts_with(key) {for keyCharacter in keyLine.split("") {if typeOfKey != "" {if typeOfKey == "string" {if keyCharacter == "\\"" {break;} else {keyValue = keyValue + keyCharacter;}} else if typeOfKey == "number" {keyValue = keyLine.replace(key + " =", ""); keyValue = keyValue.trim();}}; if keyCharacter == "\\"" {typeOfKey = "string";} else if keyCharacter.isdigit() {typeOfKey = "number";}}}}};return keyValue;};return { getKey };',
    "helloWorld": 'let spwnenv = import "../libs/spwnenv.spwn";\n\n$.print(spwnenv.getKey("NUMBER"));\n$.print(spwnenv.getKey("STRING"));',
    "spwnenv": "# KEY = VALUE\nNUMBER = 69\nSTRING = \"nice\"\n"
}
// ok you can start reading now

async function setup() {
    try {
        const configFolder = await Deno.mkdir("spwncfg");
    } catch (e) {
        if (e.toString().startsWith("AlreadyExists")) {
            console.log("there was already an initalized spwncfg here");
        } else {
            console.log("error:");
            console.log(e);
        }
        Deno.exit(1);
    }
    const source = await Deno.mkdir("src");
    const libs = await Deno.mkdir("libs");

    const configFile = await Deno.writeTextFile("spwncfg/config.json", templates.config);
    const scfgenv = await Deno.writeTextFile("spwncfg/spwnenv", templates.spwnenv);
    const mainspwn = Deno.writeTextFile("src/main.spwn", templates.helloWorld);
    const spwnenvFile = await Deno.writeTextFile("libs/spwnenv.spwn", templates.spwnenv_lib);

    console.log("Initialized a spwnenv in %s", Deno.cwd());
}

async function help() {
    console.log("spwnconfig v0.1.0");
    console.log("init - initialises a .spwncfg folder in your CWD");
    console.log("run - runs a spwn file with your arguments in your .spwncfg");
    console.log("");
}

async function run() {
    const textDecoder = new TextDecoder();
    let spwnCommand: string[] = ["spwn"];
    const config = await Deno.readTextFile("./spwncfg/config.json");
    const configAsJSON = JSON.parse(config);


    spwnCommand.push("build");
    spwnCommand.push(configAsJSON.entry);

    configAsJSON.flags.forEach((element: any) => {
        spwnCommand.push(element[0]);
        spwnCommand.push(element[1]);
    });
    const p = Deno.run({ cmd: spwnCommand, stdout: "piped", stderr: "piped"});
    const [status, stdout, stderr] = await Promise.all([
        p.status(),
        p.output(),
        p.stderrOutput()
      ]);
    p.close();
    console.log("--- stdout ---\n%s\n\n--- stderr ---\n%s", textDecoder.decode(stdout), textDecoder.decode(stderr));
}

async function newProj(name: string) {
    if (name == undefined) {
        console.log("please provide a name argument (spwnconfig new name)");
    } else {
        await Deno.mkdir(name);
        Deno.chdir(name);
        setup();
    }
}

async function main() {
    switch (Deno.args[0]) {
        case "init":
        case "initialize":
        case "setup":
            setup();
            break;
        case "new":
            newProj(Deno.args[1]);
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