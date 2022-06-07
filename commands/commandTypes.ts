import { Message} from "discord.js"

export interface CustomCommand {
    name: String;
    usage: String;
    description: String;
    restricted?: boolean;
    action: (msg: Message<boolean>, cmdArgs: String[]) => void;
}
